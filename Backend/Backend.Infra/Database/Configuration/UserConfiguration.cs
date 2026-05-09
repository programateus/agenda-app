using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infra.Database.Configuration;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(user => user.Id);
        builder.Property(user => user.Id).HasColumnName("id");
        builder.Property(user => user.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
        builder.Property(user => user.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.HasIndex(user => user.Email).IsUnique();
        builder.Property(user => user.Password).HasColumnName("password").HasMaxLength(255).IsRequired();
        builder.Property(user => user.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(user => user.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}