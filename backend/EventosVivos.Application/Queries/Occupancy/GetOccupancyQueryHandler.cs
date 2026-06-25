using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Contracts.Occupancy;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Queries.Occupancy;

public sealed class GetOccupancyQueryHandler(IAppDbContext db)
    : IRequestHandler<GetOccupancyQuery, IReadOnlyCollection<OccupancyItemDto>>
{
    public async Task<IReadOnlyCollection<OccupancyItemDto>> Handle(GetOccupancyQuery request, CancellationToken cancellationToken)
    {
        var events = db.Events.AsNoTracking().AsQueryable();
        if (request.VenueId.HasValue)
        {
            events = events.Where(e => e.VenueId == request.VenueId.Value);
        }

        if (request.From.HasValue)
        {
            events = events.Where(e => e.StartAt >= request.From.Value);
        }

        if (request.To.HasValue)
        {
            events = events.Where(e => e.EndAt <= request.To.Value);
        }

        var nowUtc = DateTime.UtcNow;

        var items = await (
            from ev in events
            join venue in db.Venues.AsNoTracking() on ev.VenueId equals venue.Id
            join reservation in db.Reservations.AsNoTracking() on ev.Id equals reservation.EventId into reservationGroup
            orderby ev.StartAt
            select new
            {
                ev.Id,
                ev.Name,
                ev.VenueId,
                VenueName = venue.Name,
                ev.Status,
                ev.Capacity,
                ev.Price,
                ev.EndAt,
                ConfirmedTicketsSold = reservationGroup
                    .Where(r => r.Status == ReservationStatus.Confirmed)
                    .Sum(r => (int?)r.Quantity) ?? 0,
                CapacityConsumed = reservationGroup
                    .Where(r => r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.Pending || r.IsLost)
                    .Sum(r => (int?)r.Quantity) ?? 0,
                IncludesLostReservations = reservationGroup.Any(r => r.IsLost),
            })
            .ToListAsync(cancellationToken);

        return items.Select(item =>
        {
            var available = Math.Max(item.Capacity - item.CapacityConsumed, 0);
            var percent = item.Capacity == 0 ? 0 : decimal.Round((decimal)item.CapacityConsumed * 100m / item.Capacity, 2);
            var revenue = decimal.Round(item.ConfirmedTicketsSold * item.Price, 2);
            var effectiveStatus = item.Status == EventStatus.Active && item.EndAt < nowUtc ? EventStatus.Completed : item.Status;

            return new OccupancyItemDto(
                item.Id,
                item.Name,
                item.VenueId,
                item.VenueName,
                effectiveStatus,
                item.Capacity,
                item.CapacityConsumed,
                item.ConfirmedTicketsSold,
                available,
                percent,
                revenue,
                item.IncludesLostReservations);
        }).ToArray();
    }
}
