using EventosVivos.Application.Queries.Occupancy;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Tests.TestSupport;

namespace EventosVivos.Tests.Unit.Application;

public sealed class OccupancyRulesTests
{
    [Fact]
    public async Task Occupancy_ShouldIncludeLostReservations()
    {
        using var db = TestDbContextFactory.Create();

        db.Events.Add(new Event { Id = 10, Name = "Event", VenueId = 1, Capacity = 100, Price = 50, StartAt = DateTime.UtcNow.AddDays(2), EndAt = DateTime.UtcNow.AddDays(2).AddHours(2) });
        db.Reservations.Add(new Reservation { Id = 9, EventId = 10, BuyerName = "A", BuyerEmail = "a@a.com", Quantity = 4, ReservationCode = "EV-222222", Status = ReservationStatus.Cancelled, IsLost = true });
        await db.SaveChangesAsync();

        var handler = new GetOccupancyQueryHandler(db);
        var result = await handler.Handle(new GetOccupancyQuery(null, null, null), CancellationToken.None);

        result.Single().IncludesLostReservations.Should().BeTrue();
    }
}
