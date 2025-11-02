using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Service for managing user and company entities.
/// </summary>
public class UserService : IUserService
{
    private readonly Chat2DealDbContext dbContext;
    private readonly ILogger<UserService> logger;

    public UserService(Chat2DealDbContext dbContext, ILogger<UserService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
    }

    /// <summary>
    /// Create or update user and company based on Pipedrive user data.
    /// </summary>
    public async Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData)
    {
        logger.LogInformation("Processing user {PipedriveUserId} from company {PipedriveCompanyId}",
            userData.Id, userData.CompanyId);

        // Step 1: Find or create Company
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.PipedriveCompanyId == userData.CompanyId);

        if (company == null)
        {
            logger.LogInformation("Creating new company {PipedriveCompanyId}", userData.CompanyId);

            company = new Company
            {
                CompanyId = Guid.NewGuid(),
                PipedriveCompanyId = userData.CompanyId,
                CompanyName = userData.CompanyName,
                CompanyDomain = userData.CompanyDomain,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.Companies.Add(company);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Created company {CompanyId}", company.CompanyId);
        }

        // Step 2: Find or create User
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.PipedriveUserId == userData.Id
                                   && u.CompanyId == company.CompanyId);

        if (user == null)
        {
            logger.LogInformation("Creating new user {PipedriveUserId}", userData.Id);

            user = new User
            {
                UserId = Guid.NewGuid(),
                CompanyId = company.CompanyId,
                PipedriveUserId = userData.Id,
                Name = userData.Name,
                Email = userData.Email,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            dbContext.Users.Add(user);

            logger.LogInformation("Created user {UserId}", user.UserId);
        }
        else
        {
            logger.LogInformation("Updating existing user {UserId}", user.UserId);

            // Update LastLoginAt on subsequent logins
            user.LastLoginAt = DateTime.UtcNow;

            logger.LogInformation("Updated LastLoginAt for user {UserId}", user.UserId);
        }

        await dbContext.SaveChangesAsync();

        return user;
    }

    /// <summary>
    /// Get user by Pipedrive user ID and company ID.
    /// </summary>
    public async Task<User?> GetUserByPipedriveIdAsync(int pipedriveUserId, int pipedriveCompanyId)
    {
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.PipedriveCompanyId == pipedriveCompanyId);

        if (company == null)
        {
            return null;
        }

        return await dbContext.Users
            .FirstOrDefaultAsync(u => u.PipedriveUserId == pipedriveUserId
                                   && u.CompanyId == company.CompanyId);
    }

    /// <summary>
    /// Get user by user ID with Company navigation property.
    /// </summary>
    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await dbContext.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.UserId == userId);
    }

    /// <summary>
    /// Update user entity.
    /// </summary>
    public async Task UpdateUserAsync(User user)
    {
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();
    }
}
