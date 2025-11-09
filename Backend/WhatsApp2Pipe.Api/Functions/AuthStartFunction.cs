using System.Net;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class AuthStartFunction
{
    private readonly IOAuthService oauthService;
    private readonly OAuthStateValidator stateValidator;
    private readonly ISessionService sessionService;
    private readonly ILogger<AuthStartFunction> logger;
    private readonly HttpRequestLogger httpRequestLogger;

    public AuthStartFunction(
        IOAuthService oauthService,
        OAuthStateValidator stateValidator,
        ISessionService sessionService,
        ILogger<AuthStartFunction> logger,
        HttpRequestLogger httpRequestLogger)
    {
        this.oauthService = oauthService;
        this.stateValidator = stateValidator;
        this.sessionService = sessionService;
        this.logger = logger;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("AuthStart")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/start")] HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("AuthStart endpoint called");

        try
        {
            // Extract state parameter from query string
            var query = QueryHelpers.ParseQuery(req.Url.Query);
            var clientState = query.TryGetValue("state", out var stateValue) ? stateValue.ToString() : null;

            // Validate state parameter is present
            if (string.IsNullOrEmpty(clientState))
            {
                logger.LogError("Missing required 'state' parameter");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest,
                    "missing_state", "State parameter is required");
            }

            // Validate state format and contents
            if (!stateValidator.IsValidStateFormat(clientState))
            {
                logger.LogError("Invalid state format");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest,
                    "invalid_state", "State parameter has invalid format");
            }

            // Decode state to determine client type
            var stateData = stateValidator.DecodeState(clientState);
            if (stateData != null)
            {
                logger.LogInformation("Received state from client type: {Type}, nonce: {Nonce}",
                    stateData.Type, stateData.Nonce);
            }

            // Store the client-provided state for CSRF validation (5-minute expiration)
            await sessionService.StoreStateAsync(clientState);
            logger.LogInformation("Stored client state for CSRF protection");

            // Build Pipedrive authorization URL with client's state
            var authorizationUrl = oauthService.BuildAuthorizationUrl(clientState);

            logger.LogInformation("Generated Pipedrive OAuth URL with client state");

            // Detect client type and respond accordingly
            if (stateData != null && stateData.Type == "web")
            {
                // Website flow - redirect directly to Pipedrive
                logger.LogInformation("Website client - redirecting to Pipedrive OAuth");
                var response = req.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Add("Location", authorizationUrl);
                return response;
            }
            else
            {
                // Extension flow - return JSON with authorization URL
                logger.LogInformation("Extension client - returning JSON response");
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");

                var responseBody = new AuthStartResponse
                {
                    AuthorizationUrl = authorizationUrl
                };

                await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));
                return response;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in AuthStart endpoint");
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError,
                "internal_error", "An internal error occurred while starting the authorization flow");
        }
    }

    private HttpResponseData CreateErrorResponse(
        HttpRequestData req,
        HttpStatusCode statusCode,
        string error,
        string errorDescription)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");

        var errorBody = new ErrorResponse
        {
            Error = error,
            ErrorDescription = errorDescription
        };

        response.WriteString(JsonSerializer.Serialize(errorBody));

        return response;
    }
}
