using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infra.Database.Configuration;

public class ChatConfiguration : IEntityTypeConfiguration<Chat>
{
    public void Configure(EntityTypeBuilder<Chat> builder)
    {
        builder.ToTable("chats");
        builder.HasKey(chat => chat.Id);
        builder.Property(chat => chat.Id).HasColumnName("id");
        builder.Property(chat => chat.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(chat => chat.Status).HasColumnName("status").HasConversion<string>().IsRequired();
        builder.Property(chat => chat.LastMessageAt).HasColumnName("last_message_at").IsRequired();
        builder.Property(chat => chat.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(chat => chat.UpdatedAt).HasColumnName("updated_at").IsRequired();
        builder.HasIndex(chat => chat.UserId);

        builder.HasOne(chat => chat.User)
            .WithMany(user => user.Chats)
            .HasForeignKey(chat => chat.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(chat => chat.Messages)
            .WithOne(message => message.Chat)
            .HasForeignKey(message => message.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
