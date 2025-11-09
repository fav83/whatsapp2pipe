using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

/// <summary>
/// Azure Function for handling user feedback submissions.
/// </summary>
public class FeedbackFunction
{
    private readonly ILogger<FeedbackFunction> logger;
    private readonly ISessionService sessionService;
    private readonly Chat2DealDbContext dbContext;
    private readonly HttpRequestLogger httpRequestLogger;

    public FeedbackFunction(
        ILogger<FeedbackFunction> logger,
        ISessionService sessionService,
        Chat2DealDbContext dbContext,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.dbContext = dbContext;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("Feedback")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "feedback")] HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("[Feedback] Function triggered - Method: {Method}", req.Method);

        try
        {
            // Extract and validate Authorization header
            logger.LogInformation("[Feedback] Step 1: Checking Authorization header");
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("[Feedback] FAILED Step 1: Missing Authorization header");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Missing authorization");
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("[Feedback] FAILED Step 1: Invalid Authorization header format");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid authorization format");
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);
            logger.LogInformation("[Feedback] Step 1 PASSED: Verification code extracted");

            // Retrieve session from database
            logger.LogInformation("[Feedback] Step 2: Retrieving session from database");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null)
            {
                logger.LogWarning("[Feedback] FAILED Step 2: Session not found or expired");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid or expired session");
            }

            logger.LogInformation("[Feedback] Step 2 PASSED: Valid session retrieved - User: {UserId}", session.UserId);

            // Parse request body
            logger.LogInformation("[Feedback] Step 3: Parsing request body");
            string requestBody;
            using (var reader = new StreamReader(req.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }

            FeedbackRequest? feedbackRequest;
            try
            {
                feedbackRequest = JsonSerializer.Deserialize<FeedbackRequest>(requestBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "[Feedback] FAILED Step 3: Invalid JSON in request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request format");
            }

            if (feedbackRequest == null || string.IsNullOrWhiteSpace(feedbackRequest.Message))
            {
                logger.LogWarning("[Feedback] FAILED Step 3: Missing or empty message");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Message is required");
            }

            // Validate message length
            if (feedbackRequest.Message.Length > 10000)
            {
                logger.LogWarning("[Feedback] FAILED Step 3: Message too long - {Length} characters", feedbackRequest.Message.Length);
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Message exceeds maximum length of 10000 characters");
            }

            logger.LogInformation("[Feedback] Step 3 PASSED: Request validated - Message length: {Length}", feedbackRequest.Message.Length);

            // Extract metadata from headers
            req.Headers.TryGetValues("User-Agent", out var userAgentHeaders);
            var userAgent = userAgentHeaders?.FirstOrDefault();

            // Get extension version from request body
            var extensionVersion = feedbackRequest.ExtensionVersion;

            // Create Feedback entity
            logger.LogInformation("[Feedback] Step 4: Creating feedback entity");
            var feedback = new Feedback
            {
                FeedbackEntityId = Guid.NewGuid(),
                UserId = session.UserId,
                Message = feedbackRequest.Message.Trim(),
                CreatedAt = DateTime.UtcNow,
                UserAgent = userAgent?.Length > 500 ? userAgent.Substring(0, 500) : userAgent,
                ExtensionVersion = extensionVersion?.Length > 50 ? extensionVersion.Substring(0, 50) : extensionVersion
            };

            // Save to database
            logger.LogInformation("[Feedback] Step 5: Saving feedback to database");
            dbContext.Feedback.Add(feedback);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("[Feedback] SUCCESS: Feedback saved - FeedbackEntityId: {FeedbackEntityId}, UserId: {UserId}",
                feedback.FeedbackEntityId, session.UserId);

            // Return success response
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            var responseBody = new { success = true };
            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));
            httpRequestLogger.LogResponse("Feedback", (int)HttpStatusCode.OK, responseBody);
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Feedback] EXCEPTION: Error processing feedback submission");
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Internal server error");
        }
    }

    private HttpResponseData CreateErrorResponse(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");
        var errorBody = new { error = message };
        response.WriteString(JsonSerializer.Serialize(errorBody));
        httpRequestLogger.LogResponse("Feedback", (int)statusCode, errorBody);
        return response;
    }

    private class FeedbackRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? ExtensionVersion { get; set; }
    }
}
