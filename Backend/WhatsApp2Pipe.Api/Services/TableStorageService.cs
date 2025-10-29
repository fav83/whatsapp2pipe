using Azure.Data.Tables;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public class TableStorageService : ITableStorageService
{
    private readonly TableClient sessionTable;
    private readonly TableClient stateTable;
    private readonly AzureSettings azureSettings;
    private readonly ILogger<TableStorageService> logger;

    public TableStorageService(IConfiguration configuration, ILogger<TableStorageService> logger)
    {
        this.logger = logger;

        // Load configuration
        azureSettings = new AzureSettings();
        configuration.GetSection("Azure").Bind(azureSettings);

        // Initialize Table Storage clients
        var connectionString = azureSettings.StorageConnectionString;

        sessionTable = new TableClient(connectionString, azureSettings.SessionTableName);
        stateTable = new TableClient(connectionString, azureSettings.StateTableName);

        // Create tables if they don't exist
        sessionTable.CreateIfNotExists();
        stateTable.CreateIfNotExists();

        logger.LogInformation("TableStorageService initialized with tables: {SessionTable}, {StateTable}",
            azureSettings.SessionTableName, azureSettings.StateTableName);
    }

    #region Session Operations

    public async Task<SessionEntity> CreateSessionAsync(string accessToken, string refreshToken, string apiDomain, int expiresIn, string extensionId)
    {
        var now = DateTimeOffset.UtcNow;
        var verificationCode = GenerateVerificationCode();

        var session = new SessionEntity
        {
            RowKey = verificationCode,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ApiDomain = apiDomain,
            ExpiresAt = now.AddSeconds(expiresIn),
            CreatedAt = now,
            SessionExpiresAt = now.AddDays(azureSettings.SessionExpirationDays),
            ExtensionId = extensionId
        };

        await sessionTable.AddEntityAsync(session);

        logger.LogInformation("Created session {VerificationCode} for extension {ExtensionId}, expires at {ExpiresAt}",
            verificationCode, extensionId, session.SessionExpiresAt);

        return session;
    }

    public async Task<SessionEntity?> GetSessionAsync(string verificationCode)
    {
        try
        {
            var response = await sessionTable.GetEntityAsync<SessionEntity>("session", verificationCode);
            var session = response.Value;

            // Check if session has expired
            if (DateTimeOffset.UtcNow > session.SessionExpiresAt)
            {
                logger.LogWarning("Session {VerificationCode} has expired", verificationCode);
                await DeleteSessionAsync(verificationCode);
                return null;
            }

            return session;
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            logger.LogWarning("Session {VerificationCode} not found", verificationCode);
            return null;
        }
    }

    public async Task UpdateSessionAsync(SessionEntity session)
    {
        await sessionTable.UpdateEntityAsync(session, session.ETag);
        logger.LogInformation("Updated session {VerificationCode}", session.VerificationCode);
    }

    public async Task DeleteSessionAsync(string verificationCode)
    {
        await sessionTable.DeleteEntityAsync("session", verificationCode);
        logger.LogInformation("Deleted session {VerificationCode}", verificationCode);
    }

    #endregion

    #region State Operations (CSRF Protection)

    public async Task StoreStateAsync(string state)
    {
        var now = DateTimeOffset.UtcNow;
        var stateHash = ComputeStateHash(state);

        var stateEntity = new StateEntity
        {
            RowKey = stateHash,        // 32-char hash (under 40-char limit)
            StateValue = state,        // Full base64 state from extension
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(azureSettings.StateExpirationMinutes)
        };

        try
        {
            await stateTable.AddEntityAsync(stateEntity);
            logger.LogInformation("Stored state with hash {Hash}, expires at {ExpiresAt}",
                stateHash, stateEntity.ExpiresAt);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 409)
        {
            // Astronomically rare collision (P ~10^-31 with 10k concurrent states)
            logger.LogError("State hash collision detected: {Hash} - retry authentication", stateHash);
            throw new InvalidOperationException("State collision detected - please retry authentication", ex);
        }
    }

    public async Task<bool> ValidateAndConsumeStateAsync(string state)
    {
        try
        {
            var stateHash = ComputeStateHash(state);
            var response = await stateTable.GetEntityAsync<StateEntity>("state", stateHash);
            var stateEntity = response.Value;

            // Verify the full state value matches (defense against theoretical hash collision)
            if (stateEntity.StateValue != state)
            {
                logger.LogError("State value mismatch for hash {Hash} - possible collision", stateHash);
                return false;
            }

            // Check if state has expired
            if (DateTimeOffset.UtcNow > stateEntity.ExpiresAt)
            {
                logger.LogWarning("State with hash {Hash} has expired", stateHash);
                await stateTable.DeleteEntityAsync("state", stateHash);
                return false;
            }

            // Consume the state (delete it after successful validation - prevents replay attacks)
            await stateTable.DeleteEntityAsync("state", stateHash);
            logger.LogInformation("State with hash {Hash} validated and consumed", stateHash);

            return true;
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            logger.LogWarning("State not found or already consumed");
            return false;
        }
    }

    #endregion

    #region Helper Methods

    private static string GenerateVerificationCode()
    {
        // Generate a secure random 32-character alphanumeric code
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const int length = 32;

        var bytes = new byte[length];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(bytes);

        var result = new char[length];
        for (int i = 0; i < length; i++)
        {
            result[i] = chars[bytes[i] % chars.Length];
        }

        return new string(result);
    }

    /// <summary>
    /// Computes SHA256 hash of state and returns first 128 bits as 32 hex characters.
    /// Used as RowKey to keep under 40-char limit while maintaining deterministic O(1) lookups.
    /// Collision probability with 10k concurrent states: ~10^-31 (negligible).
    /// </summary>
    private static string ComputeStateHash(string state)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(state));
        // Take first 16 bytes (128 bits) = 32 hex characters
        return BitConverter.ToString(hashBytes, 0, 16).Replace("-", "").ToLowerInvariant();
    }

    #endregion
}
