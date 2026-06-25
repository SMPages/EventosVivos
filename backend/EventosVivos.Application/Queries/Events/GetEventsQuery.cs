using EventosVivos.Application.Contracts.Events;
using EventosVivos.Domain.Enums;
using MediatR;

namespace EventosVivos.Application.Queries.Events;

public sealed record GetEventsQuery(
	int? VenueId,
	DateTime? From,
	DateTime? To,
	string? Status,
	EventType? EventType,
	string? Search,
	int? EventId = null) : IRequest<IReadOnlyCollection<EventDto>>;
