using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Interface for Pipedrive API client operations
/// </summary>
public interface IPipedriveApiClient
{
    /// <summary>
    /// Search for persons by term and fields (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session entity containing access token (may be updated if token is refreshed)</param>
    /// <param name="term">Search term (phone number or name)</param>
    /// <param name="fields">Comma-separated fields to search (phone, name)</param>
    /// <returns>Search response with matching persons</returns>
    Task<PipedriveSearchResponse> SearchPersonsAsync(SessionEntity session, string term, string fields);

    /// <summary>
    /// Create a new person in Pipedrive (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session entity containing access token (may be updated if token is refreshed)</param>
    /// <param name="request">Person data to create</param>
    /// <returns>Created person response</returns>
    Task<PipedrivePersonResponse> CreatePersonAsync(SessionEntity session, PipedriveCreatePersonRequest request);

    /// <summary>
    /// Get an existing person by ID (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session entity containing access token (may be updated if token is refreshed)</param>
    /// <param name="personId">Pipedrive person ID</param>
    /// <returns>Person data</returns>
    Task<PipedrivePersonResponse> GetPersonAsync(SessionEntity session, int personId);

    /// <summary>
    /// Update an existing person (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session entity containing access token (may be updated if token is refreshed)</param>
    /// <param name="personId">Pipedrive person ID</param>
    /// <param name="request">Updated person data</param>
    /// <returns>Updated person response</returns>
    Task<PipedrivePersonResponse> UpdatePersonAsync(SessionEntity session, int personId, PipedriveUpdatePersonRequest request);
}
