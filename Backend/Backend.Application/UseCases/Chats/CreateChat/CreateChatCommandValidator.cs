using FluentValidation;

namespace Backend.Application.UseCases.Chats.CreateChat;

public sealed class CreateChatCommandValidator : AbstractValidator<CreateChatCommand>
{
    public CreateChatCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty();
    }
}
