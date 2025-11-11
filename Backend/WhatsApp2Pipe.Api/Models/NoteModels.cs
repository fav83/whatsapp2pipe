using System.ComponentModel.DataAnnotations;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Request to create a note in Pipedrive
/// </summary>
public class CreateNoteRequest
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
