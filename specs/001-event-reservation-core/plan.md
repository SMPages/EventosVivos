# Implementation Plan: EventosVivos Reservation System Core

**Branch**: `001-event-reservation-core` | **Date**: 2026-06-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-event-reservation-core/spec.md`

## Summary

Se implementara el nucleo de reservas de EventosVivos con .NET 8 Web API y Angular 20, cumpliendo estrictamente RF-01 a RF-06 y RN-01 a RN-07 del enunciado oficial.

Puntos clave de alcance:
- Sin sistema de autenticacion.
- Identificacion de comprador unicamente con BuyerName y BuyerEmail.
- Reserva con codigo unico `EV-XXXXXX`.
- Priorizacion explicita de RF-03 (maximo 5 entradas si faltan <24h) sobre RN-05.
- Cancelacion con tratamiento de perdida segun RN-07.

## Technical Context

**Language/Version**: .NET 8 (C# 12), Angular 20.

**Primary Dependencies**:
- Backend: ASP.NET Core, Entity Framework Core SQLite, MediatR, FluentValidation, Swagger/OpenAPI.
- Frontend: Angular standalone components, Reactive Forms, HttpClient.
- Testing: xUnit, Moq, FluentAssertions.

**Storage**: SQLite.

**Testing**:
- Unit tests para reglas de dominio y validadores.
- Integration tests para endpoints y concurrencia.
- Pruebas automatizadas para SC-003 y SC-008.

**Target Platform**: API REST + SPA web.

**Project Type**: Aplicacion web (backend + frontend).

**Performance Goals**:
- SC-003: Reserva -> Confirmacion de pago <= 30 segundos.
- SC-008: Consultas y reportes con p95 < 500 ms.

**Constraints**:
- Cumplimiento literal de RN-01..RN-07.
- Sin mecanismo de acceso con credenciales.
- Venues preexistentes fijos.

**Scale/Scope**:
- Venues iniciales: 3.
- Flujo principal: eventos, reservas, pagos, cancelaciones, reportes.

## Constitution Check

Resultado: PASS.

Alineacion confirmada:
- Clean Architecture: capas Domain/Application/Infrastructure/Presentation.
- CQRS: comandos y consultas separados.
- FluentValidation: validaciones de entrada y reglas.
- API REST: DTOs, status codes consistentes, contratos claros.
- Testing obligatorio: cobertura de reglas RN y criterios SC.

## Project Structure

### Documentation (feature)

```text
specs/001-event-reservation-core/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── events-api.md
│   ├── reservations-api.md
│   ├── payments-api.md
│   └── occupancy-api.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── EventosVivos.Api/
├── EventosVivos.Application/
├── EventosVivos.Domain/
├── EventosVivos.Infrastructure/
└── EventosVivos.Tests/

frontend/
└── src/app/
    ├── features/events/
    ├── features/reservations/
    └── features/occupancy/
```

## Design Decisions Aligned to Enunciado

1. Reservation model oficial:
   - Id, EventId, BuyerName, BuyerEmail, Quantity, Status, ReservationCode, CreatedAt, CancelledAt, IsLost.
2. RN-06 gobierna el estado completado de eventos por fecha actual > fecha fin.
3. RN-07 define cancelacion perdida (<48h): IsLost=true, sin liberar capacidad, incluida en reportes.
4. RF-03 define prioridad sobre RN-05 cuando faltan <24h.

## Implementation Strategy

1. Base comun:
   - Entidades y validadores de reglas RN-01..RN-07.
2. MVP:
   - Crear/listar eventos.
   - Reservar entradas.
   - Confirmar pago.
3. Expansion:
   - Cancelar reservas con logica RN-07.
   - Reportes de ocupacion incluyendo perdidas.
4. Calidad:
   - Pruebas automatizadas de SC-003 y SC-008.

## Risks and Mitigations

- Riesgo de sobreventa en concurrencia:
  - Mitigacion: chequeo transaccional de capacidad + control de concurrencia optimista.
- Riesgo de colision de ReservationCode:
  - Mitigacion: restriccion UNIQUE + reintentos.
- Riesgo de inconsistencias en cancelacion tardia:
  - Mitigacion: regla centralizada RN-07 y pruebas de borde (<48h).

## Final Status

Plan final limpio y sincronizado con el enunciado de EventosVivos.
