using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (!await db.Venues.AnyAsync(cancellationToken))
        {
            db.Venues.AddRange(
                new Venue { Id = 1, Name = "Auditorio Central", Capacity = 200, City = "Bogota" },
                new Venue { Id = 2, Name = "Sala Norte", Capacity = 50, City = "Bogota" },
                new Venue { Id = 3, Name = "Arena Sur", Capacity = 500, City = "Medellin" }
            );
        }

        if (!await db.Events.AnyAsync(cancellationToken))
        {
            var now = DateTime.UtcNow;

            db.Events.AddRange(
                new Event
                {
                    Name = "Conferencia .NET para Equipos",
                    Description = "Conferencia practica sobre arquitectura .NET para equipos de alto rendimiento.",
                    VenueId = 1,
                    StartAt = now.AddDays(10),
                    EndAt = now.AddDays(10).AddHours(6),
                    Price = 120m,
                    Capacity = 120,
                    EventType = EventType.Conference,
                    Status = EventStatus.Active,
                    CreatedAt = now,
                },
                new Event
                {
                    Name = "Taller Angular Avanzado",
                    Description = "Taller enfocado en patrones, performance y buenas practicas en Angular.",
                    VenueId = 2,
                    StartAt = now.AddDays(12),
                    EndAt = now.AddDays(12).AddHours(4),
                    Price = 80m,
                    Capacity = 40,
                    EventType = EventType.Workshop,
                    Status = EventStatus.Active,
                    CreatedAt = now,
                }
            );
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
