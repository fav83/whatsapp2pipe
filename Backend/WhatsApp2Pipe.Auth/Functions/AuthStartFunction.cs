using System.Net;
using System.Web;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Auth.Models;
using WhatsApp2Pipe.Auth.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Auth.Functions;

public class AuthStartFunction
{
    private readonly IOAuthService oauthService;
    private readonly OAuthStateValidator stateValidator;
    private readonly ITableStorageService tableStorageService;
    private readonly ILogger<AuthStartFunction> logger;

    public AuthStartFunction(
        IOAuthService oauthService,
        OAuthStateValidator stateValidator,
        ITableStorageService tableStorageService,
        ILogger<AuthStartFunction> logger)
    {
        this.oauthService = oauthService;
        this.stateValidator = stateValidator;
        this.tableStorageService = tableStorageService;
        this.logger = logger;
    }

    [Function("AuthStart")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/start")] HttpRequestData req)
    {
        logger.LogInformation("AuthStart endpoint called");

        try
        {
            // Extract state parameter from query string
            var query = HttpUtility.ParseQueryString(req.Url.Query);
            var extensionState = query["state"];

            // Validate state parameter is present
            if (string.IsNullOrEmpty(extensionState))
            {
                logger.LogError("Missing required 'state' parameter");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest,
                    "missing_state", "State parameter is required");
            }

            // Validate state format and contents
            if (!stateValidator.IsValidStateFormat(extensionState))
            {
                logger.LogError("Invalid state format");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest,
                    "invalid_state", "State parameter has invalid format");
            }

            // Decode state to log extension ID
            var stateData = stateValidator.DecodeState(extensionState);
            if (stateData != null)
            {
                logger.LogInformation("Received state from extension: {ExtensionId}, nonce: {Nonce}",
                    stateData.ExtensionId, stateData.Nonce);
            }

            // Store the extension-provided state for CSRF validation (5-minute expiration)
            await tableStorageService.StoreStateAsync(extensionState);
            logger.LogInformation("Stored extension state for CSRF protection");

            // Build Pipedrive authorization URL with extension's state
            var authorizationUrl = oauthService.BuildAuthorizationUrl(extensionState);

            logger.LogInformation("Generated Pipedrive OAuth URL with extension state");

            // Return authorization URL to extension
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new AuthStartResponse
            {
                AuthorizationUrl = authorizationUrl
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));

            return response;
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
