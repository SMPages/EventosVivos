using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Infrastructure.Persistence;

public static class DemoDataSeeder
{
    public sealed record SeedSummary(
        int VenueCount,
        int EventCount,
        int ActiveEventCount,
        int CompletedEventCount,
        int ReservationCount,
        int PendingReservations,
        int ConfirmedReservations,
        int CancelledReservations,
        int LostReservations,
        int PaymentCount,
        decimal EstimatedRevenue);

    public static async Task<SeedSummary> SeedDevelopmentDataAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        await db.Database.EnsureDeletedAsync(cancellationToken);
        await db.Database.EnsureCreatedAsync(cancellationToken);

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        await UpsertVenuesAsync(db, cancellationToken);
        await db.Payments.ExecuteDeleteAsync(cancellationToken);
        await db.Reservations.ExecuteDeleteAsync(cancellationToken);
        await db.Events.ExecuteDeleteAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var events = BuildEvents(now);
        db.Events.AddRange(events);
        await db.SaveChangesAsync(cancellationToken);

        var eventByName = await db.Events.ToDictionaryAsync(e => e.Name, cancellationToken);

        var reservations = BuildReservations(eventByName, now);
        db.Reservations.AddRange(reservations);
        await db.SaveChangesAsync(cancellationToken);

        var payments = reservations
            .Where(r => r.Status == ReservationStatus.Confirmed)
            .Select((reservation, idx) => new Payment
            {
                ReservationId = reservation.Id,
                ConfirmedAt = reservation.CreatedAt.AddMinutes(20 + idx),
                Reference = $"PSE-CO-{980001 + idx}",
                Status = PaymentStatus.Confirmed,
            })
            .ToArray();

        db.Payments.AddRange(payments);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var activeEvents = events.Count(e => e.EndAt > now);
        var completedEvents = events.Count - activeEvents;
        var pending = reservations.Count(r => r.Status == ReservationStatus.Pending);
        var confirmed = reservations.Count(r => r.Status == ReservationStatus.Confirmed);
        var cancelled = reservations.Count(r => r.Status == ReservationStatus.Cancelled);
        var lost = reservations.Count(r => r.IsLost);

        var revenueByEventId = eventByName.Values.ToDictionary(e => e.Id, e => e.Price);
        var estimatedRevenue = reservations
            .Where(r => r.Status == ReservationStatus.Confirmed)
            .Sum(r => revenueByEventId[r.EventId] * r.Quantity);

