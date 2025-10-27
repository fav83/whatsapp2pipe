using Azure;
using Azure.Data.Tables;

namespace WhatsApp2Pipe.Auth.Models;

/// <summary>
/// Represents a CSRF state parameter stored in Azure Table Storage.
/// Used for validating OAuth callbacks (5-minute TTL).
/// PartitionKey: "state"
/// RowKey: state value (random GUID)
/// </summary>
public class StateEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "state";
    public string RowKey { get; set; } = string.Empty; // state value
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // State metadata
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// Gets the state value
    /// </summary>
    public string StateValue => RowKey;
}
