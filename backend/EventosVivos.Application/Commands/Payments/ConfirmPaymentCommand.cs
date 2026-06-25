using MediatR;

namespace EventosVivos.Application.Commands.Payments;

public sealed record ConfirmPaymentCommand(
    string ReservationCode
) : IRequest<ConfirmPaymentResult>;

public sealed record ConfirmPaymentResult(int ReservationId, string ReservationCode, string PaymentReference, string Status, DateTime ConfirmedAt);
