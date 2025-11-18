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

    [JsonPropertyName("org_name")]
    public string? OrganizationName { get; set; }

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

/// <summary>
/// Pipedrive note object (from API response)
/// </summary>
public class PipedriveNote
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("person_id")]
    public int? PersonId { get; set; }

    [JsonPropertyName("add_time")]
    public string? AddTime { get; set; }

    [JsonPropertyName("update_time")]
    public string? UpdateTime { get; set; }

    [JsonPropertyName("active_flag")]
    public bool ActiveFlag { get; set; }
}

/// <summary>
/// Request to create a note via Pipedrive API
/// </summary>
public class PipedriveCreateNoteRequest
{
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("person_id")]
    public int PersonId { get; set; }
}

/// <summary>
/// Response from Pipedrive note creation API
/// </summary>
public class PipedriveNoteResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveNote? Data { get; set; }
}

/// <summary>
/// Deal object returned to extension
/// </summary>
public class Deal
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty; // Formatted: "$50,000.00"

    [JsonPropertyName("stage")]
    public DealStage Stage { get; set; } = new();

    [JsonPropertyName("pipeline")]
    public DealPipeline Pipeline { get; set; } = new();

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // "open", "won", "lost"

    [JsonPropertyName("updateTime")]
    public string? UpdateTime { get; set; }
}

public class DealStage
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("order")]
    public int Order { get; set; }
}

public class DealPipeline
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Pipedrive raw deal response (from GET /v2/deals)
/// </summary>
public class PipedriveDeal
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = string.Empty;

    [JsonPropertyName("stage_id")]
    public int StageId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("update_time")]
    public string? UpdateTime { get; set; }
}

/// <summary>
/// Pipedrive deals list response
/// </summary>
public class PipedriveDealsResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveDeal[]? Data { get; set; }
}

/// <summary>
/// Pipedrive stage object
/// </summary>
public class PipedriveStage
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("order_nr")]
    public int OrderNr { get; set; }

    [JsonPropertyName("pipeline_id")]
    public int PipelineId { get; set; }
}

/// <summary>
/// Pipedrive stages list response
/// </summary>
public class PipedriveStagesResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveStage[]? Data { get; set; }
}

/// <summary>
/// Pipedrive pipeline object
/// </summary>
public class PipedrivePipeline
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("order_nr")]
    public int OrderNr { get; set; }

    [JsonPropertyName("active")]
    public bool Active { get; set; }
}

/// <summary>
/// Pipedrive pipelines list response
/// </summary>
public class PipedrivePipelinesResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedrivePipeline[]? Data { get; set; }
}

/// <summary>
/// Request to create a deal (from extension to backend)
/// </summary>
public class CreateDealRequest
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("personId")]
    public int PersonId { get; set; }

    [JsonPropertyName("pipelineId")]
    public int PipelineId { get; set; }

    [JsonPropertyName("stageId")]
    public int StageId { get; set; }

    [JsonPropertyName("value")]
    public decimal? Value { get; set; }
}

/// <summary>
/// Request to create a deal via Pipedrive API
/// </summary>
public class PipedriveCreateDealRequest
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("person_id")]
    public int PersonId { get; set; }

    [JsonPropertyName("pipeline_id")]
    public int PipelineId { get; set; }

    [JsonPropertyName("stage_id")]
    public int StageId { get; set; }

    [JsonPropertyName("user_id")]
    public int UserId { get; set; }

    [JsonPropertyName("value")]
    public decimal? Value { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "open";
}

/// <summary>
/// Response from Pipedrive deal creation API
/// </summary>
public class PipedriveDealResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveDeal? Data { get; set; }
}
