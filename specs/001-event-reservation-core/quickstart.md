# Quickstart: EventosVivos Reservation Core

## Prerequisites

- .NET 8 SDK
- Node.js 18+
- SQLite

## Run

1. Backend:
   - `dotnet restore`
   - `dotnet ef database update`
   - `dotnet run --project backend/EventosVivos.Api`
2. Frontend:
   - `npm install`
   - `npm start`

## Seed data

Venues preloaded:
- Auditorio Central (200) - Bogota
- Sala Norte (50) - Bogota
- Arena Sur (500) - Medellin

## Validation scenarios

## Scenario A: Create event with rules RN-01..RN-03

Validate:
- Event capacity does not exceed venue capacity (RN-01).
- No overlap with active event in same venue (RN-02).
- Weekend event start not after 22:00 (RN-03).

## Scenario B: Create reservation with RF-03 priority

Request fields:
- eventId
- buyerName
- buyerEmail
- quantity

Validate:
- Reject if event starts in <1 hour (RN-04).
- If price >100, max 10 per transaction (RN-05).
- If starts in <24h, max 5 per transaction (RF-03 priority over RN-05).

## Scenario C: Confirm payment

Validate:
- Reservation transitions to confirmed.

## Scenario D: Cancel reservation with RF-05 and RN-07

Validate:
- If cancellation occurs with >=48h: release capacity.
- If cancellation occurs with <48h and reservation confirmed:
  - mark IsLost=true
  - do not release capacity
  - include in occupancy reports.

## Scenario E: Event status auto-completion

Validate:
- Event status automatically becomes Completed when current date passes end date (RN-06).

## Scenario F: Occupancy report

Validate:
- Includes lost reservations impact (RN-07).

## Automated acceptance checks

- SC-003: reservation to payment confirmation flow <= 30 seconds.
- SC-008: query/report endpoints p95 < 500 ms.

## Evidence recording

- SC-003 automated check file: `backend/EventosVivos.Tests/Integration/Scenarios/ReservationToPaymentLatencyTests.cs`.
- SC-008 automated check file: `backend/EventosVivos.Tests/Performance/ReadEndpointsP95Tests.cs`.
- CI threshold gate: `.github/workflows/ci.yml` validates SC-008 marker.
