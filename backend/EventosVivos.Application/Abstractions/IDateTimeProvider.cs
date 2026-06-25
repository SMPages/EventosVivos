namespace EventosVivos.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
