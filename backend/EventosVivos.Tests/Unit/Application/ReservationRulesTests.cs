using EventosVivos.Application.Commands.Reservations;
using EventosVivos.Application.Validators;
using EventosVivos.Domain.Entities;
using EventosVivos.Tests.TestSupport;

namespace EventosVivos.Tests.Unit.Application;

public sealed class ReservationRulesTests
{
    [Fact]
    public async Task RN04_ShouldFail_WhenEventStartsInLessThanOneHour()
    {
        using var db = TestDbContextFactory.Create();
        var clock = new TestClock(new DateTime(2026, 6, 24, 10, 0, 0, DateTimeKind.Utc));

        db.Events.Add(new Event
        {
            Id = 10,
            Name = "Soon event",
            StartAt = new DateTime(2026, 6, 24, 10, 30, 0, DateTimeKind.Utc),
            EndAt = new DateTime(2026, 6, 24, 12, 0, 0, DateTimeKind.Utc),
            Price = 90,
            Capacity = 20,
            VenueId = 1,
        });
        await db.SaveChangesAsync();

        var validator = new CreateReservationValidator(db, clock);
        var result = await validator.ValidateAsync(new CreateReservationCommand(10, "Ana", "ana@test.com", 2));

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task RN05_ShouldFail_WhenPriceAbove100AndQuantityAbove10()
    {
        using var db = TestDbContextFactory.Create();
        var clock = new TestClock(new DateTime(2026, 6, 24, 10, 0, 0, DateTimeKind.Utc));

        db.Events.Add(new Event
        {
            Id = 11,
            Name = "Premium",
            StartAt = new DateTime(2026, 6, 25, 10, 0, 0, DateTimeKind.Utc),
            EndAt = new DateTime(2026, 6, 25, 12, 0, 0, DateTimeKind.Utc),
            Price = 150,
            Capacity = 100,
            VenueId = 1,
        });
        await db.SaveChangesAsync();

        var validator = new CreateReservationValidator(db, clock);
        var result = await validator.ValidateAsync(new CreateReservationCommand(11, "Ana", "ana@test.com", 11));

        result.IsValid.Should().BeFalse();
    }
}
