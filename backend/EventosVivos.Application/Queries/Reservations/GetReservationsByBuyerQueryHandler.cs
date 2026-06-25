using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Contracts.Reservations;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Queries.Reservations;

public sealed class GetReservationsByBuyerQueryHandler(IAppDbContext db)
    : IRequestHandler<GetReservationsByBuyerQuery, IReadOnlyCollection<ReservationDto>>
{
    public async Task<IReadOnlyCollection<ReservationDto>> Handle(GetReservationsByBuyerQuery request, CancellationToken cancellationToken)
    {
        var query = db.Reservations.AsNoTracking().AsQueryable();

        if (request.ReservationId.HasValue)
        {
            query = query.Where(x => x.Id == request.ReservationId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.BuyerEmail))
        {
            query = query.Where(x => x.BuyerEmail == request.BuyerEmail);
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query = query.Where(x => x.Status.ToString().Equals(request.Status, StringComparison.OrdinalIgnoreCase));
        }

        var reservations = await query.OrderByDescending(r => r.CreatedAt).ToListAsync(cancellationToken);

        return reservations
            .Select(r => new ReservationDto(r.Id, r.EventId, r.BuyerName, r.BuyerEmail, r.Quantity, r.Status, r.ReservationCode, r.CreatedAt, r.CancelledAt, r.IsLost))
            .ToArray();
    }
}
