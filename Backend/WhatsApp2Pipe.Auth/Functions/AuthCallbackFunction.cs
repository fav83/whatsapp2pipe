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
    private readonly OAuthStateValidator stateValidator;
    private readonly ILogger<AuthCallbackFunction> logger;

    public AuthCallbackFunction(
        ITableStorageService tableStorageService,
        IOAuthService oauthService,
        OAuthStateValidator stateValidator,
        ILogger<AuthCallbackFunction> logger)
    {
        this.tableStorageService = tableStorageService;
        this.oauthService = oauthService;
        this.stateValidator = stateValidator;
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

            // Generate verification code (session ID)
            logger.LogInformation("Creating session");
            var session = await tableStorageService.CreateSessionAsync(
                tokenResponse.AccessToken,
                tokenResponse.RefreshToken,
                tokenResponse.ApiDomain,
                tokenResponse.ExpiresIn,
                stateData.ExtensionId);

            logger.LogInformation("Session created successfully: {VerificationCode}", session.VerificationCode);

            // Redirect to extension with verification code
            // This URL pattern is recognized by Chrome and closes the popup automatically
            var redirectUrl = $"https://{stateData.ExtensionId}.chromiumapp.org/" +
                            $"?verification_code={Uri.EscapeDataString(session.VerificationCode)}" +
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
