using Azure;
using Azure.Data.Tables;

namespace WhatsApp2Pipe.Auth.Models;

/// <summary>
/// Represents a CSRF state parameter stored in Azure Table Storage.
/// Used for validating OAuth callbacks (5-minute TTL).
/// PartitionKey: "state"
/// RowKey: SHA256 hash of state (32 hex chars)
/// StateValue: Full base64-encoded state from extension
/// </summary>
public class StateEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "state";
    public string RowKey { get; set; } = string.Empty; // SHA256 hash (32 chars)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // State metadata
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// Full state value (base64-encoded JSON from extension)
    /// Stored separately from RowKey to keep RowKey under 40 chars
    /// </summary>
    public string StateValue { get; set; } = string.Empty;
}
