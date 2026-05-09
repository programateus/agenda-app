namespace Backend.Lambda.Extensions;

public sealed record ApiResponse<T>(
    int Code,
    string Message,
    T? Data
);