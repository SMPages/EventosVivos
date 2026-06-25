using EventosVivos.Application.Commands.Reservations;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Tests.TestSupport;

namespace EventosVivos.Tests.Unit.Application;

public sealed class CancelReservationRulesTests
{
    [Fact]
    public async Task RN07_WhenConfirmedAndLessThan48h_ShouldMarkLost()
    {
        using var db = TestDbContextFactory.Create();
        var clock = new TestClock(new DateTime(2026, 6, 24, 10, 0, 0, DateTimeKind.Utc));

        db.Events.Add(new Event { Id = 5, Name = "Event", VenueId = 1, Capacity = 50, Price = 20, StartAt = new DateTime(2026, 6, 25, 9, 0, 0, DateTimeKind.Utc), EndAt = new DateTime(2026, 6, 25, 11, 0, 0, DateTimeKind.Utc) });
        db.Reservations.Add(new Reservation { Id = 3, EventId = 5, BuyerName = "A", BuyerEmail = "a@a.com", Quantity = 2, ReservationCode = "EV-111111", Status = ReservationStatus.Confirmed });
        await db.SaveChangesAsync();

        var handler = new CancelReservationCommandHandler(db, clock);
        var result = await handler.Handle(new CancelReservationCommand(3, "EV-111111"), CancellationToken.None);

        result.IsLost.Should().BeTrue();
        result.Status.Should().Be(ReservationStatus.Cancelled);
    }
}
