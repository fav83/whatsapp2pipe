using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Design-time factory for creating Chat2DealDbContext during migrations.
/// </summary>
public class Chat2DealDbContextFactory : IDesignTimeDbContextFactory<Chat2DealDbContext>
{
    public Chat2DealDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<Chat2DealDbContext>();

        // Use connection string from local.settings.json or default for design-time
        optionsBuilder.UseSqlServer(
            "Server=localhost;Database=chat2deal-dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");

        return new Chat2DealDbContext(optionsBuilder.Options);
    }
}
