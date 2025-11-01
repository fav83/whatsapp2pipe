using AutoFixture;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class UserServiceTests : IDisposable
{
    private readonly Mock<ILogger<UserService>> mockLogger;
    private readonly Chat2DealDbContext dbContext;
    private readonly UserService service;
    private readonly Fixture fixture;

    public UserServiceTests()
    {
        mockLogger = new Mock<ILogger<UserService>>();
        fixture = new Fixture();
        fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => fixture.Behaviors.Remove(b));
        fixture.Behaviors.Add(new OmitOnRecursionBehavior());

        // Create in-memory database
        var options = new DbContextOptionsBuilder<Chat2DealDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        dbContext = new Chat2DealDbContext(options);

        service = new UserService(dbContext, mockLogger.Object);
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
    }

    #region CreateOrUpdateUserAsync Tests

    [Fact]
    public async Task CreateOrUpdateUserAsync_NewUserAndCompany_CreatesCompanyAndUser()
    {
        // Arrange
        var userData = CreateTestUserData();

        // Act
        var user = await service.CreateOrUpdateUserAsync(userData);

        // Assert
        Assert.NotNull(user);
        Assert.NotEqual(Guid.Empty, user.UserId);
        Assert.Equal(userData.Id, user.PipedriveUserId);
        Assert.Equal(userData.Name, user.Name);
        Assert.Equal(userData.Email, user.Email);
        Assert.True(user.CreatedAt <= DateTime.UtcNow);
        Assert.True(user.LastLoginAt <= DateTime.UtcNow);

        // Verify company was created
        var company = await dbContext.Companies.FindAsync(user.CompanyId);
        Assert.NotNull(company);
        Assert.Equal(userData.CompanyId, company.PipedriveCompanyId);
        Assert.Equal(userData.CompanyName, company.CompanyName);
        Assert.Equal(userData.CompanyDomain, company.CompanyDomain);
    }

    [Fact]
    public async Task CreateOrUpdateUserAsync_ExistingCompanyNewUser_ReusesCompanyCreatesUser()
    {
        // Arrange
        var existingCompany = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 123,
            CompanyName = "Existing Company",
            CompanyDomain = "existing.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        await dbContext.Companies.AddAsync(existingCompany);
        await dbContext.SaveChangesAsync();

        var userData = CreateTestUserData();
        userData.CompanyId = existingCompany.PipedriveCompanyId;
        userData.CompanyName = existingCompany.CompanyName;
        userData.CompanyDomain = existingCompany.CompanyDomain;

        // Act
        var user = await service.CreateOrUpdateUserAsync(userData);

        // Assert
        Assert.NotNull(user);
        Assert.Equal(existingCompany.CompanyId, user.CompanyId);

        // Verify no duplicate company was created
        var companyCount = await dbContext.Companies
            .CountAsync(c => c.PipedriveCompanyId == existingCompany.PipedriveCompanyId);
        Assert.Equal(1, companyCount);
    }

    [Fact]
    public async Task CreateOrUpdateUserAsync_ExistingUser_UpdatesLastLoginAt()
    {
        // Arrange
        var company = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 123,
            CompanyName = "Test Company",
            CompanyDomain = "test.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        await dbContext.Companies.AddAsync(company);

        var existingUser = new User
        {
            UserId = Guid.NewGuid(),
            CompanyId = company.CompanyId,
            PipedriveUserId = 456,
            Name = "Old Name",
            Email = "old@email.com",
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            LastLoginAt = DateTime.UtcNow.AddDays(-7)
        };
        await dbContext.Users.AddAsync(existingUser);
        await dbContext.SaveChangesAsync();

        var originalLastLoginAt = existingUser.LastLoginAt;

        var userData = new PipedriveUserData
        {
            Id = existingUser.PipedriveUserId,
            Name = "Updated Name",
            Email = "updated@email.com",
            CompanyId = company.PipedriveCompanyId,
            CompanyName = company.CompanyName,
            CompanyDomain = company.CompanyDomain
        };

        // Wait a tiny bit to ensure LastLoginAt changes
        await Task.Delay(10);

        // Act
        var user = await service.CreateOrUpdateUserAsync(userData);

        // Assert
        Assert.NotNull(user);
        Assert.Equal(existingUser.UserId, user.UserId);
        Assert.True(user.LastLoginAt > originalLastLoginAt);
        Assert.Equal(existingUser.CreatedAt, user.CreatedAt); // CreatedAt should not change

        // Verify user count didn't increase
        var userCount = await dbContext.Users
            .CountAsync(u => u.PipedriveUserId == userData.Id && u.CompanyId == company.CompanyId);
        Assert.Equal(1, userCount);
    }

    [Fact]
    public async Task CreateOrUpdateUserAsync_SameUserDifferentCompany_CreatesNewUser()
    {
        // Arrange
        var company1 = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 100,
            CompanyName = "Company 1",
            CompanyDomain = "company1.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        var company2 = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 200,
            CompanyName = "Company 2",
            CompanyDomain = "company2.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        await dbContext.Companies.AddAsync(company1);
        await dbContext.Companies.AddAsync(company2);

        var user1 = new User
        {
            UserId = Guid.NewGuid(),
            CompanyId = company1.CompanyId,
            PipedriveUserId = 123,
            Name = "User",
            Email = "user@test.com",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };
        await dbContext.Users.AddAsync(user1);
        await dbContext.SaveChangesAsync();

        // Same Pipedrive user ID but different company
        var userData = new PipedriveUserData
        {
            Id = 123, // Same Pipedrive user ID
            Name = "User",
            Email = "user@test.com",
            CompanyId = company2.PipedriveCompanyId, // Different company
            CompanyName = company2.CompanyName,
            CompanyDomain = company2.CompanyDomain
        };

        // Act
        var user2 = await service.CreateOrUpdateUserAsync(userData);

        // Assert
        Assert.NotNull(user2);
        Assert.NotEqual(user1.UserId, user2.UserId);
        Assert.Equal(company2.CompanyId, user2.CompanyId);

        // Verify two separate users exist
        var userCount = await dbContext.Users.CountAsync(u => u.PipedriveUserId == 123);
        Assert.Equal(2, userCount);
    }

    [Fact]
    public async Task CreateOrUpdateUserAsync_MultipleCallsSameUser_OnlyUpdatesLastLoginAt()
    {
        // Arrange
        var userData = CreateTestUserData();

        // Act - First call creates user
        var user1 = await service.CreateOrUpdateUserAsync(userData);
        var firstLastLoginAt = user1.LastLoginAt;
        await Task.Delay(10); // Ensure different timestamp

        // Act - Second call updates user
        var user2 = await service.CreateOrUpdateUserAsync(userData);

        // Assert
        Assert.Equal(user1.UserId, user2.UserId);
        Assert.Equal(user1.CreatedAt, user2.CreatedAt);
        Assert.True(user2.LastLoginAt > firstLastLoginAt);

        // Verify only one user exists
        var userCount = await dbContext.Users
            .CountAsync(u => u.PipedriveUserId == userData.Id);
        Assert.Equal(1, userCount);
    }

    #endregion

    #region GetUserByPipedriveIdAsync Tests

    [Fact]
    public async Task GetUserByPipedriveIdAsync_ExistingUser_ReturnsUser()
    {
        // Arrange
        var company = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 123,
            CompanyName = "Test Company",
            CompanyDomain = "test.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        await dbContext.Companies.AddAsync(company);

        var user = new User
        {
            UserId = Guid.NewGuid(),
            CompanyId = company.CompanyId,
            PipedriveUserId = 456,
            Name = "Test User",
            Email = "test@test.com",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        // Act
        var result = await service.GetUserByPipedriveIdAsync(
            user.PipedriveUserId, company.PipedriveCompanyId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(user.UserId, result.UserId);
        Assert.Equal(user.Name, result.Name);
        Assert.Equal(user.Email, result.Email);
    }

    [Fact]
    public async Task GetUserByPipedriveIdAsync_NonExistentUser_ReturnsNull()
    {
        // Arrange
        var company = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 123,
            CompanyName = "Test Company",
            CompanyDomain = "test.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        await dbContext.Companies.AddAsync(company);
        await dbContext.SaveChangesAsync();

        // Act
        var result = await service.GetUserByPipedriveIdAsync(999, company.PipedriveCompanyId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetUserByPipedriveIdAsync_NonExistentCompany_ReturnsNull()
    {
        // Act
        var result = await service.GetUserByPipedriveIdAsync(456, 999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetUserByPipedriveIdAsync_WrongCompany_ReturnsNull()
    {
        // Arrange
        var company1 = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 100,
            CompanyName = "Company 1",
            CompanyDomain = "company1.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        var company2 = new Company
        {
            CompanyId = Guid.NewGuid(),
            PipedriveCompanyId = 200,
            CompanyName = "Company 2",
            CompanyDomain = "company2.pipedrive.com",
            CreatedAt = DateTime.UtcNow
        };
        await dbContext.Companies.AddAsync(company1);
        await dbContext.Companies.AddAsync(company2);

        var user = new User
        {
            UserId = Guid.NewGuid(),
            CompanyId = company1.CompanyId,
            PipedriveUserId = 456,
            Name = "Test User",
            Email = "test@test.com",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();

        // Act - Try to get user with correct Pipedrive ID but wrong company
        var result = await service.GetUserByPipedriveIdAsync(
            user.PipedriveUserId, company2.PipedriveCompanyId);

        // Assert
        Assert.Null(result);
    }

    #endregion

    #region Helper Methods

    private PipedriveUserData CreateTestUserData()
    {
        return new PipedriveUserData
        {
            Id = fixture.Create<int>(),
            Name = fixture.Create<string>(),
            Email = fixture.Create<string>(),
            CompanyId = fixture.Create<int>(),
            CompanyName = fixture.Create<string>(),
            CompanyDomain = fixture.Create<string>()
        };
    }

    #endregion
}
