using System.Net;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class AuthCallbackFunction
{
    private readonly ISessionService sessionService;
    private readonly IOAuthService oauthService;
    private readonly OAuthStateValidator stateValidator;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly IUserService userService;
    private readonly IConfiguration configuration;
    private readonly ILogger<AuthCallbackFunction> logger;

    public AuthCallbackFunction(
        ISessionService sessionService,
        IOAuthService oauthService,
        OAuthStateValidator stateValidator,
        IPipedriveApiClient pipedriveApiClient,
        IUserService userService,
        IConfiguration configuration,
        ILogger<AuthCallbackFunction> logger)
    {
        this.sessionService = sessionService;
        this.oauthService = oauthService;
        this.stateValidator = stateValidator;
        this.pipedriveApiClient = pipedriveApiClient;
        this.userService = userService;
        this.configuration = configuration;
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

            // Decode state first to determine client type (for proper error handling)
            OAuthState? stateData = null;
            if (!string.IsNullOrEmpty(state))
            {
                logger.LogInformation("Decoding state parameter");
                stateData = stateValidator.DecodeState(state);
            }

            // Check for OAuth errors
            if (!string.IsNullOrEmpty(error))
            {
                logger.LogError("OAuth error received: {Error}", error);
                return CreateErrorResponse(req, error, stateData);
            }

            // Validate required parameters
            if (string.IsNullOrEmpty(code))
            {
                logger.LogError("Missing authorization code");
                return CreateErrorResponse(req, "missing_code", stateData);
            }

            if (string.IsNullOrEmpty(state))
            {
                logger.LogError("Missing state parameter");
                return CreateErrorResponse(req, "missing_state", stateData);
            }

            if (stateData == null)
            {
                logger.LogError("Invalid state - failed to decode");
                return CreateErrorResponse(req, "invalid_state", null);
            }

            logger.LogInformation("Extracted client type: {Type}", stateData.Type);

            // Validate state format and timestamp (CSRF protection)
            if (!stateValidator.IsValidStateFormat(state))
            {
                logger.LogError("State validation failed");
                return CreateErrorResponse(req, "invalid_state", stateData);
            }

            // Verify state was issued by server and consume it (one-time use, prevents replay attacks)
            logger.LogInformation("Validating state against server-issued records");
            if (!await sessionService.ValidateAndConsumeStateAsync(state))
            {
                logger.LogError("State validation failed - not issued by server, expired, or already consumed");
                return CreateErrorResponse(req, "invalid_state", stateData);
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
                return CreateErrorResponse(req, "token_exchange_failed", stateData);
            }

            // Create temporary session for /users/me call
            logger.LogInformation("Fetching user profile from Pipedrive");
            var tempSession = new Session
            {
                AccessToken = tokenResponse.AccessToken,
                RefreshToken = tokenResponse.RefreshToken,
                ApiDomain = tokenResponse.ApiDomain,
                ExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn)
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
                return CreateErrorResponse(req, "user_profile_fetch_failed", stateData);
            }

            // Extract invite code from state
            var inviteCode = stateData.InviteCode;

            // Check if user exists in database
            logger.LogInformation("Checking if user exists in database");
            var existingUser = await userService.GetUserByPipedriveIdAsync(
                userResponse.Data.Id,
                userResponse.Data.CompanyId);

            User user;

            if (existingUser != null)
            {
                // EXISTING USER: Update LastLoginAt and proceed normally (invite ignored)
                logger.LogInformation("Existing user {UserId} found, updating LastLoginAt", existingUser.UserId);
                try
                {
                    user = await userService.CreateOrUpdateUserAsync(userResponse.Data);
                    logger.LogInformation("User {UserId} processed successfully", user.UserId);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to update user in database");
                    return CreateErrorResponse(req, "user_creation_failed", stateData);
                }
            }
            else
            {
                // NEW USER: Validate invite code
                logger.LogInformation("New user detected, validating invite code");

                if (string.IsNullOrWhiteSpace(inviteCode))
                {
                    logger.LogWarning("New user attempted signup without invite code");
                    return CreateErrorResponse(req, "closed_beta", stateData);
                }

                // Validate and consume invite code through UserService
                var invite = await userService.ValidateAndConsumeInviteAsync(inviteCode);

                if (invite == null)
                {
                    logger.LogWarning("New user provided invalid invite code: {InviteCode}", inviteCode);
                    return CreateErrorResponse(req, "invalid_invite", stateData);
                }

                // Create user and link to invite
                try
                {
                    user = await userService.CreateOrUpdateUserAsync(userResponse.Data, invite.InviteId);
                    logger.LogInformation("New user {UserId} created with invite {InviteId}", user.UserId, invite.InviteId);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to create user in database");
                    return CreateErrorResponse(req, "user_creation_failed", stateData);
                }
            }

            // Generate verification code (session ID) linked to user and company
            logger.LogInformation("Creating session for user {UserId} in company {CompanyId}", user.UserId, user.CompanyId);

            // Use extension ID if provided, otherwise use "web" as identifier
            var clientIdentifier = !string.IsNullOrEmpty(stateData.ExtensionId)
                ? stateData.ExtensionId
                : "web";

            var session = await sessionService.CreateSessionAsync(
                user.UserId,
                user.CompanyId,
                tokenResponse.AccessToken,
                tokenResponse.RefreshToken,
                tokenResponse.ApiDomain,
                tokenResponse.ExpiresIn,
                clientIdentifier);

            logger.LogInformation("Session created successfully: {VerificationCode}", session.VerificationCode);

            // Detect client type and redirect accordingly
            if (stateData.Type == "web")
            {
                // Website flow - redirect to website callback URL
                var websiteCallbackUrl = configuration["WEBSITE_CALLBACK_URL"];

                if (string.IsNullOrEmpty(websiteCallbackUrl))
                {
                    logger.LogError("WEBSITE_CALLBACK_URL configuration is missing");
                    return CreateErrorResponse(req, "config_error", stateData);
                }

                var redirectUrl = $"{websiteCallbackUrl}?verification_code={Uri.EscapeDataString(session.VerificationCode)}";

                logger.LogInformation("Redirecting to website callback URL");

                var response = req.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Add("Location", redirectUrl);
                return response;
            }
            else
            {
                // Extension flow - redirect to chromiumapp.org URL
                if (string.IsNullOrEmpty(stateData.ExtensionId))
                {
                    logger.LogError("Invalid state - missing extension ID for extension client");
                    return CreateErrorResponse(req, "invalid_state", stateData);
                }

                var redirectUrl = $"https://{stateData.ExtensionId}.chromiumapp.org/" +
                                $"?verification_code={Uri.EscapeDataString(session.VerificationCode)}" +
                                $"&userName={Uri.EscapeDataString(user.Name)}" +
                                $"&success=true";

                logger.LogInformation("Redirecting to extension URL");

                var response = req.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Add("Location", redirectUrl);
                return response;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in AuthCallback endpoint");
            // Try to extract state from query for proper error handling
            OAuthState? stateData = null;
            try
            {
                var query = QueryHelpers.ParseQuery(req.Url.Query);
                var state = query.TryGetValue("state", out var stateValue) ? stateValue.ToString() : null;
                if (!string.IsNullOrEmpty(state))
                {
                    stateData = stateValidator.DecodeState(state);
                }
            }
            catch
            {
                // Ignore any errors in state extraction for error response
            }
            return CreateErrorResponse(req, "internal_error", stateData);
        }
    }

    private HttpResponseData CreateErrorResponse(
        HttpRequestData req,
        string error,
        OAuthState? stateData)
    {
        // If state indicates web flow, redirect to website with error
        if (stateData?.Type == "web")
        {
            var websiteCallbackUrl = configuration["WEBSITE_CALLBACK_URL"];

            if (string.IsNullOrEmpty(websiteCallbackUrl))
            {
                // Fallback to HTML error if configuration is missing
                return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, error);
            }

            // Redirect to website with error parameters
            var redirectUrl = $"{websiteCallbackUrl}?error={Uri.EscapeDataString(error)}";

            logger.LogInformation("Redirecting to website with error: {Error}", error);

            var response = req.CreateResponse(HttpStatusCode.Redirect);
            response.Headers.Add("Location", redirectUrl);
            return response;
        }
        else
        {
            // Extension flow - show HTML error page
            return CreateHtmlErrorResponse(req, HttpStatusCode.BadRequest, error);
        }
    }

    private HttpResponseData CreateHtmlErrorResponse(
        HttpRequestData req,
        HttpStatusCode statusCode,
        string error)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "text/html; charset=utf-8");

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
            { "config_error", "Server configuration error. Please contact support." },
            { "internal_error", "An internal error occurred." },
            { "closed_beta", "Chat2Deal is currently in closed beta. Access is limited to invited users only." },
            { "invalid_invite", "Invalid invite code. Please check your invite and try again." }
        };

        var message = errorMessages.ContainsKey(error)
            ? errorMessages[error]
            : "An unknown error occurred.";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
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
