using FluentValidation;

namespace Backend.Application.UseCases.Entries.DeleteEntry;

public class DeleteEntryCommandValidator: AbstractValidator<DeleteEntryCommand>
{
    public DeleteEntryCommandValidator()
    {
        RuleFor(x => x.EntryId)
            .NotEmpty();
        RuleFor(x => x.UserId)
            .NotEmpty();
        RuleFor(x => x.OriginalStartDate)
            .NotEmpty();
        RuleFor(x => x.Scope)
            .IsInEnum();
    }
}
