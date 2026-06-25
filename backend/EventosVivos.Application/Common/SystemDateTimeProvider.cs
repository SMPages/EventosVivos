using EventosVivos.Application.Abstractions;

namespace EventosVivos.Application.Common;

public sealed class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
