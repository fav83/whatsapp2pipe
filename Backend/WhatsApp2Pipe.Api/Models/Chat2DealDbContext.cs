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

    /// <summary>
    /// Sessions table - OAuth session management.
    /// </summary>
    public DbSet<Session> Sessions { get; set; } = null!;

    /// <summary>
    /// States table - OAuth CSRF protection.
    /// </summary>
    public DbSet<State> States { get; set; } = null!;

    /// <summary>
    /// Invites table - Closed beta invite codes.
    /// </summary>
    public DbSet<Invite> Invites { get; set; } = null!;

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

            // Foreign key relationship to Invite
            entity.HasOne(u => u.Invite)
                  .WithMany(i => i.Users)
                  .HasForeignKey(u => u.InviteId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Session entity
        modelBuilder.Entity<Session>(entity =>
        {
            entity.ToTable("Sessions");

            entity.HasKey(s => s.SessionId);

            // Unique index on VerificationCode (used as Bearer token)
            entity.HasIndex(s => s.VerificationCode)
                  .IsUnique()
                  .HasDatabaseName("IX_Sessions_VerificationCode");

            // Index on UserId for user session queries
            entity.HasIndex(s => s.UserId)
                  .HasDatabaseName("IX_Sessions_UserId");

            // Index on CompanyId for company session queries
            entity.HasIndex(s => s.CompanyId)
                  .HasDatabaseName("IX_Sessions_CompanyId");

            // Composite index on UserId + CompanyId
            entity.HasIndex(s => new { s.UserId, s.CompanyId })
                  .HasDatabaseName("IX_Sessions_UserId_CompanyId");

            // Required fields
            entity.Property(s => s.VerificationCode)
                  .IsRequired()
                  .HasMaxLength(32);

            entity.Property(s => s.AccessToken)
                  .IsRequired();

            entity.Property(s => s.RefreshToken)
                  .IsRequired();

            entity.Property(s => s.ApiDomain)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(s => s.ExpiresAt)
                  .IsRequired();

            entity.Property(s => s.SessionExpiresAt)
                  .IsRequired();

            entity.Property(s => s.ExtensionId)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(s => s.CreatedAt)
                  .IsRequired();

            // Foreign key relationships
            entity.HasOne(s => s.User)
                  .WithMany()
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.Company)
                  .WithMany()
                  .HasForeignKey(s => s.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure State entity
        modelBuilder.Entity<State>(entity =>
        {
            entity.ToTable("States");

            entity.HasKey(s => s.StateId);

            // Unique index on StateHash for fast lookup
            entity.HasIndex(s => s.StateHash)
                  .IsUnique()
                  .HasDatabaseName("IX_States_StateHash");

            // Required fields
            entity.Property(s => s.StateHash)
                  .IsRequired()
                  .HasMaxLength(64);

            entity.Property(s => s.StateValue)
                  .IsRequired();

            entity.Property(s => s.CreatedAt)
                  .IsRequired();

            entity.Property(s => s.ExpiresAt)
                  .IsRequired();
        });

        // Configure Invite entity
        modelBuilder.Entity<Invite>(entity =>
        {
            entity.ToTable("Invites");

            entity.HasKey(i => i.InviteId);

            // Unique constraint on Code
            entity.HasIndex(i => i.Code)
                  .IsUnique()
                  .HasDatabaseName("IX_Invites_Code");

            // Required fields
            entity.Property(i => i.Code)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(i => i.CreatedAt)
                  .IsRequired();

            entity.Property(i => i.UsageCount)
                  .IsRequired();

            entity.Property(i => i.Description)
                  .HasMaxLength(500);

            // One-to-Many relationship
            entity.HasMany(i => i.Users)
                  .WithOne(u => u.Invite)
                  .HasForeignKey(u => u.InviteId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
