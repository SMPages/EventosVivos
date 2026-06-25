using EventosVivos.Application.Commands.Events;
using FluentValidation;

namespace EventosVivos.Application.Validators;

public sealed class CreateEventValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventValidator()
    {
        RuleFor(x => x.Name).NotEmpty().Length(5, 100);
        RuleFor(x => x.Description).NotEmpty().Length(10, 500);
        RuleFor(x => x.VenueId).GreaterThan(0);
        RuleFor(x => x.StartAt).Must(start => start > DateTime.UtcNow).WithMessage("StartAt must be in the future.");
        RuleFor(x => x.StartAt).LessThan(x => x.EndAt);
        RuleFor(x => x.Capacity).GreaterThan(0);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.EventType).IsInEnum();

        RuleFor(x => x).Custom((cmd, context) =>
        {
            var day = cmd.StartAt.DayOfWeek;
            if (day is DayOfWeek.Saturday or DayOfWeek.Sunday)
            {
                if (cmd.StartAt.TimeOfDay > TimeSpan.FromHours(22))
                {
                    context.AddFailure("StartAt", "RN-03: Weekend events cannot start after 22:00.");
                }
            }
        });
    }
}
