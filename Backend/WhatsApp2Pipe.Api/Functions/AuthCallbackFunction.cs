using System.Net;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class AuthCallbackFunction
{
    private readonly ITableStorageService tableStorageService;
    private readonly IOAuthService oauthService;
    private readonly OAuthStateValidator stateValidator;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly IUserService userService;
    private readonly ILogger<AuthCallbackFunction> logger;

    public AuthCallbackFunction(
        ITableStorageService tableStorageService,
        IOAuthService oauthService,
        OAuthStateValidator stateValidator,
        IPipedriveApiClient pipedriveApiClient,
        IUserService userService,
        ILogger<AuthCallbackFunction> logger)
    {
        this.tableStorageService = tableStorageService;
        this.oauthService = oauthService;
        this.stateValidator = stateValidator;
        this.pipedriveApiClient = pipedriveApiClient;
        this.userService = userService;
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
            var query = QueryHelpers.ParseQuery(req.Url.Query);
            var code = query.TryGetValue("code", out var codeValue) ? codeValue.ToString() : null;
            var state = query.TryGetValue("state", out var stateValue) ? stateValue.ToString() : null;
            var error = query.TryGetValue("error", out var errorValue) ? errorValue.ToString() : null;

            // Check for OAuth errors
            if (!string.IsNullOrEmpty(error))
            {
                logger.LogError("OAuth error received: {Error}", error);
                return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, error);
            }

            // Validate required parameters
            if (string.IsNullOrEmpty(code))
            {
                logger.LogError("Missing authorization code");
                return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, "missing_code");
            }

            if (string.IsNullOrEmpty(state))
            {
                logger.LogError("Missing state parameter");
                return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, "missing_state");
            }

            // Decode state to extract extension ID
            logger.LogInformation("Decoding state parameter");
            var stateData = stateValidator.DecodeState(state);

            if (stateData == null || string.IsNullOrEmpty(stateData.ExtensionId))
            {
                logger.LogError("Invalid state - missing extension ID");
                return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, "invalid_state");
            }

            logger.LogInformation("Extracted extension ID: {ExtensionId}", stateData.ExtensionId);

            // Validate state format and timestamp (CSRF protection)
            if (!stateValidator.IsValidStateFormat(state))
            {
                logger.LogError("State validation failed");
                return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, "invalid_state");
            }

            // Verify state was issued by server and consume it (one-time use, prevents replay attacks)
            logger.LogInformation("Validating state against server-issued records");
            if (!await tableStorageService.ValidateAndConsumeStateAsync(state))
            {
                logger.LogError("State validation failed - not issued by server, expired, or already consumed");
                return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, "invalid_state");
            }
            logger.LogInformation("State successfully validated and consumed - CSRF protection verified");

            // Exchange authorization code for tokens
            logger.LogInformation("Exchanging authorization code for tokens");
            PipedriveTokenResponse tokenResponse;
            try
            {
                tokenResponse = await oauthService.ExchangeCodeForTokensAsync(code);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Token exchange failed");
                return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "token_exchange_failed");
            }

            // Create temporary session for /users/me call
            logger.LogInformation("Fetching user profile from Pipedrive");
            var tempSession = new SessionEntity
            {
                AccessToken = tokenResponse.AccessToken,
                RefreshToken = tokenResponse.RefreshToken,
                ApiDomain = tokenResponse.ApiDomain,
                SessionExpiresAt = DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn)
            };

            // Call /users/me to get user profile
            PipedriveUserResponse userResponse;
            try
            {
                userResponse = await pipedriveApiClient.GetCurrentUserAsync(tempSession);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch user profile from Pipedrive");
                return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "user_profile_fetch_failed");
            }

            // Create or update user in database
            logger.LogInformation("Creating or updating user in database");
            User user;
            try
            {
                user = await userService.CreateOrUpdateUserAsync(userResponse.Data);
                logger.LogInformation("User {UserId} processed successfully", user.UserId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create/update user in database");
                return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "user_creation_failed");
            }

            // Generate verification code (session ID)
            logger.LogInformation("Creating session");
            var session = await tableStorageService.CreateSessionAsync(
                tokenResponse.AccessToken,
                tokenResponse.RefreshToken,
                tokenResponse.ApiDomain,
                tokenResponse.ExpiresIn,
                stateData.ExtensionId);

            logger.LogInformation("Session created successfully: {VerificationCode}", session.VerificationCode);

            // Redirect to extension with verification code and userName
            // This URL pattern is recognized by Chrome and closes the popup automatically
            var redirectUrl = $"https://{stateData.ExtensionId}.chromiumapp.org/" +
                            $"?verification_code={Uri.EscapeDataString(session.VerificationCode)}" +
                            $"&userName={Uri.EscapeDataString(user.Name)}" +
                            $"&success=true";

            logger.LogInformation("Redirecting to extension URL");

            var response = req.CreateResponse(HttpStatusCode.Redirect);
            response.Headers.Add("Location", redirectUrl);

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in AuthCallback endpoint");
            return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "internal_error");
        }
    }

    private HttpResponseData CreateHtmlErrorResponse(
        HttpRequestData req,
        HttpStatusCode statusCode,
        string error)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "text/html");

        var html = GenerateErrorHtml(error);
        response.WriteString(html);

        return response;
    }

    private string GenerateErrorHtml(string error)
    {
        var errorMessages = new Dictionary<string, string>
        {
            { "access_denied", "You denied access to the application." },
            { "missing_code", "Authorization code is missing." },
            { "missing_state", "State parameter is missing." },
            { "invalid_state", "Invalid or expired authorization state." },
            { "token_exchange_failed", "Failed to exchange authorization code for tokens." },
            { "user_profile_fetch_failed", "Failed to fetch your user profile from Pipedrive." },
            { "user_creation_failed", "Failed to create user record in database." },
            { "internal_error", "An internal error occurred." }
        };

        var message = errorMessages.ContainsKey(error)
            ? errorMessages[error]
            : "An unknown error occurred.";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <title>Authorization Failed</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }}
        .error-container {{
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
            text-align: center;
        }}
        .error-icon {{
            font-size: 48px;
            margin-bottom: 1rem;
        }}
        h1 {{
            color: #d32f2f;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }}
        p {{
            color: #666;
            margin-bottom: 1.5rem;
        }}
        button {{
            background: #1976d2;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }}
        button:hover {{
            background: #1565c0;
        }}
    </style>
</head>
<body>
    <div class='error-container'>
        <div class='error-icon'>❌</div>
        <h1>Authorization Failed</h1>
        <p>Error: {error}</p>
        <p>{message}</p>
        <p>Please close this window and try again.</p>
        <button onclick='window.close()'>Close Window</button>
    </div>
</body>
</html>";
    }
}
