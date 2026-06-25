using EventosVivos.Application.Contracts.Reservations;
using MediatR;

namespace EventosVivos.Application.Commands.Reservations;

public sealed record CreateReservationCommand(
    int EventId,
    string BuyerName,
    string BuyerEmail,
    int Quantity
) : IRequest<ReservationDto>;
