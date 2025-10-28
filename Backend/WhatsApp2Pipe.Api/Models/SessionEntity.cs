using Azure;
using Azure.Data.Tables;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents an OAuth session stored in Azure Table Storage.
/// PartitionKey: "session"
/// RowKey: verification_code (session ID)
/// </summary>
public class SessionEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "session";
    public string RowKey { get; set; } = string.Empty; // verification_code
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // OAuth token data
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string ApiDomain { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }

    // Session metadata
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset SessionExpiresAt { get; set; }

    /// <summary>
    /// Chrome extension ID that initiated this OAuth flow.
    /// Used for validation and debugging.
    /// </summary>
    public string ExtensionId { get; set; } = string.Empty;

    /// <summary>
    /// Gets the verification_code (session ID)
    /// </summary>
    public string VerificationCode => RowKey;
}
