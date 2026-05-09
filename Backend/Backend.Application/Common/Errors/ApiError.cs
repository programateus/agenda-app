namespace Backend.Application.Common.Errors;

public abstract record ApiError
{
    public ApiErrorType ErrorType;
    public string Message;
    public object? Data = null;  
    
    protected ApiError(
        ApiErrorType errorType,
        string message,
        object? data = null 
    )
    {
        ErrorType = errorType;
        Message = message;
        Data = data;
    }
}