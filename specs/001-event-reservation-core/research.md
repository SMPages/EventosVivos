# Research & Decisions: EventosVivos Reservation Core

**Date**: 2026-06-24
**Status**: Updated to match official technical statement.

## Confirmed Scope

- Backend: .NET 8 Web API.
- Frontend: Angular 20 standalone components.
- Persistence: SQLite.
- No existe sistema de autenticacion en alcance.
- Buyer identification only with BuyerName and BuyerEmail.

## Reservation Model Decision (exact)

Reservation fields:
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

No se utiliza identificador de usuario heredado en ninguna capa.

## Business Rules (exact)

- RN-01: Un evento no puede exceder la capacidad del venue asignado.
- RN-02: Dos eventos activos no pueden compartir el mismo venue con horarios superpuestos.
- RN-03: Eventos en sabado o domingo no pueden iniciar despues de las 22:00.
- RN-04: No se permiten reservas para eventos que inicien en menos de 1 hora.
- RN-05: Eventos con precio mayor a 100 limitan a maximo 10 entradas por transaccion.
- RN-06: Un evento se marca automaticamente como completado cuando la fecha actual supera la fecha de finalizacion.
- RN-07: Si una reserva confirmada se cancela con menos de 48 horas para el evento:
  - se registra como perdida
  - no libera capacidad
  - debe incluirse en reportes

## Priority Rule Decision

RF-03 special constraint:
- If event starts in less than 24 hours, max 5 tickets per transaction.
- This rule has priority over RN-05.

## Cancellation Decision

RF-05 behavior:
- If RN-07 does not apply: release capacity.
- If RN-07 applies: mark IsLost=true and do not release capacity.

## Test Strategy Updates

- Automated test for SC-003: end-to-end reservation to payment confirmation <= 30 seconds.
- Automated performance tests for SC-008: query/report p95 < 500 ms.

## Data and Reporting Implication

- Lost reservations (IsLost=true) remain part of occupancy reporting.
- Capacity consumed is not reduced by lost cancellations.
