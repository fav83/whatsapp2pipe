namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Request model for waitlist signup.
/// </summary>
public class WaitlistSignupRequest
{
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
}

