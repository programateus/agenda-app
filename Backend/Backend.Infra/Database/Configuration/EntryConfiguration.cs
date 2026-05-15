using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infra.Database.Configuration;

public class EntryConfiguration: IEntityTypeConfiguration<Entry>
{
    public void Configure(EntityTypeBuilder<Entry> builder)
    {
        builder.ToTable("entries");
        builder.HasKey(entry => entry.Id);
        builder.Property(entry => entry.Id).HasColumnName("id");
        builder.Property(entry => entry.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
        builder.Property(entry => entry.StartDate).HasColumnName("start_date").IsRequired();
        builder.Property(entry => entry.EndDate).HasColumnName("end_date").IsRequired();
        builder.Property(entry => entry.Until).HasColumnName("until");
        builder.Property(entry => entry.Frequency).HasColumnName("frequency").HasConversion<string>().IsRequired();
        builder.Property(entry => entry.OwnerId).HasColumnName("owner_id").IsRequired();
        builder.Property(entry => entry.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(entry => entry.UpdatedAt).HasColumnName("updated_at").IsRequired();
        
        builder.HasOne(entry => entry.Owner)
            .WithMany(user => user.Entries)
            .HasForeignKey(entry => entry.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(entry => entry.EntryOccurrences)
            .WithOne(entryOccurrence => entryOccurrence.Entry)
            .HasForeignKey(entryOccurrence => entryOccurrence.EntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}