using FluentValidation;

namespace Backend.Application.UseCases.Chats.ListChats;

public sealed class ListChatsCommandValidator : AbstractValidator<ListChatsCommand>
{
    public ListChatsCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty();
    }
}
