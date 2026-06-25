using EventosVivos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Application.Abstractions;

public interface IAppDbContext
{
    DbSet<Event> Events { get; }
    DbSet<Venue> Venues { get; }
    DbSet<Reservation> Reservations { get; }
    DbSet<Payment> Payments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
