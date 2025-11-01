using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents a user session with OAuth tokens and Pipedrive API access.
/// Sessions are created during OAuth flow and used for API authentication.
/// </summary>
public class Session
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid SessionId { get; set; }

    /// <summary>
    /// Unique verification code used as Bearer token (32 characters).
    /// Generated during session creation and stored in Chrome extension.
    /// </summary>
    [Required]
    [MaxLength(32)]
    public string VerificationCode { get; set; } = string.Empty;

    /// <summary>
    /// Foreign key to Users table.
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Foreign key to Companies table.
    /// </summary>
    [Required]
    public Guid CompanyId { get; set; }

    /// <summary>
    /// Pipedrive OAuth access token.
    /// </summary>
    [Required]
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Pipedrive OAuth refresh token.
    /// </summary>
    [Required]
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Pipedrive API domain (e.g., "api.pipedrive.com").
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string ApiDomain { get; set; } = string.Empty;

    /// <summary>
    /// OAuth access token expiration timestamp (from Pipedrive).
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Session expiration timestamp (60 days from creation).
    /// </summary>
    [Required]
    public DateTime SessionExpiresAt { get; set; }

    /// <summary>
    /// Chrome extension ID that created this session.
    /// Supports multi-device/multi-browser scenarios.
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string ExtensionId { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when session was created.
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Navigation property - User who owns this session.
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    /// <summary>
    /// Navigation property - Company this session belongs to.
    /// </summary>
    [ForeignKey(nameof(CompanyId))]
    public Company Company { get; set; } = null!;
}