        return new SeedSummary(
            VenueCount: 3,
            EventCount: events.Count,
            ActiveEventCount: activeEvents,
            CompletedEventCount: completedEvents,
            ReservationCount: reservations.Count,
            PendingReservations: pending,
            ConfirmedReservations: confirmed,
            CancelledReservations: cancelled,
            LostReservations: lost,
            PaymentCount: payments.Length,
            EstimatedRevenue: estimatedRevenue);
    }

    private static async Task UpsertVenuesAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var expected = new[]
        {
            new Venue { Id = 1, Name = "Auditorio Central", Capacity = 200, City = "Bogota" },
            new Venue { Id = 2, Name = "Sala Norte", Capacity = 50, City = "Bogota" },
            new Venue { Id = 3, Name = "Arena Sur", Capacity = 500, City = "Medellin" },
        };

        foreach (var venue in expected)
        {
            var current = await db.Venues.FirstOrDefaultAsync(v => v.Id == venue.Id, cancellationToken);
            if (current is null)
            {
                db.Venues.Add(venue);
                continue;
            }

            current.Name = venue.Name;
            current.Capacity = venue.Capacity;
            current.City = venue.City;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static List<Event> BuildEvents(DateTime now)
    {
        DateTime At(int daysOffset, int hour, int minute = 0)
        {
            var date = now.Date.AddDays(daysOffset);
            return new DateTime(date.Year, date.Month, date.Day, hour, minute, 0, DateTimeKind.Utc);
        }

        var startsInLessThan24h = SafeWeekendStart(now.AddHours(20));
        var penaltyEventStart = SafeWeekendStart(now.AddHours(36));

        return
        [
            // Eventos activos
            new Event { Name = "Conferencia .NET 2026", Description = "Conferencia tecnica sobre arquitectura .NET y escalabilidad empresarial.", EventType = EventType.Conference, VenueId = 1, Capacity = 180, Price = 135m, StartAt = At(30, 9), EndAt = At(30, 17) },
            new Event { Name = "Angular Connect Colombia", Description = "Encuentro de comunidad Angular con charlas y casos de uso en produccion.", EventType = EventType.Conference, VenueId = 1, Capacity = 90, Price = 95m, StartAt = At(31, 9), EndAt = At(31, 18) },
            new Event { Name = "Taller Clean Architecture", Description = "Taller practico para implementar arquitectura limpia en aplicaciones reales.", EventType = EventType.Workshop, VenueId = 2, Capacity = 45, Price = 80m, StartAt = At(8, 9), EndAt = At(8, 14) },
            new Event { Name = "Taller Azure para Desarrolladores", Description = "Laboratorio guiado sobre despliegue y observabilidad en Azure.", EventType = EventType.Workshop, VenueId = 3, Capacity = 100, Price = 115m, StartAt = At(9, 9), EndAt = At(9, 13) },
            new Event { Name = "Concierto Indie Bogota", Description = "Show en vivo con artistas emergentes de la escena indie nacional.", EventType = EventType.Concert, VenueId = 1, Capacity = 120, Price = 70m, StartAt = At(40, 19), EndAt = At(40, 22) },
            new Event { Name = "Concierto Rock Medellin", Description = "Noche de rock con bandas locales y repertorio de clasicos.", EventType = EventType.Concert, VenueId = 3, Capacity = 300, Price = 150m, StartAt = At(45, 20), EndAt = At(45, 23) },

            // Eventos completados
            new Event { Name = "DevFest Colombia 2025", Description = "Jornada de comunidad con tracks de backend, frontend y cloud.", EventType = EventType.Conference, VenueId = 3, Capacity = 250, Price = 130m, StartAt = At(-160, 9), EndAt = At(-160, 19) },
            new Event { Name = "Taller Docker Basico", Description = "Introduccion practica a contenedores y orquestacion para equipos de desarrollo.", EventType = EventType.Workshop, VenueId = 2, Capacity = 50, Price = 60m, StartAt = At(-120, 10), EndAt = At(-120, 14) },
            new Event { Name = "Conferencia Microservicios 2025", Description = "Conferencia sobre patrones de integracion y resiliencia en microservicios.", EventType = EventType.Conference, VenueId = 1, Capacity = 160, Price = 140m, StartAt = At(-90, 9), EndAt = At(-90, 17) },

            // Escenarios especiales de reglas
            new Event { Name = "Bootcamp IA Express Bogota", Description = "Sesion intensiva de herramientas de IA aplicada para equipos de producto.", EventType = EventType.Workshop, VenueId = 1, Capacity = 80, Price = 90m, StartAt = startsInLessThan24h, EndAt = startsInLessThan24h.AddHours(3) },
            new Event { Name = "Foro Fintech Andino", Description = "Foro regional para discutir regulacion, open finance y pagos digitales.", EventType = EventType.Conference, VenueId = 3, Capacity = 220, Price = 115m, StartAt = penaltyEventStart, EndAt = penaltyEventStart.AddHours(6) },
        ];
    }

    private static List<Reservation> BuildReservations(IReadOnlyDictionary<string, Event> eventByName, DateTime now)
    {
        var buyers = new[]
        {
            ("Sebastian Marciales", "sebastian.marciales@eventosvivos.co"),
            ("Laura Rodriguez", "laura.rodriguez@eventosvivos.co"),
            ("Andres Gonzalez", "andres.gonzalez@eventosvivos.co"),
            ("Camila Perez", "camila.perez@eventosvivos.co"),
            ("Juan David Rojas", "juan.rojas@eventosvivos.co"),
            ("Natalia Gomez", "natalia.gomez@eventosvivos.co"),
            ("Felipe Martinez", "felipe.martinez@eventosvivos.co"),
            ("Valentina Torres", "valentina.torres@eventosvivos.co"),
            ("Santiago Herrera", "santiago.herrera@eventosvivos.co"),
            ("Paula Cardona", "paula.cardona@eventosvivos.co"),
            ("Daniela Restrepo", "daniela.restrepo@eventosvivos.co"),
            ("Mateo Cardenas", "mateo.cardenas@eventosvivos.co"),
            ("Jorge Villamizar", "jorge.villamizar@eventosvivos.co"),
            ("Catalina Mejia", "catalina.mejia@eventosvivos.co"),
            ("Nicolas Bernal", "nicolas.bernal@eventosvivos.co"),
            ("Maria Camila Ospina", "maria.ospina@eventosvivos.co"),
            ("Alejandro Quintero", "alejandro.quintero@eventosvivos.co"),
            ("Sara Lucero", "sara.lucero@eventosvivos.co"),
            ("Diego Pardo", "diego.pardo@eventosvivos.co"),
            ("Luisa Fernanda Ruiz", "luisa.ruiz@eventosvivos.co"),
        };

        var reservations = new List<Reservation>();
        var buyerIdx = 0;

        void Add(
            string eventName,
            int quantity,
            ReservationStatus status,
            string code,
            int createdHoursAgo,
            bool isLost = false,
            int? cancelledHoursAgo = null)
        {
            var (name, email) = buyers[buyerIdx % buyers.Length];
            buyerIdx++;

            reservations.Add(new Reservation
            {
                EventId = eventByName[eventName].Id,
                Quantity = quantity,
                BuyerName = name,
                BuyerEmail = email,
                Status = status,
                ReservationCode = code,
                CreatedAt = now.AddHours(-createdHoursAgo),
                IsLost = isLost,
                CancelledAt = cancelledHoursAgo.HasValue ? now.AddHours(-cancelledHoursAgo.Value) : null,
            });
        }

        // Confirmadas (20)
        Add("Taller Clean Architecture", 12, ReservationStatus.Confirmed, "EV-123456", 300);
        Add("Taller Clean Architecture", 10, ReservationStatus.Confirmed, "EV-654321", 290);
        Add("Taller Clean Architecture", 8, ReservationStatus.Confirmed, "EV-210001", 280);

        Add("Angular Connect Colombia", 10, ReservationStatus.Confirmed, "EV-210002", 270);
        Add("Angular Connect Colombia", 10, ReservationStatus.Confirmed, "EV-210003", 260);
        Add("Angular Connect Colombia", 9, ReservationStatus.Confirmed, "EV-210004", 250);
        Add("Angular Connect Colombia", 9, ReservationStatus.Confirmed, "EV-210005", 240);
        Add("Angular Connect Colombia", 9, ReservationStatus.Confirmed, "EV-210006", 230);
        Add("Angular Connect Colombia", 9, ReservationStatus.Confirmed, "EV-210007", 220);
        Add("Angular Connect Colombia", 8, ReservationStatus.Confirmed, "EV-210008", 210);

        Add("Concierto Indie Bogota", 10, ReservationStatus.Confirmed, "EV-210009", 200);
        Add("Concierto Indie Bogota", 10, ReservationStatus.Confirmed, "EV-210010", 198);
        Add("Concierto Indie Bogota", 10, ReservationStatus.Confirmed, "EV-210011", 196);
        Add("Concierto Indie Bogota", 9, ReservationStatus.Confirmed, "EV-210012", 194);
        Add("Concierto Indie Bogota", 9, ReservationStatus.Confirmed, "EV-210013", 192);
        Add("Concierto Indie Bogota", 9, ReservationStatus.Confirmed, "EV-210014", 190);

        Add("Taller Azure para Desarrolladores", 9, ReservationStatus.Confirmed, "EV-210015", 188);
        Add("Taller Azure para Desarrolladores", 8, ReservationStatus.Confirmed, "EV-210016", 186);

        Add("Bootcamp IA Express Bogota", 4, ReservationStatus.Confirmed, "EV-210017", 20);
        Add("Foro Fintech Andino", 6, ReservationStatus.Confirmed, "EV-210018", 26);

        // Pendientes (10)
        Add("Taller Clean Architecture", 8, ReservationStatus.Pending, "EV-310001", 24);
        Add("Taller Clean Architecture", 7, ReservationStatus.Pending, "EV-310002", 22);

        Add("Angular Connect Colombia", 10, ReservationStatus.Pending, "EV-310003", 20);
        Add("Angular Connect Colombia", 10, ReservationStatus.Pending, "EV-310004", 18);

        Add("Concierto Indie Bogota", 8, ReservationStatus.Pending, "EV-310005", 16);
        Add("Concierto Indie Bogota", 7, ReservationStatus.Pending, "EV-310006", 14);

        Add("Taller Azure para Desarrolladores", 5, ReservationStatus.Pending, "EV-310007", 12);
        Add("Bootcamp IA Express Bogota", 5, ReservationStatus.Pending, "EV-310008", 10);
        Add("Foro Fintech Andino", 4, ReservationStatus.Pending, "EV-310009", 8);
        Add("Foro Fintech Andino", 3, ReservationStatus.Pending, "EV-310010", 7);

        // Canceladas no perdidas (5)
        Add("Conferencia .NET 2026", 2, ReservationStatus.Cancelled, "EV-410001", 160, isLost: false, cancelledHoursAgo: 120);
        Add("Concierto Rock Medellin", 3, ReservationStatus.Cancelled, "EV-410002", 150, isLost: false, cancelledHoursAgo: 110);
        Add("Angular Connect Colombia", 1, ReservationStatus.Cancelled, "EV-410003", 140, isLost: false, cancelledHoursAgo: 100);
        Add("Concierto Indie Bogota", 2, ReservationStatus.Cancelled, "EV-410004", 130, isLost: false, cancelledHoursAgo: 90);
        Add("Taller Azure para Desarrolladores", 2, ReservationStatus.Cancelled, "EV-410005", 120, isLost: false, cancelledHoursAgo: 80);

        // Perdidas RN-07 (5): canceladas a <48h del evento y no liberan capacidad
        Add("Bootcamp IA Express Bogota", 3, ReservationStatus.Cancelled, "EV-510001", 12, isLost: true, cancelledHoursAgo: 3);
        Add("Bootcamp IA Express Bogota", 2, ReservationStatus.Cancelled, "EV-510002", 11, isLost: true, cancelledHoursAgo: 2);
        Add("Foro Fintech Andino", 5, ReservationStatus.Cancelled, "EV-510003", 10, isLost: true, cancelledHoursAgo: 4);
        Add("Foro Fintech Andino", 4, ReservationStatus.Cancelled, "EV-510004", 9, isLost: true, cancelledHoursAgo: 3);
        Add("Foro Fintech Andino", 3, ReservationStatus.Cancelled, "EV-510005", 8, isLost: true, cancelledHoursAgo: 2);

        return reservations;
    }

    private static DateTime SafeWeekendStart(DateTime candidateUtc)
    {
        if (candidateUtc.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday && candidateUtc.Hour > 22)
        {
            return new DateTime(candidateUtc.Year, candidateUtc.Month, candidateUtc.Day, 21, 0, 0, DateTimeKind.Utc);
        }

        return candidateUtc;
    }
}
