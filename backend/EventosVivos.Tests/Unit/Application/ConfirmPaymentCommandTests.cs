using EventosVivos.Application.Commands.Payments;
using EventosVivos.Domain.Entities;
using EventosVivos.Tests.TestSupport;

namespace EventosVivos.Tests.Unit.Application;

public sealed class ConfirmPaymentCommandTests
{
    [Fact]
    public async Task ConfirmPayment_ShouldSetReservationConfirmed()
    {
        using var db = TestDbContextFactory.Create();
        var clock = new TestClock(new DateTime(2026, 6, 24, 10, 0, 0, DateTimeKind.Utc));
        db.Reservations.Add(new Reservation { Id = 1, EventId = 1, BuyerName = "A", BuyerEmail = "a@a.com", Quantity = 2, ReservationCode = "EV-123456" });
        await db.SaveChangesAsync();

        var handler = new ConfirmPaymentCommandHandler(db, clock);
        var result = await handler.Handle(new ConfirmPaymentCommand("EV-123456"), CancellationToken.None);

        result.Status.Should().Be("Confirmed");
        result.PaymentReference.Should().StartWith("PAY-EV-123456-");
    }
}
