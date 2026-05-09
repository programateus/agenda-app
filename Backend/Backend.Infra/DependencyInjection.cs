using Backend.Application.Contracts.Security;
using Backend.Domain.Repositories;
using Backend.Infra.Database;
using Backend.Infra.Database.Repositories;
using Backend.Infra.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddInfra(this IServiceCollection services,  IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordHasher, BcryptAdapter>();
        return services;
    }
}