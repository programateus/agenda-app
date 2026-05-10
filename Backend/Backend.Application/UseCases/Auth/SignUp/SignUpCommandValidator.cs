using FluentValidation;

namespace Backend.Application.UseCases.Auth.SignUp;

public sealed class SignUpCommandValidator : AbstractValidator<SignUpCommand>
{
    public SignUpCommandValidator()
    {
        RuleFor(signUpCommand => signUpCommand.Name)
            .NotEmpty()
            .MinimumLength(1)
            .MaximumLength(255);
        RuleFor(signUpCommand => signUpCommand.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);
        RuleFor(signUpCommand => signUpCommand.Password)
            .NotEmpty()
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$")
            .MinimumLength(8)
            .MaximumLength(255);
    }
}