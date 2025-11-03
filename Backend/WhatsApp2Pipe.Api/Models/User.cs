namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents a Pipedrive user entity with activity tracking.
/// </summary>
public class User
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Foreign key to Companies table.
    /// </summary>
    public Guid CompanyId { get; set; }

    /// <summary>
    /// Pipedrive user ID.
    /// </summary>
    public int PipedriveUserId { get; set; }

    /// <summary>
    /// User's full name from Pipedrive.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// User's email from Pipedrive.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when user was first created (first OAuth).
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp of most recent OAuth login.
    /// </summary>
    public DateTime LastLoginAt { get; set; }

    /// <summary>
    /// Nullable foreign key to Invites table.
    /// Set when user signs up with an invite code.
    /// </summary>
    public Guid? InviteId { get; set; }

    /// <summary>
    /// Navigation property - Company this user belongs to.
    /// </summary>
    public Company Company { get; set; } = null!;

    /// <summary>
    /// Navigation property - Invite code used during signup (if any).
    /// </summary>
    public Invite? Invite { get; set; }
}
