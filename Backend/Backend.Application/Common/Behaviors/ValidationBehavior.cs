using System.ComponentModel.DataAnnotations;
using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using FluentValidation;
using MediatR;
using ValidationException = FluentValidation.ValidationException;

namespace Backend.Application.Common.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next(cancellationToken);
        }

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();
        if (failures.Count == 0)
        {
            return await next(cancellationToken);
        }

        var errors = failures
            .GroupBy(x => x.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g
                    .Select(x => x.ErrorMessage)
                    .ToArray()
            );

        var validationError = new ValidationError(data: errors);
        return CreateValidationResult(validationError);
    }

    private static TResponse CreateValidationResult(ValidationError validationError)
    {
        var resultType = typeof(TResponse);

        if (!resultType.IsGenericType || resultType.GetGenericTypeDefinition() != typeof(Result<,>))
        {
            throw new InvalidOperationException(
                $"ValidationBehavior expected response type Result<T, AppError> but got {resultType.Name}"
            );
        }
        var types = resultType.GetGenericArguments();
        var successType = types[0];
        var errorType = types[1];
        
        var method = typeof(Result)
            .GetMethods()
            .First(m =>
                m.Name == nameof(Result.Failure) &&
                m.GetGenericArguments().Length == 2
            );

        var genericMethod = method.MakeGenericMethod(
            successType,
            errorType
        );

        return (TResponse)genericMethod.Invoke(
            null,
            [validationError]
        )!;
    
    }
}