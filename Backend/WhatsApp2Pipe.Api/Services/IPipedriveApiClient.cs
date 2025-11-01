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
    /// <param name="session">Session containing access token (may be updated if token is refreshed)</param>
    /// <param name="term">Search term (phone number or name)</param>
    /// <param name="fields">Comma-separated fields to search (phone, name)</param>
    /// <returns>Search response with matching persons</returns>
    Task<PipedriveSearchResponse> SearchPersonsAsync(Session session, string term, string fields);

    /// <summary>
    /// Create a new person in Pipedrive (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session containing access token (may be updated if token is refreshed)</param>
    /// <param name="request">Person data to create</param>
    /// <returns>Created person response</returns>
    Task<PipedrivePersonResponse> CreatePersonAsync(Session session, PipedriveCreatePersonRequest request);

    /// <summary>
    /// Get an existing person by ID (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session containing access token (may be updated if token is refreshed)</param>
    /// <param name="personId">Pipedrive person ID</param>
    /// <returns>Person data</returns>
    Task<PipedrivePersonResponse> GetPersonAsync(Session session, int personId);

    /// <summary>
    /// Update an existing person (with automatic token refresh on 401)
    /// </summary>
    /// <param name="session">Session containing access token (may be updated if token is refreshed)</param>
    /// <param name="personId">Pipedrive person ID</param>
    /// <param name="request">Updated person data</param>
    /// <returns>Updated person response</returns>
    Task<PipedrivePersonResponse> UpdatePersonAsync(Session session, int personId, PipedriveUpdatePersonRequest request);

    /// <summary>
    /// Get current user data from Pipedrive /users/me endpoint
    /// Includes automatic token refresh on 401
    /// </summary>
    /// <param name="session">Session containing access token (may be updated if token is refreshed)</param>
    /// <returns>Current user data including company information</returns>
    Task<PipedriveUserResponse> GetCurrentUserAsync(Session session);
}
