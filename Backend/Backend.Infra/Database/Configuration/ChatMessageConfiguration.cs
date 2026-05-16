using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infra.Database.Configuration;

public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("chat_messages");
        builder.HasKey(message => message.Id);
        builder.Property(message => message.Id).HasColumnName("id");
        builder.Property(message => message.ChatId).HasColumnName("chat_id").IsRequired();
        builder.Property(message => message.SenderRole).HasColumnName("sender_role").HasConversion<string>().IsRequired();
        builder.Property(message => message.Content).HasColumnName("content").IsRequired();
        builder.Property(message => message.Status).HasColumnName("status").HasConversion<string>().IsRequired();
        builder.Property(message => message.TraceId).HasColumnName("trace_id").IsRequired();
        builder.Property(message => message.ErrorMessage).HasColumnName("error_message").HasMaxLength(2000).IsRequired();
        builder.Property(message => message.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(message => message.UpdatedAt).HasColumnName("updated_at").IsRequired();
        builder.HasIndex(message => message.ChatId);

        builder.HasOne(message => message.Chat)
            .WithMany(chat => chat.Messages)
            .HasForeignKey(message => message.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
