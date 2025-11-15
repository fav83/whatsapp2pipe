using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// SQL-based session service using Entity Framework Core.
/// Manages OAuth sessions and CSRF states in Azure SQL Database.
/// </summary>
public class SqlSessionService : ISessionService
{
    private readonly IDbContextFactory<Chat2DealDbContext> dbContextFactory;
    private readonly ILogger<SqlSessionService> logger;
    private const int SessionExpirationDays = 60;
    private const int StateExpirationMinutes = 5;

    public SqlSessionService(
        IDbContextFactory<Chat2DealDbContext> dbContextFactory,
        ILogger<SqlSessionService> logger)
    {
        this.dbContextFactory = dbContextFactory;
        this.logger = logger;
    }

    // Session operations
    public async Task<Session> CreateSessionAsync(
        Guid userId,
        Guid companyId,
        string accessToken,
        string refreshToken,
        string apiDomain,
        int expiresIn,
        string extensionId)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync();
        var verificationCode = GenerateVerificationCode();
        var now = DateTime.UtcNow;

        var session = new Session
        {
            SessionId = Guid.NewGuid(),
            VerificationCode = verificationCode,
            UserId = userId,
            CompanyId = companyId,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ApiDomain = apiDomain,
            ExpiresAt = now.AddSeconds(expiresIn),
            SessionExpiresAt = now.AddDays(SessionExpirationDays),
            ExtensionId = extensionId,
            CreatedAt = now
        };

        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Created session {VerificationCode} for user {UserId} in company {CompanyId}",
            verificationCode, userId, companyId);

        return session;
    }

    public async Task<Session?> GetSessionAsync(string verificationCode)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync();
        var session = await dbContext.Sessions
            .Include(s => s.User)
            .Include(s => s.Company)
            .FirstOrDefaultAsync(s => s.VerificationCode == verificationCode);

        if (session == null)
        {
            logger.LogWarning("Session not found: {VerificationCode}", verificationCode);
            return null;
        }

        // Check if session expired
        if (session.SessionExpiresAt < DateTime.UtcNow)
        {
            logger.LogInformation(
                "Session expired: {VerificationCode}, expired at {ExpiresAt}",
                verificationCode, session.SessionExpiresAt);

            // Lazy deletion
            dbContext.Sessions.Remove(session);
            await dbContext.SaveChangesAsync();

            return null;
        }

        return session;
    }

    public async Task UpdateSessionAsync(Session session)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync();
        dbContext.Sessions.Update(session);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Updated session {VerificationCode} for user {UserId}",
            session.VerificationCode, session.UserId);
    }

    public async Task DeleteSessionAsync(string verificationCode)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync();
        var session = await dbContext.Sessions
            .FirstOrDefaultAsync(s => s.VerificationCode == verificationCode);

        if (session != null)
        {
            dbContext.Sessions.Remove(session);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Deleted session {VerificationCode}", verificationCode);
        }
    }

    // State operations (CSRF)
    public async Task StoreStateAsync(string state)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync();
        var stateHash = ComputeStateHash(state);
        var now = DateTime.UtcNow;

        var stateEntity = new State
        {
            StateId = Guid.NewGuid(),
            StateHash = stateHash,
            StateValue = state,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(StateExpirationMinutes)
        };

        dbContext.States.Add(stateEntity);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Stored state with hash {StateHash}", stateHash);
    }

    public async Task<bool> ValidateAndConsumeStateAsync(string state)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync();
        var stateHash = ComputeStateHash(state);
        var now = DateTime.UtcNow;

        // Use execution strategy to handle transactions with retry logic
        var strategy = dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteInTransactionAsync<bool>(
            operation: async (cancellationToken) =>
            {
                // Find matching state
                var stateEntity = await dbContext.States
                    .FirstOrDefaultAsync(s => s.StateHash == stateHash && s.StateValue == state, cancellationToken);

                if (stateEntity == null)
                {
                    logger.LogWarning("State not found: {StateHash}", stateHash);
                    return false;
                }

                // Check if expired
                if (stateEntity.ExpiresAt < now)
                {
                    // Clean up expired state
                    dbContext.States.Remove(stateEntity);
                    await dbContext.SaveChangesAsync(cancellationToken);

                    logger.LogWarning("State expired: {StateHash}", stateHash);
                    return false;
                }

                // Valid state - consume it (delete)
                dbContext.States.Remove(stateEntity);
                await dbContext.SaveChangesAsync(cancellationToken);

                logger.LogInformation("Validated and consumed state {StateHash}", stateHash);
                return true;
            },
            verifySucceeded: null!
        );
    }

    // Private helpers
    private static string GenerateVerificationCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new char[32];

        using (var rng = RandomNumberGenerator.Create())
        {
            var bytes = new byte[32];
            rng.GetBytes(bytes);

            for (int i = 0; i < 32; i++)
            {
                random[i] = chars[bytes[i] % chars.Length];
            }
        }

        return new string(random);
    }

    private static string ComputeStateHash(string state)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(state));

        // Take first 128 bits (16 bytes) = 32 hex characters
        var sb = new StringBuilder(32);
        for (int i = 0; i < 16; i++)
        {
            sb.Append(hashBytes[i].ToString("x2"));
        }

        return sb.ToString();
    }
}
