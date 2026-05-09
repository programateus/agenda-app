namespace Backend.Application.Common.Errors;

public sealed record ValidationError : ApiError
{
    public ValidationError(string message = "Validation error", object? data = null) : base(ApiErrorType.UnprocessableEntity, message, data) { }
}