using FluentValidation;

namespace Backend.Application.UseCases.Chats.CreateAssistantChatMessage;

public sealed class CreateAssistantChatMessageCommandValidator : AbstractValidator<CreateAssistantChatMessageCommand>
{
    public CreateAssistantChatMessageCommandValidator()
    {
        RuleFor(x => x.ChatId)
            .NotEmpty();

        RuleFor(x => x.TraceId)
            .NotEmpty();

        RuleFor(x => x.Content)
            .NotEmpty();
    }
}
