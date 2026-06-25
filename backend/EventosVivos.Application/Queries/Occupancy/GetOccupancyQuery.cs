using EventosVivos.Application.Contracts.Occupancy;
using MediatR;

namespace EventosVivos.Application.Queries.Occupancy;

public sealed record GetOccupancyQuery(int? VenueId, DateTime? From, DateTime? To) : IRequest<IReadOnlyCollection<OccupancyItemDto>>;
