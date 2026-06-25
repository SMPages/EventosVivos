using EventosVivos.Application.Abstractions;

namespace EventosVivos.Tests.TestSupport;

public sealed class TestClock(DateTime utcNow) : IDateTimeProvider
{
    public DateTime UtcNow { get; private set; } = utcNow;

    public void Set(DateTime value) => UtcNow = value;
}
