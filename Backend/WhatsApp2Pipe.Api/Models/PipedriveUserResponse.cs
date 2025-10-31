using System.Text.Json.Serialization;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Response model for Pipedrive /users/me endpoint.
/// </summary>
public class PipedriveUserResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveUserData Data { get; set; } = null!;
}

/// <summary>
/// User data from Pipedrive /users/me endpoint.
/// </summary>
public class PipedriveUserData
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("company_id")]
    public int CompanyId { get; set; }

    [JsonPropertyName("company_name")]
    public string CompanyName { get; set; } = string.Empty;

    [JsonPropertyName("company_domain")]
    public string CompanyDomain { get; set; } = string.Empty;
}
