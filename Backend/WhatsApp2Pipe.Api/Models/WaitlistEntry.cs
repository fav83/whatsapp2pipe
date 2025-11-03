namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents a waitlist entry for beta access.
/// </summary>
public class WaitlistEntry
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid WaitlistId { get; set; }

    /// <summary>
    /// Email address (required, unique).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's name (optional).
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Timestamp when user first joined waitlist.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when user last submitted (for duplicate submissions).
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
