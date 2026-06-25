using EventosVivos.Application.Commands.Reservations;
using EventosVivos.Application.Queries.Reservations;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.Api.Controllers;

[ApiController]
[Route("api/reservations")]
public sealed class ReservationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? buyerEmail, [FromQuery] string? status, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetReservationsByBuyerQuery(buyerEmail ?? string.Empty, status), cancellationToken);
        return Ok(new { items });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateReservationCommand command, CancellationToken cancellationToken)
    {
        var created = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetReservationsByBuyerQuery(string.Empty, null, id), cancellationToken);
        var item = items.FirstOrDefault();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("by-buyer")]
    public async Task<IActionResult> GetByBuyer([FromQuery] string buyerEmail, [FromQuery] string? status, CancellationToken cancellationToken)
    {
        var items = await mediator.Send(new GetReservationsByBuyerQuery(buyerEmail, status), cancellationToken);
        return Ok(new { items });
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelReservationRequest request, CancellationToken cancellationToken)
    {
        var updated = await mediator.Send(new CancelReservationCommand(id, request.ReservationCode), cancellationToken);
        return Ok(updated);
    }

    public sealed record CancelReservationRequest(string ReservationCode);
}
