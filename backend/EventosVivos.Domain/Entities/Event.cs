using EventosVivos.Domain.Enums;

namespace EventosVivos.Domain.Entities;

public sealed class Event
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int VenueId { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public EventType EventType { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public void RefreshStatus(DateTime nowUtc)
    {
        if (nowUtc > EndAt.ToUniversalTime())
        {
            Status = EventStatus.Completed;
        }
    }

    public bool StartsAfterWeekendLimit()
    {
        var day = StartAt.DayOfWeek;
        if (day is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
        {
            return false;
        }

        return StartAt.TimeOfDay > TimeSpan.FromHours(22);
    }

    public bool Overlaps(Event other)
    {
        return StartAt < other.EndAt && EndAt > other.StartAt;
    }
}
