using Azure.Data.Tables;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Auth.Configuration;
using WhatsApp2Pipe.Auth.Models;

namespace WhatsApp2Pipe.Auth.Services;

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

    public async Task<SessionEntity> CreateSessionAsync(string accessToken, string refreshToken, string apiDomain, int expiresIn)
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
            SessionExpiresAt = now.AddDays(azureSettings.SessionExpirationDays)
        };

        await sessionTable.AddEntityAsync(session);

        logger.LogInformation("Created session {VerificationCode}, expires at {ExpiresAt}",
            verificationCode, session.SessionExpiresAt);

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

    public async Task<string> CreateStateAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var stateValue = Guid.NewGuid().ToString("N"); // 32-char hex string

        var state = new StateEntity
        {
            RowKey = stateValue,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(azureSettings.StateExpirationMinutes)
        };

        await stateTable.AddEntityAsync(state);

        logger.LogInformation("Created state {State}, expires at {ExpiresAt}",
            stateValue, state.ExpiresAt);

        return stateValue;
    }

    public async Task<bool> ValidateAndConsumeStateAsync(string state)
    {
        try
        {
            var response = await stateTable.GetEntityAsync<StateEntity>("state", state);
            var stateEntity = response.Value;

            // Check if state has expired
            if (DateTimeOffset.UtcNow > stateEntity.ExpiresAt)
            {
                logger.LogWarning("State {State} has expired", state);
                await stateTable.DeleteEntityAsync("state", state);
                return false;
            }

            // Consume the state (delete it after successful validation)
            await stateTable.DeleteEntityAsync("state", state);
            logger.LogInformation("State {State} validated and consumed", state);

            return true;
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            logger.LogWarning("State {State} not found or already consumed", state);
            return false;
        }
    }

    #endregion

    #region Helper Methods

    private static string GenerateVerificationCode()
    {
        // Generate a secure random 32-character alphanumeric code
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")
            .Substring(0, 32);
    }

    #endregion
}
