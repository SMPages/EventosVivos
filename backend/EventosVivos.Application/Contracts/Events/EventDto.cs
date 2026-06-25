using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.Contracts.Events;

public sealed record EventDto(
    int Id,
    string Name,
    string Description,
    EventType EventType,
    int VenueId,
    DateTime StartAt,
    DateTime EndAt,
    decimal Price,
    int Capacity,
    EventStatus Status
);
