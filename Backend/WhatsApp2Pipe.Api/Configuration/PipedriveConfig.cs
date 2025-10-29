namespace WhatsApp2Pipe.Api.Configuration;

/// <summary>
/// Pipedrive API configuration
/// </summary>
public class PipedriveConfig
{
    public string BaseUrl { get; set; } = "https://api.pipedrive.com";
    public string ApiVersion { get; set; } = "v1";

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
