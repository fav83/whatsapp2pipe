using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Service for managing user sessions and OAuth states in Azure SQL Database.
/// Replaces TableStorageService with EF Core-based implementation.
/// </summary>
public interface ISessionService
{
    // Session operations
    /// <summary>
    /// Creates a new session with OAuth tokens.
    /// </summary>
    /// <param name="userId">User ID (foreign key to Users table)</param>
    /// <param name="companyId">Company ID (foreign key to Companies table)</param>
    /// <param name="accessToken">Pipedrive OAuth access token</param>
    /// <param name="refreshToken">Pipedrive OAuth refresh token</param>
    /// <param name="apiDomain">Pipedrive API domain</param>
    /// <param name="expiresIn">Token expiration in seconds</param>
    /// <param name="extensionId">Chrome extension ID</param>
    /// <returns>Created session with generated verification code</returns>
    Task<Session> CreateSessionAsync(
        Guid userId,
        Guid companyId,
        string accessToken,
        string refreshToken,
        string apiDomain,
        int expiresIn,
        string extensionId);

    /// <summary>
    /// Retrieves a session by verification code.
    /// Returns null if session not found or expired.
    /// Expired sessions are automatically deleted (lazy deletion).
    /// </summary>
    /// <param name="verificationCode">32-character verification code (Bearer token)</param>
    /// <returns>Session with User and Company navigation properties, or null</returns>
    Task<Session?> GetSessionAsync(string verificationCode);

    /// <summary>
    /// Updates an existing session (e.g., token refresh).
    /// </summary>
    /// <param name="session">Session entity to update</param>
    Task UpdateSessionAsync(Session session);

    /// <summary>
    /// Deletes a session by verification code.
    /// </summary>
    /// <param name="verificationCode">Verification code of session to delete</param>
    Task DeleteSessionAsync(string verificationCode);

    // State operations (CSRF protection)
    /// <summary>
    /// Stores an OAuth state for CSRF protection.
    /// State expires after 5 minutes.
    /// </summary>
    /// <param name="state">Base64-encoded state value</param>
    Task StoreStateAsync(string state);

    /// <summary>
    /// Validates and consumes (deletes) an OAuth state.
    /// One-time use - state is deleted after validation.
    /// </summary>
    /// <param name="state">State value to validate</param>
    /// <returns>True if state is valid and not expired, false otherwise</returns>
    Task<bool> ValidateAndConsumeStateAsync(string state);
}
