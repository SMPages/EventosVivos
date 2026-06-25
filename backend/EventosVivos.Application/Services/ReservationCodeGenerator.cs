using EventosVivos.Application.Abstractions;

namespace EventosVivos.Application.Services;

public sealed class ReservationCodeGenerator : IReservationCodeGenerator
{
    public string Generate()
    {
        var value = Random.Shared.Next(0, 1_000_000);
        return $"EV-{value:000000}";
    }
}
