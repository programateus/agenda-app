using FluentValidation;

namespace Backend.Application.UseCases.Auth.SignIn;

public sealed class SignInCommandValidator : AbstractValidator<SignInCommand>
{
    public SignInCommandValidator()
    {
        RuleFor(command => command.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);
        RuleFor(command => command.Password)
            .NotEmpty()
            .MinimumLength(1)
            .MaximumLength(255);
    }
}