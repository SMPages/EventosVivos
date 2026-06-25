using EventosVivos.Domain.Enums;

namespace EventosVivos.Domain.Entities;

public sealed class Payment
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public DateTime ConfirmedAt { get; set; }
    public string Reference { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; } = PaymentStatus.Confirmed;
}
