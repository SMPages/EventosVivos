using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Contracts.Events;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Queries.Events;

public sealed class GetEventsQueryHandler(IAppDbContext db, IDateTimeProvider clock)
    : IRequestHandler<GetEventsQuery, IReadOnlyCollection<EventDto>>
{
    public async Task<IReadOnlyCollection<EventDto>> Handle(GetEventsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Events.AsNoTracking().AsQueryable();
        var now = clock.UtcNow;

        if (request.EventId.HasValue)
        {
            query = query.Where(e => e.Id == request.EventId.Value);
        }

        if (request.VenueId.HasValue)
        {
            query = query.Where(e => e.VenueId == request.VenueId.Value);
        }

        if (request.EventType.HasValue)
        {
            query = query.Where(e => e.EventType == request.EventType.Value);
        }

        if (request.From.HasValue)
        {
            query = query.Where(e => e.StartAt >= request.From.Value);
        }

        if (request.To.HasValue)
        {
            query = query.Where(e => e.StartAt <= request.To.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(e => e.Name.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<EventStatus>(request.Status, true, out var requestedStatus))
        {
            query = requestedStatus switch
            {
                EventStatus.Active => query.Where(e => e.Status == EventStatus.Active && e.EndAt >= now),
                EventStatus.Completed => query.Where(e => e.Status == EventStatus.Completed || (e.Status == EventStatus.Active && e.EndAt < now)),
                EventStatus.Cancelled => query.Where(e => e.Status == EventStatus.Cancelled),
                _ => query,
            };
        }

        var items = await query
            .OrderBy(e => e.StartAt)
            .Select(e => new EventDto(
                e.Id,
                e.Name,
                e.Description,
                e.EventType,
                e.VenueId,
                e.StartAt,
                e.EndAt,
                e.Price,
                e.Capacity,
                e.Status == EventStatus.Active && e.EndAt < now ? EventStatus.Completed : e.Status))
            .ToArrayAsync(cancellationToken);

        return items;
    }
}
