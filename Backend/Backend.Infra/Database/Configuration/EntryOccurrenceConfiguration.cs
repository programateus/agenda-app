using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infra.Database.Configuration;

public class EntryOccurrenceConfiguration : IEntityTypeConfiguration<EntryOccurrence>
{
    public void Configure(EntityTypeBuilder<EntryOccurrence> builder)
    {
        builder.ToTable("entry_occurrence");
        builder.HasKey(entryOccurrence => entryOccurrence.Id);
        builder.Property(entryOccurrence => entryOccurrence.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.StartDate).HasColumnName("start_date").IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.OriginalStartDate).HasColumnName("original_start_date").IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.EndDate).HasColumnName("end_date").IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.IsCanceled).HasColumnName("is_canceled").HasDefaultValue(false).IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.EntryId).HasColumnName("entry_id").IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(entryOccurrence => entryOccurrence.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(entryOccurrence => new
            {
                entryOccurrence.EntryId,
                entryOccurrence.OriginalStartDate
            })
            .IsUnique();
        
        builder.HasOne(entryOccurrence => entryOccurrence.Entry)
            .WithMany(entryOccurrence => entryOccurrence.EntryOccurrences)
            .HasForeignKey(entryOccurrence => entryOccurrence.EntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}