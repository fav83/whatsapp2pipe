using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Interface for Pipedrive API client operations
/// </summary>
public interface IPipedriveApiClient
{
    /// <summary>
    /// Search for persons by term and fields
    /// </summary>
    /// <param name="accessToken">Pipedrive OAuth access token</param>
    /// <param name="term">Search term (phone number or name)</param>
    /// <param name="fields">Comma-separated fields to search (phone, name)</param>
    /// <returns>Search response with matching persons</returns>
    Task<PipedriveSearchResponse> SearchPersonsAsync(string accessToken, string term, string fields);

    /// <summary>
    /// Create a new person in Pipedrive
    /// </summary>
    /// <param name="accessToken">Pipedrive OAuth access token</param>
    /// <param name="request">Person data to create</param>
    /// <returns>Created person response</returns>
    Task<PipedrivePersonResponse> CreatePersonAsync(string accessToken, PipedriveCreatePersonRequest request);

    /// <summary>
    /// Get an existing person by ID
    /// </summary>
    /// <param name="accessToken">Pipedrive OAuth access token</param>
    /// <param name="personId">Pipedrive person ID</param>
    /// <returns>Person data</returns>
    Task<PipedrivePersonResponse> GetPersonAsync(string accessToken, int personId);

    /// <summary>
    /// Update an existing person
    /// </summary>
    /// <param name="accessToken">Pipedrive OAuth access token</param>
    /// <param name="personId">Pipedrive person ID</param>
    /// <param name="request">Updated person data</param>
    /// <returns>Updated person response</returns>
    Task<PipedrivePersonResponse> UpdatePersonAsync(string accessToken, int personId, PipedriveUpdatePersonRequest request);
}
