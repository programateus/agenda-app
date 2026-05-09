using Backend.Application;
using Backend.Infra;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddApplication();
builder.Services.AddInfra(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Schedule API";
    });
}

if (!app.Environment.IsEnvironment("Lambda"))
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    Name = "Scheduling API",
    Status = "Running"
}));

app.Run();