using AutoFixture;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class SqlSessionServiceTests : IDisposable
{
    private readonly Mock<ILogger<SqlSessionService>> mockLogger;
    private readonly Chat2DealDbContext dbContext;
    private readonly IDbContextFactory<Chat2DealDbContext> dbContextFactory;
    private readonly SqlSessionService service;
    private readonly Fixture fixture;

    public SqlSessionServiceTests()
    {
        mockLogger = new Mock<ILogger<SqlSessionService>>();
        fixture = new Fixture();
        fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => fixture.Behaviors.Remove(b));
        fixture.Behaviors.Add(new OmitOnRecursionBehavior());

        // Create in-memory database with transaction warning suppressed
        var options = new DbContextOptionsBuilder<Chat2DealDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        dbContext = new Chat2DealDbContext(options);

        dbContextFactory = new TestDbContextFactory(options);
        service = new SqlSessionService(dbContextFactory, mockLogger.Object);
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
    }

    #region CreateSessionAsync Tests

    [Fact]
    public async Task CreateSessionAsync_ValidData_CreatesSession()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var companyId = Guid.NewGuid();
        var accessToken = fixture.Create<string>();
        var refreshToken = fixture.Create<string>();
        var apiDomain = "api.pipedrive.com";
        var expiresIn = 3600;
        var extensionId = fixture.Create<string>();

        // Act
        var session = await service.CreateSessionAsync(
            userId, companyId, accessToken, refreshToken, apiDomain, expiresIn, extensionId);

        // Assert
        Assert.NotNull(session);
        Assert.NotEqual(Guid.Empty, session.SessionId);
        Assert.Equal(32, session.VerificationCode.Length);
        Assert.Equal(userId, session.UserId);
        Assert.Equal(companyId, session.CompanyId);
        Assert.Equal(accessToken, session.AccessToken);
        Assert.Equal(refreshToken, session.RefreshToken);
        Assert.Equal(apiDomain, session.ApiDomain);
        Assert.Equal(extensionId, session.ExtensionId);
        Assert.True(session.ExpiresAt > DateTime.UtcNow);
        Assert.True(session.SessionExpiresAt > DateTime.UtcNow.AddDays(59));
        Assert.True(session.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task CreateSessionAsync_MultipleCreations_GeneratesUniqueVerificationCodes()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var companyId = Guid.NewGuid();

        // Act
        var session1 = await service.CreateSessionAsync(
            userId, companyId, "token1", "refresh1", "api.com", 3600, "ext1");
        var session2 = await service.CreateSessionAsync(
            userId, companyId, "token2", "refresh2", "api.com", 3600, "ext2");

        // Assert
        Assert.NotEqual(session1.VerificationCode, session2.VerificationCode);
    }

    [Fact]
    public async Task CreateSessionAsync_SavesSessionToDatabase()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var companyId = Guid.NewGuid();

        // Act
        var session = await service.CreateSessionAsync(
            userId, companyId, "token", "refresh", "api.com", 3600, "ext");

        // Assert
        var savedSession = await dbContext.Sessions.FindAsync(session.SessionId);
        Assert.NotNull(savedSession);
        Assert.Equal(session.VerificationCode, savedSession.VerificationCode);
    }

    #endregion

    #region GetSessionAsync Tests

    [Fact]
    public async Task GetSessionAsync_ValidVerificationCode_ReturnsSession()
    {
        // Arrange
        var company = CreateTestCompany();
        var user = CreateTestUser(company.CompanyId);
        await dbContext.Companies.AddAsync(company);
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        var session = await service.CreateSessionAsync(
            user.UserId, user.CompanyId, "token", "refresh", "api.com", 3600, "ext");

        // Act
        var result = await service.GetSessionAsync(session.VerificationCode);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(session.VerificationCode, result.VerificationCode);
        Assert.NotNull(result.User);
        Assert.NotNull(result.Company);
        Assert.Equal(user.UserId, result.User.UserId);
        Assert.Equal(company.CompanyId, result.Company.CompanyId);
    }

    [Fact]
    public async Task GetSessionAsync_NonExistentVerificationCode_ReturnsNull()
    {
        // Arrange
        var nonExistentCode = "nonexistent123456789012345678901";

        // Act
        var result = await service.GetSessionAsync(nonExistentCode);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetSessionAsync_ExpiredSession_ReturnsNullAndDeletesSession()
    {
        // Arrange
        var company = CreateTestCompany();
        var user = CreateTestUser(company.CompanyId);
        await dbContext.Companies.AddAsync(company);
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        var expiredSession = new Session
        {
            SessionId = Guid.NewGuid(),
            VerificationCode = "expired12345678901234567890123",
            UserId = user.UserId,
            CompanyId = user.CompanyId,
            AccessToken = "token",
            RefreshToken = "refresh",
            ApiDomain = "api.com",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            SessionExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired
            ExtensionId = "ext",
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };
        await dbContext.Sessions.AddAsync(expiredSession);
        await dbContext.SaveChangesAsync();

        // Act
        var result = await service.GetSessionAsync(expiredSession.VerificationCode);

        // Assert
        Assert.Null(result);
        dbContext.ChangeTracker.Clear(); // Clear tracked entities
        var deletedSession = await dbContext.Sessions.FindAsync(expiredSession.SessionId);
        Assert.Null(deletedSession);
    }

    [Fact]
    public async Task GetSessionAsync_ValidSession_LoadsNavigationProperties()
    {
        // Arrange
        var company = CreateTestCompany();
        var user = CreateTestUser(company.CompanyId);
        await dbContext.Companies.AddAsync(company);
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        var session = await service.CreateSessionAsync(
            user.UserId, user.CompanyId, "token", "refresh", "api.com", 3600, "ext");

        // Act
        var result = await service.GetSessionAsync(session.VerificationCode);

        // Assert
        Assert.NotNull(result.User);
        Assert.NotNull(result.Company);
        Assert.Equal(user.Name, result.User.Name);
        Assert.Equal(company.CompanyName, result.Company.CompanyName);
    }

    #endregion

    #region UpdateSessionAsync Tests

    [Fact]
    public async Task UpdateSessionAsync_ValidSession_UpdatesDatabase()
    {
        // Arrange
        var company = CreateTestCompany();
        var user = CreateTestUser(company.CompanyId);
        await dbContext.Companies.AddAsync(company);
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        var session = await service.CreateSessionAsync(
            user.UserId, user.CompanyId, "oldToken", "oldRefresh", "api.com", 3600, "ext");

        // Act
        session.AccessToken = "newToken";
        session.RefreshToken = "newRefresh";
        session.ExpiresAt = DateTime.UtcNow.AddHours(2);
        await service.UpdateSessionAsync(session);

        // Assert
        var updatedSession = await dbContext.Sessions.FindAsync(session.SessionId);
        Assert.NotNull(updatedSession);
        Assert.Equal("newToken", updatedSession.AccessToken);
        Assert.Equal("newRefresh", updatedSession.RefreshToken);
    }

    #endregion

    #region DeleteSessionAsync Tests

    [Fact]
    public async Task DeleteSessionAsync_ExistingSession_DeletesFromDatabase()
    {
        // Arrange
        var company = CreateTestCompany();
        var user = CreateTestUser(company.CompanyId);
        await dbContext.Companies.AddAsync(company);
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        var session = await service.CreateSessionAsync(
            user.UserId, user.CompanyId, "token", "refresh", "api.com", 3600, "ext");

        // Act
        await service.DeleteSessionAsync(session.VerificationCode);

        // Assert
        var deletedSession = await dbContext.Sessions.FindAsync(session.SessionId);
        Assert.Null(deletedSession);
    }

    [Fact]
    public async Task DeleteSessionAsync_NonExistentSession_DoesNotThrow()
    {
        // Arrange
        var nonExistentCode = "nonexistent123456789012345678901";

        // Act & Assert (should not throw)
        await service.DeleteSessionAsync(nonExistentCode);
    }

    #endregion

    #region StoreStateAsync Tests

    [Fact]
    public async Task StoreStateAsync_ValidState_StoresInDatabase()
    {
        // Arrange
        var state = fixture.Create<string>();

        // Act
        await service.StoreStateAsync(state);

        // Assert
        var storedState = await dbContext.States.FirstOrDefaultAsync();
        Assert.NotNull(storedState);
        Assert.Equal(state, storedState.StateValue);
        Assert.Equal(32, storedState.StateHash.Length); // SHA256 first 16 bytes = 32 hex chars
        Assert.True(storedState.ExpiresAt > DateTime.UtcNow.AddMinutes(4));
    }

    [Fact]
    public async Task StoreStateAsync_ComputesCorrectHash()
    {
        // Arrange
        var state = "test-state-value";

        // Act
        await service.StoreStateAsync(state);

        // Assert
        var storedState = await dbContext.States.FirstOrDefaultAsync();
        Assert.NotNull(storedState);
        Assert.NotEmpty(storedState.StateHash);
        // Hash should be deterministic
        Assert.Matches("^[0-9a-f]{32}$", storedState.StateHash);
    }

    #endregion

    #region ValidateAndConsumeStateAsync Tests

    [Fact]
    public async Task ValidateAndConsumeStateAsync_ValidState_ReturnsTrueAndDeletesState()
    {
        // Arrange
        var state = fixture.Create<string>();
        await service.StoreStateAsync(state);

        // Act
        var result = await service.ValidateAndConsumeStateAsync(state);

        // Assert
        Assert.True(result);
        var deletedState = await dbContext.States.FirstOrDefaultAsync();
        Assert.Null(deletedState); // Should be deleted (consumed)
    }

    [Fact]
    public async Task ValidateAndConsumeStateAsync_NonExistentState_ReturnsFalse()
    {
        // Arrange
        var nonExistentState = "nonexistent-state";

        // Act
        var result = await service.ValidateAndConsumeStateAsync(nonExistentState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ValidateAndConsumeStateAsync_ExpiredState_ReturnsFalseAndDeletesState()
    {
        // Arrange
        var state = "expired-state";
        var expiredStateEntity = new State
        {
            StateId = Guid.NewGuid(),
            StateHash = ComputeTestHash(state),
            StateValue = state,
            CreatedAt = DateTime.UtcNow.AddMinutes(-10),
            ExpiresAt = DateTime.UtcNow.AddMinutes(-5) // Expired
        };
        await dbContext.States.AddAsync(expiredStateEntity);
        await dbContext.SaveChangesAsync();

        // Act
        var result = await service.ValidateAndConsumeStateAsync(state);

        // Assert
        Assert.False(result);
        dbContext.ChangeTracker.Clear(); // Clear tracked entities
        var deletedState = await dbContext.States.FindAsync(expiredStateEntity.StateId);
        Assert.Null(deletedState); // Should be deleted
    }

    [Fact]
    public async Task ValidateAndConsumeStateAsync_OneTimeUse_SecondCallReturnsFalse()
    {
        // Arrange
        var state = fixture.Create<string>();
        await service.StoreStateAsync(state);

        // Act
        var firstCall = await service.ValidateAndConsumeStateAsync(state);
        var secondCall = await service.ValidateAndConsumeStateAsync(state);

        // Assert
        Assert.True(firstCall);
        Assert.False(secondCall); // State already consumed
    }

    #endregion

    #region Helper Methods

    private Company CreateTestCompany()
    {
        return new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = fixture.Create<int>(),
            CompanyName = fixture.Create<string>(),
            CompanyDomain = fixture.Create<string>(),
            CreatedAt = DateTime.UtcNow
        };
    }

    private User CreateTestUser(Guid companyId)
    {
        return new User
        {
            UserId = Guid.NewGuid(),
            CompanyId = companyId,
            PipedriveUserId = fixture.Create<int>(),
            Name = fixture.Create<string>(),
            Email = fixture.Create<string>(),
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };
    }

    private static string ComputeTestHash(string state)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(state));
        var sb = new System.Text.StringBuilder(32);
        for (int i = 0; i < 16; i++)
        {
            sb.Append(hashBytes[i].ToString("x2"));
        }
        return sb.ToString();
    }

    #endregion
}

// Local factory to create DbContext instances for the service under test
file class TestDbContextFactory : IDbContextFactory<Chat2DealDbContext>
{
    private readonly DbContextOptions<Chat2DealDbContext> options;
    public TestDbContextFactory(DbContextOptions<Chat2DealDbContext> options)
    {
        this.options = options;
    }

    public Chat2DealDbContext CreateDbContext()
    {
        return new Chat2DealDbContext(options);
    }

    public Task<Chat2DealDbContext> CreateDbContextAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new Chat2DealDbContext(options));
    }
}
