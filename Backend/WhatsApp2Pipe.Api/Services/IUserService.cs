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
    /// <returns>User entity (created or updated)</returns>
    Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData);

    /// <summary>
    /// Get user by Pipedrive user ID and company ID.
    /// </summary>
    /// <param name="pipedriveUserId">Pipedrive user ID</param>
    /// <param name="pipedriveCompanyId">Pipedrive company ID</param>
    /// <returns>User entity or null if not found</returns>
    Task<User?> GetUserByPipedriveIdAsync(int pipedriveUserId, int pipedriveCompanyId);
}
