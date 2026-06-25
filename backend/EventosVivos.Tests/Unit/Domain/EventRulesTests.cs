using EventosVivos.Domain.Entities;

namespace EventosVivos.Tests.Unit.Domain;

public sealed class EventRulesTests
{
    [Fact]
    public void RN03_WeekendAfter22_ShouldBeRejectedByRule()
    {
        var ev = new Event
        {
            StartAt = new DateTime(2026, 6, 27, 22, 1, 0), // Saturday
            EndAt = new DateTime(2026, 6, 27, 23, 0, 0),
        };

        ev.StartsAfterWeekendLimit().Should().BeTrue();
    }

    [Fact]
    public void RN02_Overlap_ShouldReturnTrue()
    {
        var first = new Event { StartAt = new DateTime(2026, 7, 1, 10, 0, 0), EndAt = new DateTime(2026, 7, 1, 11, 0, 0) };
        var second = new Event { StartAt = new DateTime(2026, 7, 1, 10, 30, 0), EndAt = new DateTime(2026, 7, 1, 11, 30, 0) };

        first.Overlaps(second).Should().BeTrue();
    }

    [Fact]
    public void RN06_WhenNowAfterEnd_ShouldMarkCompleted()
    {
        var ev = new Event { EndAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc) };

        ev.RefreshStatus(new DateTime(2026, 6, 1, 11, 0, 0, DateTimeKind.Utc));

        ev.Status.Should().Be(EventosVivos.Domain.Enums.EventStatus.Completed);
    }
}
