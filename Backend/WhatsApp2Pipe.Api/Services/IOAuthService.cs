using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public interface IOAuthService
{
    /// <summary>
    /// Builds the Pipedrive OAuth authorization URL with state parameter
    /// </summary>
    string BuildAuthorizationUrl(string state);

    /// <summary>
    /// Exchanges an authorization code for access and refresh tokens
    /// </summary>
    Task<PipedriveTokenResponse> ExchangeCodeForTokensAsync(string code);

    /// <summary>
    /// Refreshes an access token using a refresh token
    /// </summary>
    Task<PipedriveTokenResponse> RefreshAccessTokenAsync(string refreshToken);
}
