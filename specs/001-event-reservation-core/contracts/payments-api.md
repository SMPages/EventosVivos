# API Contracts: Payments

## POST /api/payments/confirm

Request:
```json
{
  "reservationId": 1,
  "reservationCode": "EV-123456",
  "reference": "PAY-7788"
}
```

Behavior:
- Confirma pago de reserva valida.
- Cambia `Reservation.status` a `Confirmed`.

Responses:
- 200 OK
- 404 Not Found (reserva)
- 409 Conflict (reserva ya confirmada o estado invalido)

Response 200:
```json
{
  "reservationId": 1,
  "reservationCode": "EV-123456",
  "status": "Confirmed",
  "confirmedAt": "2026-06-24T10:18:00-05:00"
}
```

## GET /api/payments/{reservationId}
- 200 OK
- 404 Not Found

Notes:
- No hay autenticacion en alcance de prueba.
- Confirmacion de pago es operacion administrativa del flujo.
