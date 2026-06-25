using EventosVivos.Application.Abstractions;
using EventosVivos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Reservation>()
            .HasIndex(x => x.ReservationCode)
            .IsUnique();

        modelBuilder.Entity<Event>()
            .Property(x => x.Price)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Event>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Event>()
            .Property(x => x.Description)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<Venue>().HasData(
            new Venue { Id = 1, Name = "Auditorio Central", City = "Bogota", Capacity = 200 },
            new Venue { Id = 2, Name = "Sala Norte", City = "Bogota", Capacity = 50 },
            new Venue { Id = 3, Name = "Arena Sur", City = "Medellin", Capacity = 500 }
        );
    }
}
