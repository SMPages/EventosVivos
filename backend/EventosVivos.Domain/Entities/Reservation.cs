using EventosVivos.Domain.Enums;

namespace EventosVivos.Domain.Entities;

public sealed class Reservation
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public string ReservationCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
    public bool IsLost { get; set; }

    public void MarkConfirmed()
    {
        Status = ReservationStatus.Confirmed;
    }

    public void Cancel(bool isLost, DateTime nowUtc)
    {
        Status = ReservationStatus.Cancelled;
        IsLost = isLost;
        CancelledAt = nowUtc;
    }
}
