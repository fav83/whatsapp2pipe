using Microsoft.EntityFrameworkCore;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Entity Framework Core DbContext for Chat2Deal database.
/// </summary>
public class Chat2DealDbContext : DbContext
{
    public Chat2DealDbContext(DbContextOptions<Chat2DealDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Companies table.
    /// </summary>
    public DbSet<Company> Companies { get; set; } = null!;

    /// <summary>
    /// Users table.
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Company entity
        modelBuilder.Entity<Company>(entity =>
        {
            entity.ToTable("Companies");

            entity.HasKey(c => c.CompanyId);

            // Unique constraint on PipedriveCompanyId
            entity.HasIndex(c => c.PipedriveCompanyId)
                  .IsUnique();

            // Required fields
            entity.Property(c => c.CompanyName)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(c => c.CompanyDomain)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(c => c.CreatedAt)
                  .IsRequired();

            // One-to-Many relationship
            entity.HasMany(c => c.Users)
                  .WithOne(u => u.Company)
                  .HasForeignKey(u => u.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasKey(u => u.UserId);

            // Composite unique constraint on PipedriveUserId + CompanyId
            entity.HasIndex(u => new { u.PipedriveUserId, u.CompanyId })
                  .IsUnique();

            // Required fields
            entity.Property(u => u.Name)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(u => u.Email)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(u => u.CreatedAt)
                  .IsRequired();

            entity.Property(u => u.LastLoginAt)
                  .IsRequired();
        });
    }
}
