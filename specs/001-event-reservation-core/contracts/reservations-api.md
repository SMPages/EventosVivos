# API Contracts: Reservations

## Reservation model (exacto)

```json
{
  "id": 1,
  "eventId": 10,
  "buyerName": "Ana Perez",
  "buyerEmail": "ana@example.com",
  "quantity": 3,
  "status": "Pending",
  "reservationCode": "EV-123456",
  "createdAt": "2026-06-24T10:15:00-05:00",
  "cancelledAt": null,
  "isLost": false
}
```

## POST /api/reservations

Request:
```json
{
  "eventId": 10,
  "buyerName": "Ana Perez",
  "buyerEmail": "ana@example.com",
  "quantity": 3
}
```

Validations:
- buyerName requerido.
- buyerEmail requerido y valido.
- quantity > 0.

Rules:
- RN-04: no permitir si el evento inicia en menos de 1 hora.
- RN-05: si `event.price > 100`, maximo 10 entradas por transaccion.
- RF-03 especial: si faltan <24 horas, maximo 5 entradas por transaccion.
- Prioridad explicita: RF-03 prevalece sobre RN-05.

Responses:
- 201 Created
- 400 Bad Request
- 404 Not Found (evento)
- 409 Conflict (RN-04, RN-05 o RF-03)

## GET /api/reservations/{id}
- 200 OK
- 404 Not Found

## GET /api/reservations/by-buyer

Query params:
- `buyerEmail`
- `status` (optional)

Response 200:
```json
{
  "items": [
    {
      "id": 1,
      "eventId": 10,
      "buyerName": "Ana Perez",
      "buyerEmail": "ana@example.com",
      "quantity": 3,
      "status": "Confirmed",
      "reservationCode": "EV-123456",
      "createdAt": "2026-06-24T10:15:00-05:00",
      "cancelledAt": null,
      "isLost": false
    }
  ]
}
```

## POST /api/reservations/{id}/cancel

Request:
```json
{
  "reservationCode": "EV-123456"
}
```

Rules:
- RF-05 + RN-07:
  - Si NO aplica RN-07: liberar capacidad.
  - Si aplica RN-07 (confirmada y <48h): `isLost=true`, no liberar capacidad, incluir en reportes.

Responses:
- 200 OK
- 404 Not Found
- 409 Conflict (estado invalido)
