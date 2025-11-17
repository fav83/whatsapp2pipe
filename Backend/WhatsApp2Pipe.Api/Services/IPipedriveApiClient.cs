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

    /// <summary>
    /// Create a note in Pipedrive attached to a person
    /// </summary>
    /// <param name="session">User session with access token</param>
    /// <param name="personId">Pipedrive person ID to attach note to</param>
    /// <param name="content">Note content (plain text or HTML)</param>
    /// <returns>Created note object</returns>
    /// <exception cref="PipedriveUnauthorizedException">Thrown when refresh token is expired</exception>
    /// <exception cref="PipedriveRateLimitException">Thrown when rate limit exceeded</exception>
    Task<PipedriveNoteResponse> CreateNoteAsync(Session session, int personId, string content);

    /// <summary>
    /// Get all deals for a person (with automatic token refresh on 401)
    /// </summary>
    Task<PipedriveDealsResponse> GetPersonDealsAsync(Session session, int personId);

    /// <summary>
    /// Get all stages (with automatic token refresh on 401)
    /// </summary>
    Task<PipedriveStagesResponse> GetStagesAsync(Session session);

    /// <summary>
    /// Get all pipelines (with automatic token refresh on 401)
    /// </summary>
    Task<PipedrivePipelinesResponse> GetPipelinesAsync(Session session);
}
