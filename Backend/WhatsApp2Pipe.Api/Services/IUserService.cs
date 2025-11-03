using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Interface for user and company management operations.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Create or update user and company based on Pipedrive user data.
    /// </summary>
    /// <param name="userData">User data from Pipedrive /users/me</param>
    /// <param name="inviteId">Optional invite ID for new users (null for existing users)</param>
    /// <returns>User entity (created or updated)</returns>
    Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData, Guid? inviteId = null);

    /// <summary>
    /// Get user by Pipedrive user ID and company ID.
    /// </summary>
    /// <param name="pipedriveUserId">Pipedrive user ID</param>
    /// <param name="pipedriveCompanyId">Pipedrive company ID</param>
    /// <returns>User entity or null if not found</returns>
    Task<User?> GetUserByPipedriveIdAsync(int pipedriveUserId, int pipedriveCompanyId);

    /// <summary>
    /// Get user by user ID.
    /// </summary>
    /// <param name="userId">User ID (GUID)</param>
    /// <returns>User entity with Company navigation property, or null if not found</returns>
    Task<User?> GetUserByIdAsync(Guid userId);

    /// <summary>
    /// Update user entity.
    /// </summary>
    /// <param name="user">User entity to update</param>
    Task UpdateUserAsync(User user);

    /// <summary>
    /// Validate and consume an invite code.
    /// </summary>
    /// <param name="inviteCode">Invite code to validate</param>
    /// <returns>Invite entity if valid, null if invalid or not found</returns>
    Task<Invite?> ValidateAndConsumeInviteAsync(string inviteCode);
}
