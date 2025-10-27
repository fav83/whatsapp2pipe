using System.Net;
using System.Web;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Auth.Models;
using WhatsApp2Pipe.Auth.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Auth.Functions;

public class AuthCallbackFunction
{
    private readonly ITableStorageService tableStorageService;
    private readonly IOAuthService oauthService;
    private readonly ILogger<AuthCallbackFunction> logger;

    public AuthCallbackFunction(
        ITableStorageService tableStorageService,
        IOAuthService oauthService,
        ILogger<AuthCallbackFunction> logger)
    {
        this.tableStorageService = tableStorageService;
        this.oauthService = oauthService;
        this.logger = logger;
    }

    [Function("AuthCallback")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/callback")] HttpRequestData req)
    {
        logger.LogInformation("AuthCallback endpoint called");

        try
        {
            // Parse query parameters
            var query = HttpUtility.ParseQueryString(req.Url.Query);
            var code = query["code"];
            var state = query["state"];
            var error = query["error"];

            // Check for OAuth errors
            if (!string.IsNullOrEmpty(error))
            {
                logger.LogWarning("OAuth error received: {Error}", error);
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "oauth_error",
                    $"Authorization failed: {error}");
            }

            // Validate required parameters
            if (string.IsNullOrEmpty(code))
            {
                logger.LogWarning("Missing authorization code");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "missing_code",
                    "Authorization code is missing");
            }

            if (string.IsNullOrEmpty(state))
            {
                logger.LogWarning("Missing state parameter");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "missing_state",
                    "State parameter is missing");
            }

            // Validate state (CSRF protection)
            var isStateValid = await tableStorageService.ValidateAndConsumeStateAsync(state);
            if (!isStateValid)
            {
                logger.LogWarning("Invalid or expired state: {State}", state);
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "invalid_state",
                    "Invalid or expired state parameter");
            }

            // Exchange authorization code for tokens
            PipedriveTokenResponse tokenResponse;
            try
            {
                tokenResponse = await oauthService.ExchangeCodeForTokensAsync(code);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Token exchange failed");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "token_exchange_failed",
                    "Failed to exchange authorization code for tokens");
            }

            // Create session in Table Storage
            var session = await tableStorageService.CreateSessionAsync(
                tokenResponse.AccessToken,
                tokenResponse.RefreshToken,
                tokenResponse.ApiDomain,
                tokenResponse.ExpiresIn);

            // Return verification code to client
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new AuthCallbackResponse
            {
                VerificationCode = session.VerificationCode,
                ExpiresAt = session.SessionExpiresAt
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));

            logger.LogInformation("AuthCallback completed successfully, verification_code: {VerificationCode}",
                session.VerificationCode);

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in AuthCallback endpoint");
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "internal_error",
                "An internal error occurred while processing the callback");
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
