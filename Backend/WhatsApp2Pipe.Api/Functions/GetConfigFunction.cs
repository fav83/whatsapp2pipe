using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class GetConfigFunction
{
    private readonly ILogger<GetConfigFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IConfiguration configuration;
    private readonly HttpRequestLogger httpRequestLogger;

    public GetConfigFunction(
        ILogger<GetConfigFunction> logger,
        ISessionService sessionService,
        IConfiguration configuration,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.configuration = configuration;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("GetConfig")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "config")]
        HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("Config request received");

        try
        {
            // 1. Extract and validate Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("Missing Authorization header");
                return CreateUnauthorizedResponse(req);
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Invalid Authorization header format");
                return CreateUnauthorizedResponse(req);
            }

            var verificationCode = authHeader.Substring("Bearer ".Length).Trim();

            // 2. Validate session
            var session = await sessionService.GetSessionAsync(verificationCode);
            if (session == null || session.SessionExpiresAt < DateTime.UtcNow)
            {
                logger.LogWarning("Invalid or expired session");
                return CreateUnauthorizedResponse(req);
            }

            // 3. Get config message from configuration
            var configMessage = configuration["ConfigMessage"];

            // 4. Return config (null if not set)
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new
            {
                message = configMessage
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));
            httpRequestLogger.LogResponse("GetConfig", (int)HttpStatusCode.OK, responseBody);

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process config request");
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Internal server error");
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
        httpRequestLogger.LogResponse("GetConfig", (int)HttpStatusCode.Unauthorized, errorBody);

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
        httpRequestLogger.LogResponse("GetConfig", (int)statusCode, errorBody);

        return response;
    }
}
