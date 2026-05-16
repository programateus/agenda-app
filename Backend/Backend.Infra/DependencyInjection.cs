using Amazon.EventBridge;
using Backend.Application.Contracts.Auth;
using Backend.Application.Contracts.EntryGenerator;
using Backend.Application.Contracts.Security;
using Backend.Domain.Repositories;
using Backend.Infra.Auth;
using Backend.Infra.Database;
using Backend.Infra.Database.Repositories;
using Backend.Infra.EntryGenerator;
using Backend.Infra.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Backend.Application.Contracts.PubSub;
using Backend.Infra.Aws.PubSub;

namespace Backend.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddInfra(this IServiceCollection services,  IConfiguration configuration)
    {
        services.AddDbContextPool<AppDbContext>(options =>
        {
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection"));
        });
        
        services.Configure<JwtOptions>(
            configuration.GetSection("Jwt")
        );

        var awsOptions = configuration.GetAWSOptions();
        services.AddDefaultAWSOptions(awsOptions);
        services.AddAWSService<IAmazonEventBridge>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IEntryRepository, EntryRepository>();
        services.AddScoped<IEntryOccurrenceRepository, EntryOccurrenceRepository>();
        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
        services.AddScoped<IPasswordHasher, BcryptAdapter>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IEntryOccurrenceGenerator, EntryOccurrenceGenerator>();
        services.AddScoped<IEntryEventPublisher, EventBridgeEntryEventPublisher>();
        services.AddScoped<IEntryOccurrenceEventPublisher, EventBridgeEntryOccurrenceEventPublisher>();
        return services;
    }
}
