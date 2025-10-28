using System.ComponentModel.DataAnnotations;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Minimal person data returned to extension.
/// Transformed from full Pipedrive response.
/// </summary>
public class Person
{
    /// <summary>
    /// Pipedrive person ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Person's full name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// All phone numbers (can be empty array)
    /// </summary>
    public Phone[] Phones { get; set; } = Array.Empty<Phone>();

    /// <summary>
    /// All email addresses (can be empty array)
    /// </summary>
    public Email[] Emails { get; set; } = Array.Empty<Email>();
}

/// <summary>
/// Phone number with label and primary flag
/// </summary>
public class Phone
{
    /// <summary>
    /// Phone number in E.164 format
    /// Example: "+48123456789"
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Phone label (mobile, work, home, WhatsApp, etc.)
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// True if this is the primary phone
    /// </summary>
    public bool IsPrimary { get; set; }
}

/// <summary>
/// Email address with label and primary flag
/// </summary>
public class Email
{
    /// <summary>
    /// Email address
    /// Example: "john@example.com"
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Email label (work, personal, home, etc.)
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// True if this is the primary email
    /// </summary>
    public bool IsPrimary { get; set; }
}

/// <summary>
/// Request to create a new person
/// </summary>
public class CreatePersonRequest
{
    /// <summary>
    /// Person's full name (required)
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// WhatsApp phone in E.164 format (required)
    /// Example: "+48123456789"
    /// </summary>
    [Required]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Email address (optional)
    /// </summary>
    public string? Email { get; set; }
}

/// <summary>
/// Request to attach phone to existing person
/// </summary>
public class AttachPhoneRequest
{
    /// <summary>
    /// WhatsApp phone in E.164 format (required)
    /// Example: "+48123456789"
    /// </summary>
    [Required]
    public string Phone { get; set; } = string.Empty;
}
