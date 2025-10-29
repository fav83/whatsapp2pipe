using System.Text.Json.Serialization;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Response from Pipedrive OAuth token endpoint
/// </summary>
public class PipedriveTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = string.Empty;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; } // seconds

    [JsonPropertyName("scope")]
    public string Scope { get; set; } = string.Empty;

    [JsonPropertyName("api_domain")]
    public string ApiDomain { get; set; } = string.Empty;
}
