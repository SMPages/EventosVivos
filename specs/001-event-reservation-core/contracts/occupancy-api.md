# API Contracts: Occupancy Reports

## GET /api/occupancy

Query params:
- `venueId` (optional)
- `from` (optional)
- `to` (optional)

Response 200:
```json
{
  "items": [
    {
      "eventId": 10,
      "eventName": "Evento Nocturno",
      "venueId": 1,
      "venueName": "Auditorio Central",
      "capacityTotal": 180,
      "capacityConsumed": 140,
      "occupancyPercentage": 77.78,
      "includesLostReservations": true
    }
  ],
  "generatedAt": "2026-06-24T10:30:00-05:00"
}
```

Rules reflected:
- RN-07: reservas perdidas se incluyen en reportes.
- RF-05: capacidad consumida no disminuye para cancelaciones perdidas.

Errors:
- 400 Bad Request
- 404 Not Found

## GET /api/occupancy/summary

Response 200:
```json
{
  "totalEvents": 12,
  "totalCapacity": 2350,
  "totalConsumed": 1820,
  "averageOccupancyPercentage": 77.45
}
```

Performance note:
- SC-008: endpoints de consultas y reportes deben cumplir p95 < 500 ms.
