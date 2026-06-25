using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Common.Exceptions;
using EventosVivos.Application.Contracts.Reservations;
using EventosVivos.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Commands.Reservations;

public sealed class CreateReservationCommandHandler(IAppDbContext db, IReservationCodeGenerator codeGenerator, IDateTimeProvider clock)
    : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);
        if (ev is null)
        {
            throw new NotFoundException("Event not found.");
        }

        var confirmedOrPending = await db.Reservations
            .Where(r => r.EventId == request.EventId)
            .Where(r => r.Status != Domain.Enums.ReservationStatus.Cancelled || r.IsLost)
            .SumAsync(r => (int?)r.Quantity, cancellationToken) ?? 0;

        if (confirmedOrPending + request.Quantity > ev.Capacity)
        {
            throw new ConflictException("SC-002 violation: insufficient available capacity.");
        }

        var code = codeGenerator.Generate();
        var exists = await db.Reservations.AnyAsync(r => r.ReservationCode == code, cancellationToken);
        if (exists)
        {
            code = codeGenerator.Generate();
        }

        var entity = new Reservation
        {
            EventId = request.EventId,
            BuyerName = request.BuyerName,
            BuyerEmail = request.BuyerEmail,
            Quantity = request.Quantity,
            ReservationCode = code,
            CreatedAt = clock.UtcNow,
        };

        db.Reservations.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return new ReservationDto(
            entity.Id,
            entity.EventId,
            entity.BuyerName,
            entity.BuyerEmail,
            entity.Quantity,
            entity.Status,
            entity.ReservationCode,
            entity.CreatedAt,
            entity.CancelledAt,
            entity.IsLost);
    }
}
