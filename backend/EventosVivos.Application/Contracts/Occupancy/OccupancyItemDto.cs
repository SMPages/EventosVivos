using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.Contracts.Occupancy;

public sealed record OccupancyItemDto(
    int EventId,
    string EventName,
    int VenueId,
    string VenueName,
    EventStatus EventStatus,
    int CapacityTotal,
    int CapacityConsumed,
    int ConfirmedTicketsSold,
    int AvailableSeats,
    decimal OccupancyPercentage,
    decimal TotalRevenue,
    bool IncludesLostReservations
);
