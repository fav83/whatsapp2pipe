namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Response from /api/auth/start endpoint
/// </summary>
public class AuthStartResponse
{
    /// <summary>
    /// The Pipedrive OAuth authorization URL to redirect the user to
    /// </summary>
    public string AuthorizationUrl { get; set; } = string.Empty;
}
