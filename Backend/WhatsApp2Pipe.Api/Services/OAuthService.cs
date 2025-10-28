using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public class OAuthService : IOAuthService
{
    private readonly HttpClient httpClient;
    private readonly PipedriveSettings pipedriveSettings;
    private readonly ILogger<OAuthService> logger;

    public OAuthService(IConfiguration configuration, ILogger<OAuthService> logger)
    {
        this.logger = logger;
        httpClient = new HttpClient();

        // Load configuration
        pipedriveSettings = new PipedriveSettings();
        configuration.GetSection("Pipedrive").Bind(pipedriveSettings);

        logger.LogInformation("OAuthService initialized for redirect URI: {RedirectUri}",
            pipedriveSettings.RedirectUri);
    }

    public string BuildAuthorizationUrl(string state)
    {
        var queryParams = new Dictionary<string, string>
        {
            { "client_id", pipedriveSettings.ClientId },
            { "redirect_uri", pipedriveSettings.RedirectUri },
            { "state", state },
            { "response_type", "code" }
        };

        // Add scope if specified
        if (!string.IsNullOrEmpty(pipedriveSettings.Scope))
        {
            queryParams.Add("scope", pipedriveSettings.Scope);
        }

        var queryString = string.Join("&", queryParams.Select(kvp =>
            $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));

        var authUrl = $"{pipedriveSettings.AuthorizationEndpoint}?{queryString}";

        logger.LogInformation("Built authorization URL with state: {State}", state);

        return authUrl;
    }

    public async Task<PipedriveTokenResponse> ExchangeCodeForTokensAsync(string code)
    {
        logger.LogInformation("Exchanging authorization code for tokens");

        var requestBody = new Dictionary<string, string>
        {
            { "grant_type", "authorization_code" },
            { "code", code },
            { "redirect_uri", pipedriveSettings.RedirectUri }
        };

        return await RequestTokenAsync(requestBody);
    }

    public async Task<PipedriveTokenResponse> RefreshAccessTokenAsync(string refreshToken)
    {
        logger.LogInformation("Refreshing access token");

        var requestBody = new Dictionary<string, string>
        {
            { "grant_type", "refresh_token" },
            { "refresh_token", refreshToken }
        };

        return await RequestTokenAsync(requestBody);
    }

    private async Task<PipedriveTokenResponse> RequestTokenAsync(Dictionary<string, string> requestBody)
    {
        // Add client credentials
        requestBody.Add("client_id", pipedriveSettings.ClientId);
        requestBody.Add("client_secret", pipedriveSettings.ClientSecret);

        var content = new FormUrlEncodedContent(requestBody);

        var response = await httpClient.PostAsync(pipedriveSettings.TokenEndpoint, content);

        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Token request failed with status {StatusCode}: {Response}",
                response.StatusCode, responseBody);
            throw new HttpRequestException($"Token request failed: {response.StatusCode}");
        }

        var tokenResponse = JsonSerializer.Deserialize<PipedriveTokenResponse>(responseBody,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (tokenResponse == null)
        {
            throw new InvalidOperationException("Failed to deserialize token response");
        }

        logger.LogInformation("Token request successful, expires in {ExpiresIn} seconds",
            tokenResponse.ExpiresIn);

        return tokenResponse;
    }
}
