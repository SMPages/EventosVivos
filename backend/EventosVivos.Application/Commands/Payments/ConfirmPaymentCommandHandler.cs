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
        var reservationCode = request.ReservationCode.Trim();
        var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == reservationCode, cancellationToken);
        if (reservation is null)
        {
            throw new NotFoundException("Reservation not found.");
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
        var confirmedAt = clock.UtcNow;
        var paymentReference = $"PAY-{reservation.ReservationCode}-{confirmedAt:yyyyMMddHHmmss}";

        db.Payments.Add(new Payment
        {
            ReservationId = reservation.Id,
            ConfirmedAt = confirmedAt,
            Reference = paymentReference,
            Status = PaymentStatus.Confirmed,
        });

        await db.SaveChangesAsync(cancellationToken);

        return new ConfirmPaymentResult(reservation.Id, reservation.ReservationCode, paymentReference, reservation.Status.ToString(), confirmedAt);
    }
}
