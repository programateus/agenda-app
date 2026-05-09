namespace Backend.Lambda.DTOs;

public record SignUpDTO(
    string Name,
    string Email,
    string Password
);