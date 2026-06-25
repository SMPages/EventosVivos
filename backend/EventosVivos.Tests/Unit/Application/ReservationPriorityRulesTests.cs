using EventosVivos.Application.Commands.Reservations;
using EventosVivos.Application.Validators;
using EventosVivos.Domain.Entities;
using EventosVivos.Tests.TestSupport;

namespace EventosVivos.Tests.Unit.Application;

public sealed class ReservationPriorityRulesTests
{
    [Fact]
    public async Task RF03_ShouldTakePriority_OverRN05_WhenLessThan24h()
    {
        using var db = TestDbContextFactory.Create();
        var clock = new TestClock(new DateTime(2026, 6, 24, 10, 0, 0, DateTimeKind.Utc));

        db.Events.Add(new Event
        {
            Id = 99,
            Name = "Priority Event",
            StartAt = new DateTime(2026, 6, 25, 5, 0, 0, DateTimeKind.Utc),
            EndAt = new DateTime(2026, 6, 25, 6, 0, 0, DateTimeKind.Utc),
            Price = 150,
            Capacity = 100,
            VenueId = 1,
        });
        await db.SaveChangesAsync();

        var validator = new CreateReservationValidator(db, clock);
        var result = await validator.ValidateAsync(new CreateReservationCommand(99, "Ana", "ana@test.com", 6));

        result.IsValid.Should().BeFalse();
    }
}
