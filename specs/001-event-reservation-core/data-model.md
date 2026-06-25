# Data Model: EventosVivos Reservation System

**Feature**: Event Reservation System Core
**Phase**: 1 (Design & Contracts)
**Date**: 2026-06-24

## Domain Entities

## Venue

Entidad preexistente.

- Id
- Name
- City
- Capacity

Initial data:
- Auditorio Central (200) - Bogota
- Sala Norte (50) - Bogota
- Arena Sur (500) - Medellin

## Event

- Id
- Name
- VenueId
- StartAt
- EndAt
- Price
- Capacity
- Status
- CreatedAt

Validation constraints:
- Capacity > 0.
- Capacity <= Venue.Capacity (RN-01).
- No superposicion con otro evento activo en mismo venue (RN-02).
- Si StartAt cae en sabado o domingo, StartAt.Time <= 22:00 (RN-03).

Status behavior:
- Se marca automaticamente como Completed cuando Now > EndAt (RN-06).

## Reservation

Entidad exacta segun enunciado:

- Id
- EventId
- BuyerName
- BuyerEmail
- Quantity
- Status
- ReservationCode
- CreatedAt
- CancelledAt
- IsLost

Validation constraints:
- BuyerName requerido.
- BuyerEmail requerido y valido.
- Quantity > 0.
- No usar identificadores de usuario heredados.
- ReservationCode formato `EV-XXXXXX` y unico.

Reservation constraints:
- No reservar si el evento inicia en menos de 1 hora (RN-04).
- Si Event.Price > 100, maximo 10 entradas por transaccion (RN-05).
- Si evento inicia en <24 horas, maximo 5 entradas por transaccion (RF-03 especial).
- Prioridad: RF-03 (<24h, max 5) prevalece sobre RN-05.

## Payment

- Id
- ReservationId
- ConfirmedAt
- Reference
- Status

Behavior:
- Confirmar pago cambia reserva a Confirmed.

## OccupancyReport (Read Model)

- EventId
- VenueId
- CapacityTotal
- CapacityConsumed
- OccupancyPercentage
- IncludesLostReservations
- GeneratedAt

Rule impact:
- Reservas perdidas (RN-07) se incluyen en reportes.

## Reservation Status Values

- Pending
- Confirmed
- Cancelled

Notes:
- `IsLost=true` solo aplica cuando se cumple RN-07.

## Cancellation Logic Mapping (RF-05 + RN-07)

Case A: NO aplica RN-07
- Set Status=Cancelled
- Set CancelledAt
- Set IsLost=false
- Liberar capacidad

Case B: SI aplica RN-07 (cancelacion de reserva confirmada con menos de 48h)
- Set Status=Cancelled
- Set CancelledAt
- Set IsLost=true
- NO liberar capacidad
- Incluir en reportes

## Business Rules Mapping

- RN-01: Event.Capacity <= Venue.Capacity.
- RN-02: No overlap de eventos activos en mismo venue.
- RN-03: Fines de semana no iniciar despues de 22:00.
- RN-04: Bloquear reservas cuando faltan <1h para inicio.
- RN-05: Price >100 => max 10 entradas por transaccion.
- RN-06: Auto-completado cuando Now > EndAt.
- RN-07: Cancelacion <48h de reserva confirmada => perdida, sin liberar capacidad, incluida en reportes.

## Persistence Notes (SQLite)

Suggested columns:
- Events: `Id, Name, VenueId, StartAt, EndAt, Price, Capacity, Status, CreatedAt`
- Reservations: `Id, EventId, BuyerName, BuyerEmail, Quantity, Status, ReservationCode, CreatedAt, CancelledAt, IsLost`
- Payments: `Id, ReservationId, ConfirmedAt, Reference, Status`

Key constraints:
- UNIQUE(ReservationCode)
- FK Reservations.EventId -> Events.Id
- FK Events.VenueId -> Venues.Id
- FK Payments.ReservationId -> Reservations.Id

## Validation Matrix

Event:
- Capacity >0 and <= Venue.Capacity (RN-01)
- No active overlap in venue (RN-02)
- Weekend start <= 22:00 (RN-03)

Reservation:
- BuyerName required
- BuyerEmail required
- Quantity >0
- Event starts in >=1h (RN-04)
- Price>100 => Quantity<=10 (RN-05)
- Start in <24h => Quantity<=5 (RF-03 priority)

Cancellation:
- If confirmed and <48h => IsLost=true, no capacity release (RN-07)
- Else normal cancellation with capacity release (RF-05)
