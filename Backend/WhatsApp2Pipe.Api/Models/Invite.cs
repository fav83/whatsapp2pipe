namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents an invite code for closed beta access.
/// </summary>
public class Invite
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid InviteId { get; set; }

    /// <summary>
    /// Invite code string (e.g., "early-access-2024", "twitter-campaign").
    /// Unique, max 100 characters.
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when invite was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Number of users who have signed up with this invite.
    /// Incremented on each successful signup.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Optional description for admin reference (e.g., "Twitter campaign Nov 2024").
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Navigation property - Users who signed up with this invite.
    /// </summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}
