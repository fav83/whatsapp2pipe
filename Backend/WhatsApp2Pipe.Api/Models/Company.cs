namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents a Pipedrive company entity with user relationships.
/// </summary>
public class Company
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid CompanyId { get; set; }

    /// <summary>
    /// Pipedrive company ID - Unique constraint.
    /// </summary>
    public int PipedriveCompanyId { get; set; }

    /// <summary>
    /// Company name from Pipedrive.
    /// </summary>
    public string CompanyName { get; set; } = string.Empty;

    /// <summary>
    /// Company domain from Pipedrive (e.g., "pipedrive-12g53f").
    /// </summary>
    public string CompanyDomain { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when company was first seen.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Navigation property - Users belonging to this company.
    /// </summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}
