using WhatsApp2Pipe.Auth.Models;

namespace WhatsApp2Pipe.Auth.Services;

public interface ITableStorageService
{
    // Session operations
    Task<SessionEntity> CreateSessionAsync(string accessToken, string refreshToken, string apiDomain, int expiresIn);
    Task<SessionEntity?> GetSessionAsync(string verificationCode);
    Task UpdateSessionAsync(SessionEntity session);
    Task DeleteSessionAsync(string verificationCode);

    // State operations (CSRF protection)
    Task<string> CreateStateAsync();
    Task<bool> ValidateAndConsumeStateAsync(string state);
}
