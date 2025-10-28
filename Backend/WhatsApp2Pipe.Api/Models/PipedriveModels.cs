using System.Text.Json.Serialization;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Pipedrive search response
/// </summary>
public class PipedriveSearchResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveSearchData? Data { get; set; }
}

public class PipedriveSearchData
{
    [JsonPropertyName("items")]
    public PipedriveSearchItem[] Items { get; set; } = Array.Empty<PipedriveSearchItem>();
}

public class PipedriveSearchItem
{
    [JsonPropertyName("item")]
    public PipedrivePerson? Item { get; set; }
}

/// <summary>
/// Pipedrive person response (for GET and POST requests)
/// </summary>
public class PipedrivePersonResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedrivePerson? Data { get; set; }
}

/// <summary>
/// Full Pipedrive person object
/// </summary>
public class PipedrivePerson
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public List<PipedrivePhone>? Phone { get; set; }

    [JsonPropertyName("email")]
    public List<PipedriveEmail>? Email { get; set; }

    // Note: Many other fields exist in Pipedrive API but we only need these for MVP
}

public class PipedrivePhone
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("primary")]
    public bool Primary { get; set; }
}

public class PipedriveEmail
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("primary")]
    public bool Primary { get; set; }
}

/// <summary>
/// Request to create a person in Pipedrive
/// </summary>
public class PipedriveCreatePersonRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public List<PipedrivePhoneInput>? Phone { get; set; }

    [JsonPropertyName("email")]
    public List<PipedriveEmailInput>? Email { get; set; }
}

public class PipedrivePhoneInput
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("primary")]
    public bool Primary { get; set; }
}

public class PipedriveEmailInput
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("primary")]
    public bool Primary { get; set; }
}

/// <summary>
/// Request to update a person in Pipedrive
/// </summary>
public class PipedriveUpdatePersonRequest
{
    [JsonPropertyName("phone")]
    public List<PipedrivePhoneInput>? Phone { get; set; }
}
