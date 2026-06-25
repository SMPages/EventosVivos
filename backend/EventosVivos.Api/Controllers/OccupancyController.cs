using EventosVivos.Application.Queries.Occupancy;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.Api.Controllers;

[ApiController]
[Route("api/occupancy")]
public sealed class OccupancyController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? venueId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetOccupancyQuery(venueId, from, to), cancellationToken);
        return Ok(new { items, generatedAt = DateTime.UtcNow });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] int? venueId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetOccupancyQuery(venueId, from, to), cancellationToken);
        var totalCapacity = items.Sum(i => i.CapacityTotal);
        var totalConsumed = items.Sum(i => i.CapacityConsumed);
        var soldTickets = items.Sum(i => i.ConfirmedTicketsSold);
        var availableSeats = items.Sum(i => i.AvailableSeats);
        var totalRevenue = items.Sum(i => i.TotalRevenue);
        var averageOccupancyPercentage = items.Count == 0 ? 0 : Math.Round(items.Average(i => i.OccupancyPercentage), 2);

        return Ok(new
        {
            totalEvents = items.Count,
            totalCapacity,
            totalConsumed,
            soldTickets,
            availableSeats,
            totalRevenue,
            averageOccupancyPercentage,
            generatedAt = DateTime.UtcNow,
        });
    }
}
