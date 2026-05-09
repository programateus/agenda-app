using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Lambda.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(
        this Result<T, ApiError> result,
        ControllerBase controller,
        string successMessage = "Success")
    {
        if (result.IsSuccess)
        {
            // TODO: Post usually returns 202
            var response = new ApiResponse<T>(
                Code: 200,
                Message: successMessage,
                Data: result.Value
            );

            return controller.Ok(response);
        }

        var error = result.Error;

        var errorResponse = new ApiResponse<object>(
            Code: (int)error.ErrorType,
            Message: error.Message,
            Data: error.Data
        );

        return controller.StatusCode(
            (int)error.ErrorType,
            errorResponse
        );
    }
}