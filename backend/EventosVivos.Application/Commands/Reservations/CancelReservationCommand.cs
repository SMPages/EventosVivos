using EventosVivos.Application.Contracts.Reservations;
using MediatR;

namespace EventosVivos.Application.Commands.Reservations;

public sealed record CancelReservationCommand(int ReservationId, string ReservationCode) : IRequest<ReservationDto>;
