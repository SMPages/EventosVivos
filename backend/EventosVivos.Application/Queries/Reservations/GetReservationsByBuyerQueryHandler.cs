using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Contracts.Reservations;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Queries.Reservations;

public sealed class GetReservationsByBuyerQueryHandler(IAppDbContext db)
    : IRequestHandler<GetReservationsByBuyerQuery, IReadOnlyCollection<ReservationDto>>
{
    public async Task<IReadOnlyCollection<ReservationDto>> Handle(GetReservationsByBuyerQuery request, CancellationToken cancellationToken)
    {
        var query = db.Reservations.AsNoTracking().AsQueryable();
        ReservationStatus requestedStatus = default;
        var hasStatusFilter = !string.IsNullOrWhiteSpace(request.Status)
            && Enum.TryParse(request.Status, true, out requestedStatus);

        if (request.ReservationId.HasValue)
        {
            query = query.Where(x => x.Id == request.ReservationId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.ReservationCode))
        {
            query = query.Where(x => x.ReservationCode == request.ReservationCode);
        }

        if (!string.IsNullOrWhiteSpace(request.BuyerEmail))
        {
            query = query.Where(x => x.BuyerEmail == request.BuyerEmail);
        }

        if (hasStatusFilter)
        {
            query = query.Where(x => x.Status == requestedStatus);
        }

        var reservations = await query.OrderByDescending(r => r.CreatedAt).ToListAsync(cancellationToken);

        return reservations
            .Select(r => new ReservationDto(r.Id, r.EventId, r.BuyerName, r.BuyerEmail, r.Quantity, r.Status, r.ReservationCode, r.CreatedAt, r.CancelledAt, r.IsLost))
            .ToArray();
    }
}
