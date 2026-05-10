namespace Backend.Lambda.DTOs;

public sealed record SignInDTO(
    string Email,
    string Password
);