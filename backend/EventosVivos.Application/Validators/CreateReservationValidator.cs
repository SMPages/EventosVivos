using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Commands.Reservations;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Validators;

public sealed class CreateReservationValidator : AbstractValidator<CreateReservationCommand>
{
    public CreateReservationValidator(IAppDbContext db, IDateTimeProvider clock)
    {
        RuleFor(x => x.EventId).GreaterThan(0);
        RuleFor(x => x.BuyerName).NotEmpty();
        RuleFor(x => x.BuyerEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Quantity).GreaterThan(0);

        RuleFor(x => x).MustAsync(async (cmd, ct) =>
        {
            var ev = await db.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == cmd.EventId, ct);
            if (ev is null)
            {
                return false;
            }

            var now = clock.UtcNow;
            var diff = ev.StartAt.ToUniversalTime() - now;

            if (diff < TimeSpan.FromHours(1))
            {
                return false;
            }

            if (diff < TimeSpan.FromHours(24) && cmd.Quantity > 5)
            {
                return false;
            }

            if (ev.Price > 100m && cmd.Quantity > 10)
            {
                return false;
            }

            return true;
        }).WithMessage("Reservation violates RN-04/RN-05/RF-03 constraints or event does not exist.");
    }
}
