namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Response from /api/auth/callback endpoint
/// </summary>
public class AuthCallbackResponse
{
    /// <summary>
    /// The verification code (session ID) for the extension to use
    /// </summary>
    public string VerificationCode { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the session expires (60 days from creation)
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }
}
