using EventosVivos.Application.Abstractions;
using EventosVivos.Application.Common.Exceptions;
using EventosVivos.Application.Contracts.Events;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Commands.Events;

public sealed class CreateEventCommandHandler(IAppDbContext db, IDateTimeProvider clock)
    : IRequestHandler<CreateEventCommand, EventDto>
{
    public async Task<EventDto> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        var venue = await db.Venues.FirstOrDefaultAsync(v => v.Id == request.VenueId, cancellationToken);
        if (venue is null)
        {
            throw new NotFoundException("Venue not found.");
        }

        if (request.Capacity > venue.Capacity)
        {
            throw new ConflictException("RN-01 violation: event capacity exceeds venue capacity.");
        }

        var overlaps = await db.Events
            .Where(e => e.VenueId == request.VenueId)
            .Where(e => e.Status == EventStatus.Active)
            .AnyAsync(e => request.StartAt < e.EndAt && request.EndAt > e.StartAt, cancellationToken);
        if (overlaps)
        {
            throw new ConflictException("RN-02 violation: overlapping event in same venue.");
        }

        var entity = new Event
        {
            Name = request.Name,
            Description = request.Description,
            VenueId = request.VenueId,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            Price = request.Price,
            Capacity = request.Capacity,
            EventType = request.EventType,
            CreatedAt = clock.UtcNow,
        };

        entity.RefreshStatus(clock.UtcNow);

        db.Events.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return new EventDto(entity.Id, entity.Name, entity.Description, entity.EventType, entity.VenueId, entity.StartAt, entity.EndAt, entity.Price, entity.Capacity, entity.Status);
    }
}
