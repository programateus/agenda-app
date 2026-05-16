using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infra.Database;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Entry> Entries => Set<Entry>();
    public DbSet<EntryOccurrence> EntryOccurrences => Set<EntryOccurrence>();
    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
