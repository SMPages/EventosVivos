using EventosVivos.Application.Contracts.Reservations;
using MediatR;

namespace EventosVivos.Application.Queries.Reservations;

public sealed record GetReservationsByBuyerQuery(string BuyerEmail, string? Status, int? ReservationId = null, string? ReservationCode = null) : IRequest<IReadOnlyCollection<ReservationDto>>;
