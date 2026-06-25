# Tasks: EventosVivos Reservation System Core

**Input**: Design documents from `/specs/001-event-reservation-core/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story and cross-cutting quality gates.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable task.
- **[Story]**: [US1]..[US5] for story tasks.

---

## Phase 1: Setup

- [X] T001 Create backend and frontend solution structure in backend/ and frontend/
- [X] T002 Add dependencies in backend/*.csproj (EF Core SQLite, MediatR, FluentValidation, Swagger, xUnit, Moq, FluentAssertions)
- [X] T003 [P] Configure Angular standalone app base in frontend/src/app/
- [X] T004 [P] Configure SQLite connection and migrations base in backend/EventosVivos.Infrastructure/

---

## Phase 2: Foundational Domain and Rules

- [X] T005 Define Event, Venue, Reservation, Payment entities in backend/EventosVivos.Domain/Entities/
- [X] T006 Implement Reservation fields exactly as especificado in backend/EventosVivos.Domain/Entities/Reservation.cs (Id, EventId, BuyerName, BuyerEmail, Quantity, Status, ReservationCode, CreatedAt, CancelledAt, IsLost)
- [X] T007 Remove obsolete buyer identifier fields from domain, DTOs, validators and queries in backend/ and frontend/
- [X] T008 Implement ReservationCode generator `EV-XXXXXX` with uniqueness in backend/EventosVivos.Application/Services/ReservationCodeGenerator.cs
- [X] T009 Implement event status auto-completion rule RN-06 in backend/EventosVivos.Domain/Entities/Event.cs
- [X] T010 [P] Add global error mapping for 400/404/409/422 in backend/EventosVivos.Api/Middleware/ErrorHandlingMiddleware.cs

---

## Phase 3: User Story 1 - Eventos (P1)

**Goal**: Crear y listar eventos respetando RN-01, RN-02 y RN-03.

- [X] T011 [P] [US1] Add unit tests RN-01, RN-02, RN-03 in backend/EventosVivos.Tests/Unit/Domain/EventRulesTests.cs
- [X] T012 [US1] Implement CreateEvent command/handler in backend/EventosVivos.Application/Commands/Events/
- [X] T013 [US1] Implement validations RN-01, RN-02, RN-03 in backend/EventosVivos.Application/Validators/CreateEventValidator.cs
- [X] T014 [US1] Implement events endpoints in backend/EventosVivos.Api/Controllers/EventsController.cs
- [X] T015 [P] [US1] Implement event list and filters UI in frontend/src/app/features/events/

---

## Phase 4: User Story 2 - Reservas (P1)

**Goal**: Reservar con BuyerName/BuyerEmail respetando RN-04, RN-05 y prioridad RF-03.

- [X] T016 [P] [US2] Add unit tests RN-04 and RN-05 in backend/EventosVivos.Tests/Unit/Application/ReservationRulesTests.cs
- [X] T017 [P] [US2] Add unit tests for RF-03 priority over RN-05 in backend/EventosVivos.Tests/Unit/Application/ReservationPriorityRulesTests.cs
- [X] T018 [US2] Implement CreateReservation command/handler with BuyerName, BuyerEmail, Quantity in backend/EventosVivos.Application/Commands/Reservations/
- [X] T019 [US2] Implement reservation validations with priority logic (<24h => max 5 first) in backend/EventosVivos.Application/Validators/CreateReservationValidator.cs
- [X] T020 [US2] Implement reservations endpoints create/get/list in backend/EventosVivos.Api/Controllers/ReservationsController.cs
- [X] T021 [P] [US2] Implement reservation UI form with BuyerName and BuyerEmail fields in frontend/src/app/features/reservations/reservation-form.component.ts

---

## Phase 5: User Story 3 - Confirmacion de Pago (P1)

**Goal**: Confirmar pagos y pasar reservas a confirmadas.

- [X] T022 [P] [US3] Add unit tests for payment confirmation transitions in backend/EventosVivos.Tests/Unit/Application/ConfirmPaymentCommandTests.cs
- [X] T023 [US3] Implement ConfirmPayment command/handler in backend/EventosVivos.Application/Commands/Payments/
- [X] T024 [US3] Implement payment confirmation endpoint in backend/EventosVivos.Api/Controllers/PaymentsController.cs
- [X] T025 [P] [US3] Implement payment confirmation UI action in frontend/src/app/features/reservations/

---

## Phase 6: User Story 4 - Cancelacion con Perdida (P2)

**Goal**: Aplicar RF-05 y RN-07 en cancelaciones.

- [X] T026 [P] [US4] Add unit tests for cancellation logic with and without RN-07 in backend/EventosVivos.Tests/Unit/Application/CancelReservationRulesTests.cs
- [X] T027 [US4] Implement CancelReservation command/handler with RN-07 in backend/EventosVivos.Application/Commands/Reservations/CancelReservationCommandHandler.cs
- [X] T028 [US4] Ensure cancellation updates IsLost and CancelledAt in backend/EventosVivos.Infrastructure/Persistence/
- [X] T029 [US4] Implement cancellation endpoint behavior for RF-05 in backend/EventosVivos.Api/Controllers/ReservationsController.cs
- [X] T030 [P] [US4] Implement cancellation flow UI with lost/not-lost result in frontend/src/app/features/reservations/reservation-history.component.ts

---

## Phase 7: User Story 5 - Reportes de Ocupacion (P2)

**Goal**: Reportar ocupacion incluyendo reservas perdidas segun RN-07.

- [X] T031 [P] [US5] Add unit tests ensuring lost reservations are included in occupancy reports in backend/EventosVivos.Tests/Unit/Application/OccupancyRulesTests.cs
- [X] T032 [P] [US5] Add integration tests for occupancy filters and lost reservation inclusion in backend/EventosVivos.Tests/Integration/OccupancyApiTests.cs
- [X] T033 [US5] Implement occupancy query/handler in backend/EventosVivos.Application/Queries/Occupancy/
- [X] T034 [US5] Implement occupancy endpoints in backend/EventosVivos.Api/Controllers/OccupancyController.cs
- [X] T035 [P] [US5] Implement occupancy dashboard UI in frontend/src/app/features/occupancy/

---

## Phase 8: Criterios de Exito y Performance

- [X] T036 Add automated E2E integration test for SC-003 (Reserva -> Confirmacion <= 30s) in backend/EventosVivos.Tests/Integration/Scenarios/ReservationToPaymentLatencyTests.cs
- [X] T037 Add automated performance test suite for SC-008 (queries/reports p95 < 500ms) in backend/EventosVivos.Tests/Performance/ReadEndpointsP95Tests.cs
- [X] T038 Add CI assertion and threshold gate for SC-008 p95 < 500ms in .github/workflows/ci.yml
- [X] T039 [P] Document SC-003 and SC-008 evidence in specs/001-event-reservation-core/quickstart.md

---

## Phase 9: Documentation Sync

- [X] T040 Remove obsolete identity wording across specs/001-event-reservation-core/ and keep only BuyerName/BuyerEmail identification model
- [X] T041 Ensure branch metadata uses `001-event-reservation-core` across plan/spec docs
- [X] T042 Final consistency pass across spec.md, plan.md, data-model.md, tasks.md, and contracts/

---

## Dependencies & Execution Order

1. Setup (T001-T004)
2. Foundational domain (T005-T010)
3. P1 stories: US1 -> US2 -> US3
4. P2 stories: US4 -> US5
5. Success/performance gates: T036-T038
6. Final sync and consistency: T040-T042

---

## Notes

- No implementar autenticacion.
- Buyer identification solo por BuyerName y BuyerEmail.
- RF-03 prioridad sobre RN-05 debe quedar probada automaticamente.
- RN-07 debe impactar capacidad y reportes de forma verificable.
