using EventosVivos.Application.Contracts.Events;
using EventosVivos.Domain.Enums;
using MediatR;

namespace EventosVivos.Application.Commands.Events;

public sealed record CreateEventCommand(
    string Name,
    string Description,
    int VenueId,
    DateTime StartAt,
    DateTime EndAt,
    decimal Price,
    int Capacity,
    EventType EventType
) : IRequest<EventDto>;
