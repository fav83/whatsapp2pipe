using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class GetCurrentUserFunction
{
    private readonly ISessionService sessionService;
    private readonly IUserService userService;
    private readonly ILogger<GetCurrentUserFunction> logger;

    public GetCurrentUserFunction(
        ISessionService sessionService,
        IUserService userService,
        ILogger<GetCurrentUserFunction> logger)
    {
        this.sessionService = sessionService;
        this.userService = userService;
        this.logger = logger;
    }

    [Function("GetCurrentUser")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "user/me")] HttpRequestData req)
    {
        logger.LogInformation("GetCurrentUser endpoint called");

        try
        {
            // Extract verification_code from Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaderValues))
            {
                logger.LogError("Missing Authorization header");
                return CreateUnauthorizedResponse(req);
            }

            var authHeader = authHeaderValues.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogError("Invalid Authorization header format");
                return CreateUnauthorizedResponse(req);
            }

            var verificationCode = authHeader.Substring("Bearer ".Length).Trim();

            if (string.IsNullOrEmpty(verificationCode))
            {
                logger.LogError("Empty verification code");
                return CreateUnauthorizedResponse(req);
            }

            // Retrieve session
            logger.LogInformation("Retrieving session for verification code");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null)
            {
                logger.LogError("Session not found for verification code");
                return CreateUnauthorizedResponse(req);
            }

            // Check if session has expired
            if (session.SessionExpiresAt < DateTime.UtcNow)
            {
                logger.LogError("Session has expired");
                return CreateUnauthorizedResponse(req);
            }

            // Retrieve user from database
            logger.LogInformation("Retrieving user {UserId} from database", session.UserId);
            var user = await userService.GetUserByIdAsync(session.UserId);

            if (user == null)
            {
                logger.LogError("User not found for session");
                return CreateErrorResponse(req, HttpStatusCode.NotFound, "User not found");
            }

            // Update last login timestamp
            user.LastLoginAt = DateTime.UtcNow;
            await userService.UpdateUserAsync(user);

            logger.LogInformation("User {UserId} retrieved successfully", user.UserId);

            // Return user info with company details
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new
            {
                id = user.UserId.ToString(),
                name = user.Name,
                email = user.Email,
                pipedriveUserId = user.PipedriveUserId,
                companyDomain = user.Company.CompanyDomain,
                companyName = user.Company.CompanyName,
                createdAt = user.CreatedAt,
                lastLoginAt = user.LastLoginAt
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in GetCurrentUser endpoint");
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "An internal error occurred");
        }
    }

    private HttpResponseData CreateUnauthorizedResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.Unauthorized);
        response.Headers.Add("Content-Type", "application/json");

        var errorBody = new
        {
            error = "Invalid or expired session"
        };

        response.WriteString(JsonSerializer.Serialize(errorBody));

        return response;
    }

    private HttpResponseData CreateErrorResponse(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");

        var errorBody = new
        {
            error = message
        };

        response.WriteString(JsonSerializer.Serialize(errorBody));

        return response;
    }
}
