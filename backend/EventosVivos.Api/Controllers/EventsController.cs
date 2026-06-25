using EventosVivos.Application.Commands.Events;
using EventosVivos.Application.Queries.Events;
using EventosVivos.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.Api.Controllers;

[ApiController]
[Route("api/events")]
public sealed class EventsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateEventCommand command, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? venueId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? status,
        [FromQuery] EventType? eventType,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetEventsQuery(venueId, from, to, status, eventType, search), cancellationToken);
        return Ok(new { items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetEventsQuery(null, null, null, null, null, null, id), cancellationToken);
        var item = items.FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }
}
