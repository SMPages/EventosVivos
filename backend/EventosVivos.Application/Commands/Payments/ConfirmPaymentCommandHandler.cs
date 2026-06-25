using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Common.Exceptions;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Commands.Payments;

public sealed class ConfirmPaymentCommandHandler(IAppDbContext db, IDateTimeProvider clock)
    : IRequestHandler<ConfirmPaymentCommand, ConfirmPaymentResult>
{
    public async Task<ConfirmPaymentResult> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Id == request.ReservationId, cancellationToken);
        if (reservation is null)
        {
            throw new NotFoundException("Reservation not found.");
        }

        if (!string.Equals(reservation.ReservationCode, request.ReservationCode, StringComparison.Ordinal))
        {
            throw new ConflictException("Reservation code mismatch.");
        }

        if (reservation.Status == ReservationStatus.Confirmed)
        {
            throw new ConflictException("Reservation already confirmed.");
        }

        if (reservation.Status == ReservationStatus.Cancelled)
        {
            throw new ConflictException("Cancelled reservation cannot be confirmed.");
        }

        reservation.MarkConfirmed();

        db.Payments.Add(new Payment
        {
            ReservationId = reservation.Id,
            ConfirmedAt = clock.UtcNow,
            Reference = request.Reference,
            Status = PaymentStatus.Confirmed,
        });

        await db.SaveChangesAsync(cancellationToken);

        return new ConfirmPaymentResult(reservation.Id, reservation.ReservationCode, reservation.Status.ToString(), clock.UtcNow);
    }
}
