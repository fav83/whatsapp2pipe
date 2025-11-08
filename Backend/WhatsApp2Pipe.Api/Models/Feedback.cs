using System;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Feedback entity for storing user feedback submissions.
/// </summary>
public class Feedback
{
    /// <summary>
    /// Primary key - unique identifier for the feedback entry.
    /// </summary>
    public Guid FeedbackEntityId { get; set; }

    /// <summary>
    /// Foreign key to Users table - identifies who submitted the feedback.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// User's feedback message (max 10000 characters).
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when feedback was submitted (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Browser user agent string for debugging context (optional).
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Extension version for tracking feedback by version (optional).
    /// </summary>
    public string? ExtensionVersion { get; set; }

    /// <summary>
    /// Navigation property to User entity.
    /// </summary>
    public User User { get; set; } = null!;
}
