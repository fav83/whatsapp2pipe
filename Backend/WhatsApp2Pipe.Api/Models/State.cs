using System.ComponentModel.DataAnnotations;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents an OAuth state for CSRF protection.
/// States are one-time use with 5-minute lifetime.
/// </summary>
public class State
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid StateId { get; set; }

    /// <summary>
    /// SHA256 hash of state value (first 32 hex characters).
    /// Used for fast lookup during OAuth callback validation.
    /// </summary>
    [Required]
    [MaxLength(64)]
    public string StateHash { get; set; } = string.Empty;

    /// <summary>
    /// Full base64-encoded state value.
    /// Verified during OAuth callback for CSRF protection.
    /// </summary>
    [Required]
    public string StateValue { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when state was created.
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// State expiration timestamp (5 minutes from creation).
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }
}
