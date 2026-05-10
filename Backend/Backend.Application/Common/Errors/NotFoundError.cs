namespace Backend.Application.Common.Errors;

public sealed record NotFoundError : ApiError
{
   public NotFoundError(string message = "Not found error", object? data = null) : base(ApiErrorType.NotFound, message, data) { }
}