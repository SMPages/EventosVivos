using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.Contracts.Reservations;

public sealed record ReservationDto(
    int Id,
    int EventId,
    string BuyerName,
    string BuyerEmail,
    int Quantity,
    ReservationStatus Status,
    string ReservationCode,
    DateTime CreatedAt,
    DateTime? CancelledAt,
    bool IsLost
);
