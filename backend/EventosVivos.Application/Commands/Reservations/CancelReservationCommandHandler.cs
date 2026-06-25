using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Common.Exceptions;
using EventosVivos.Application.Contracts.Reservations;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Commands.Reservations;

public sealed class CancelReservationCommandHandler(IAppDbContext db, IDateTimeProvider clock)
    : IRequestHandler<CancelReservationCommand, ReservationDto>
{
    public async Task<ReservationDto> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
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

        if (reservation.Status == ReservationStatus.Cancelled)
        {
            throw new ConflictException("Reservation already cancelled.");
        }

        if (reservation.Status != ReservationStatus.Confirmed)
        {
            throw new ConflictException("Only confirmed reservations can be cancelled.");
        }

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == reservation.EventId, cancellationToken);
        if (ev is null)
        {
            throw new NotFoundException("Event not found.");
        }

        var hoursToStart = (ev.StartAt.ToUniversalTime() - clock.UtcNow).TotalHours;
        var isLost = hoursToStart < 48;

        reservation.Cancel(isLost, clock.UtcNow);

        await db.SaveChangesAsync(cancellationToken);

        return new ReservationDto(
            reservation.Id,
            reservation.EventId,
            reservation.BuyerName,
            reservation.BuyerEmail,
            reservation.Quantity,
            reservation.Status,
            reservation.ReservationCode,
            reservation.CreatedAt,
            reservation.CancelledAt,
            reservation.IsLost);
    }
}
