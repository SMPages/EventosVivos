# API Contracts: Events

## POST /api/events

Request:
```json
{
  "name": "Evento Nocturno",
  "venueId": 1,
  "startAt": "2026-08-15T21:00:00-05:00",
  "endAt": "2026-08-15T23:30:00-05:00",
  "price": 120,
  "capacity": 180
}
```

Rules:
- RN-01: `capacity` <= capacidad del venue.
- RN-02: no solapar horario con otro evento activo del mismo venue.
- RN-03: si es sabado/domingo, `startAt` <= 22:00.

Responses:
- 201 Created
- 400 Bad Request (datos invalidos)
- 409 Conflict (RN-01, RN-02 o RN-03)

## GET /api/events

Query params:
- `venueId`
- `from`
- `to`
- `status`

Response 200:
```json
{
  "items": [
    {
      "id": 10,
      "name": "Evento Nocturno",
      "venueId": 1,
      "startAt": "2026-08-15T21:00:00-05:00",
      "endAt": "2026-08-15T23:30:00-05:00",
      "price": 120,
      "capacity": 180,
      "status": "Active"
    }
  ]
}
```

Rule:
- RN-06: estado `Completed` se calcula automaticamente cuando now > endAt.

## GET /api/events/{id}
- 200 OK
- 404 Not Found

## DELETE /api/events/{id}
- Fuera de alcance principal para esta prueba.
