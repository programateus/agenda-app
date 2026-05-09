namespace Backend.Application.Common.Errors;

public sealed record ConflictError : ApiError
{
    public ConflictError(string message = "Conflict error", object? data = null) : base(ApiErrorType.Conflict, message, data) { }
};