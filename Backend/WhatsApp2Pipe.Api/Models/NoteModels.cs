using System.ComponentModel.DataAnnotations;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Request to create a note attached to a person in Pipedrive
/// </summary>
public class CreatePersonNoteRequest
{
    /// <summary>
    /// Pipedrive person ID to attach note to (required)
    /// </summary>
    [Required]
    public int PersonId { get; set; }

    /// <summary>
    /// Note content - formatted WhatsApp conversation (required)
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// Request to create a note attached to a deal in Pipedrive
/// </summary>
public class CreateDealNoteRequest
{
    /// <summary>
    /// Pipedrive deal ID to attach note to (required)
    /// </summary>
    [Required]
    public int DealId { get; set; }

    /// <summary>
    /// Note content - formatted WhatsApp conversation (required)
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;
}
