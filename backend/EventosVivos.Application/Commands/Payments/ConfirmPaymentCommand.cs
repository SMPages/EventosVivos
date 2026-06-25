using MediatR;

namespace EventosVivos.Application.Commands.Payments;

public sealed record ConfirmPaymentCommand(
    int ReservationId,
    string ReservationCode,
    string Reference
) : IRequest<ConfirmPaymentResult>;

public sealed record ConfirmPaymentResult(int ReservationId, string ReservationCode, string Status, DateTime ConfirmedAt);
