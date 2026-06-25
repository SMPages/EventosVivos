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

        var eventItems = await events.ToListAsync(cancellationToken);
        var eventIds = eventItems.Select(e => e.Id).ToArray();

        var venueMap = await db.Venues
            .AsNoTracking()
            .ToDictionaryAsync(v => v.Id, v => v.Name, cancellationToken);

        var reservations = await db.Reservations
            .AsNoTracking()
            .Where(r => eventIds.Contains(r.EventId))
            .ToListAsync(cancellationToken);

        return eventItems.Select(ev =>
        {
            var items = reservations.Where(r => r.EventId == ev.Id);
            var confirmedTickets = items
                .Where(r => r.Status == ReservationStatus.Confirmed)
                .Sum(r => r.Quantity);

            var consumedForCapacity = items
                .Where(r => r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.Pending || r.IsLost)
                .Sum(r => r.Quantity);

            var available = Math.Max(ev.Capacity - consumedForCapacity, 0);
            var percent = ev.Capacity == 0 ? 0 : decimal.Round((decimal)consumedForCapacity * 100m / ev.Capacity, 2);
            var revenue = decimal.Round(confirmedTickets * ev.Price, 2);
            var effectiveStatus = ev.Status == EventStatus.Active && ev.EndAt < DateTime.UtcNow ? EventStatus.Completed : ev.Status;

            return new OccupancyItemDto(
                ev.Id,
                ev.Name,
                ev.VenueId,
                venueMap.GetValueOrDefault(ev.VenueId, $"Venue {ev.VenueId}"),
                effectiveStatus,
                ev.Capacity,
                consumedForCapacity,
                confirmedTickets,
                available,
                percent,
                revenue,
                items.Any(i => i.IsLost));
        }).ToArray();
    }
}
