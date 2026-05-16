using FluentValidation;

namespace Backend.Application.UseCases.Chats.ListChatMessages;

public sealed class ListChatMessagesCommandValidator : AbstractValidator<ListChatMessagesCommand>
{
    public ListChatMessagesCommandValidator()
    {
        RuleFor(x => x.ChatId)
            .NotEmpty();

        RuleFor(x => x.UserId)
            .NotEmpty();
    }
}
