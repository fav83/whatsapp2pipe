namespace WhatsApp2Pipe.Api.Configuration;

/// <summary>
/// Pipedrive configuration including API and OAuth settings
/// </summary>
public class PipedriveSettings
{
    // API Configuration
    public string BaseUrl { get; set; } = "https://api.pipedrive.com";
    public string ApiVersion { get; set; } = "v1";

    // OAuth Configuration
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public string AuthorizationEndpoint { get; set; } = string.Empty;
    public string TokenEndpoint { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;

    /// <summary>
    /// Constructs full API URL for given endpoint
    /// </summary>
    /// <param name="endpoint">API endpoint (e.g., "/persons/search")</param>
    /// <returns>Full URL (e.g., "https://api.pipedrive.com/v1/persons/search")</returns>
    public string GetApiUrl(string endpoint)
    {
        return $"{BaseUrl}/{ApiVersion}{endpoint}";
    }
}
