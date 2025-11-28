using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedriveDealNotesCreateFunction
{
    private readonly ILogger<PipedriveDealNotesCreateFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly FeatureFlagsSettings featureFlagsSettings;

    public PipedriveDealNotesCreateFunction(
        ILogger<PipedriveDealNotesCreateFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        HttpRequestLogger httpRequestLogger,
        IOptions<FeatureFlagsSettings> featureFlagsSettings)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.httpRequestLogger = httpRequestLogger;
        this.featureFlagsSettings = featureFlagsSettings.Value;
    }

    [Function("PipedriveDealNotesCreate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "pipedrive/notes/deal")] HttpRequestData req)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("PipedriveDealNotesCreate function triggered");

        try
        {
            // Extract and validate Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("Missing Authorization header");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("Invalid Authorization header format");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);

            // Retrieve session from database
            var session = await sessionService.GetSessionAsync(verificationCode);
            if (session == null)
            {
                logger.LogWarning("Invalid or expired verification code");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            // Check feature flag
            if (!featureFlagsSettings.EnableDeals)
            {
                logger.LogWarning("PipedriveDealNotesCreate blocked: Deals feature is disabled");
                var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
                await forbiddenResponse.WriteAsJsonAsync(new { error = "Deals feature is not enabled" });
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.Forbidden, new { error = "Deals feature is not enabled" });
                return forbiddenResponse;
            }

            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("Empty request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Request body is required");
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.BadRequest, "Request body is required");
                return badRequestResponse;
            }

            CreateDealNoteRequest? createRequest;
            try
            {
                createRequest = JsonSerializer.Deserialize<CreateDealNoteRequest>(requestBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "Malformed JSON in request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid request body");
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.BadRequest, "Invalid request body");
                return badRequestResponse;
            }

            if (createRequest == null)
            {
                logger.LogWarning("Invalid request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid request body");
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.BadRequest, "Invalid request body");
                return badRequestResponse;
            }

            // Validate required fields
            if (createRequest.DealId <= 0)
            {
                logger.LogWarning("Invalid dealId: {DealId}", createRequest.DealId);
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("DealId must be greater than 0");
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.BadRequest, "DealId must be greater than 0");
                return badRequestResponse;
            }

            if (string.IsNullOrWhiteSpace(createRequest.Content))
            {
                logger.LogWarning("Missing or empty content");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Content is required");
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.BadRequest, "Content is required");
                return badRequestResponse;
            }

            // Call Pipedrive API
            logger.LogInformation(
                "Creating note in Pipedrive: dealId={DealId}, contentLength={Length}",
                createRequest.DealId,
                createRequest.Content.Length
            );

            var pipedriveResponse = await pipedriveApiClient.CreateNoteAsync(
                session,
                createRequest.Content,
                dealId: createRequest.DealId
            );

            if (pipedriveResponse.Data == null)
            {
                logger.LogError("Pipedrive returned null data");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.InternalServerError);
                return errorResponse;
            }

            logger.LogInformation("Note created successfully: id={NoteId}", pipedriveResponse.Data.Id);

            // Return 201 Created with empty body
            var response = req.CreateResponse(HttpStatusCode.Created);
            httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.Created);
            return response;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "Token refresh failed - session_expired");
            var response = req.CreateResponse(HttpStatusCode.Unauthorized);
            var errorBody = new { error = "session_expired", message = "Refresh token expired, please sign in again" };
            await response.WriteAsJsonAsync(errorBody);
            httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.Unauthorized, errorBody);
            return response;
        }
        catch (PipedriveRateLimitException)
        {
            logger.LogWarning("Pipedrive rate limit exceeded");
            var rateLimitResponse = req.CreateResponse((HttpStatusCode)429);
            httpRequestLogger.LogResponse("PipedriveDealNotesCreate", 429);
            return rateLimitResponse;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating note in Pipedrive");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            httpRequestLogger.LogResponse("PipedriveDealNotesCreate", (int)HttpStatusCode.InternalServerError);
            return errorResponse;
        }
    }
}
