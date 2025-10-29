namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Standard error response for all API endpoints
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// Error code (e.g., "invalid_state", "token_exchange_failed")
    /// </summary>
    public string Error { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable error description
    /// </summary>
    public string ErrorDescription { get; set; } = string.Empty;
}
