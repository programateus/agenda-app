using FluentValidation;

namespace Backend.Application.UseCases.Chats.CreateChatMessage;

public sealed class CreateChatMessageCommandValidator : AbstractValidator<CreateChatMessageCommand>
{
    public CreateChatMessageCommandValidator()
    {
        RuleFor(x => x.ChatId)
            .NotEmpty();

        RuleFor(x => x.UserId)
            .NotEmpty();

        RuleFor(x => x.Content)
            .NotEmpty();
    }
}
