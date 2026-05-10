namespace Backend.Application.Common.Errors;

public record UnauthorizedError : ApiError
{
    public UnauthorizedError(string message = "Unauthorized error", object? data = null) : base(ApiErrorType.Unauthorized, message, data) { }
}