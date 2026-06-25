# Feature Specification: EventosVivos Reservation System Core

**Feature Branch**: `001-event-reservation-core`
**Created**: 2026-06-24
**Status**: Draft
**Input**: Enunciado oficial de la prueba tecnica EventosVivos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear y listar eventos (Priority: P1)

Como administrador operativo, necesito crear eventos y listarlos con filtros para gestionar la oferta disponible por venue y horario.

**Why this priority**: Sin eventos no existe flujo de reservas.

**Independent Test**: Crear un evento valido y recuperarlo en listados filtrados por venue y rango de fecha.

**Acceptance Scenarios**:

1. **Given** un venue existente, **When** creo un evento con capacidad valida, **Then** el evento queda registrado.
2. **Given** eventos existentes, **When** consulto con filtros, **Then** solo se devuelven eventos que cumplen criterios.
3. **Given** dos eventos activos en el mismo venue, **When** sus horarios se superponen, **Then** el segundo intento se rechaza.
4. **Given** un evento en sabado o domingo, **When** intento iniciarlo despues de las 22:00, **Then** se rechaza.

---

### User Story 2 - Reservar entradas (Priority: P1)

Como comprador, necesito reservar entradas identificandome con nombre y correo para asistir a un evento.

**Why this priority**: La reserva es el flujo principal de negocio.

**Independent Test**: Crear una reserva valida con buyerName, buyerEmail y quantity; validar restricciones por tiempo y precio.

**Acceptance Scenarios**:

1. **Given** un evento disponible, **When** reservo entradas con datos del comprador, **Then** se crea la reserva con codigo unico.
2. **Given** un evento que inicia en menos de 1 hora, **When** intento reservar, **Then** se rechaza.
3. **Given** un evento con precio mayor a 100, **When** pido mas de 10 entradas, **Then** se rechaza.
4. **Given** un evento que inicia en menos de 24 horas, **When** pido mas de 5 entradas, **Then** se rechaza aun si RN-05 permitiria mas.

---

### User Story 3 - Confirmar pago (Priority: P1)

Como administrador operativo, necesito confirmar pagos para convertir reservas en confirmadas.

**Why this priority**: Sin confirmacion no hay reserva final.

**Independent Test**: Confirmar una reserva valida y verificar estado final.

**Acceptance Scenarios**:

1. **Given** una reserva vigente, **When** confirmo el pago, **Then** la reserva queda confirmada.
2. **Given** una reserva inexistente, **When** intento confirmar pago, **Then** retorna error de no encontrado.
3. **Given** una reserva ya confirmada, **When** intento reconfirmar, **Then** retorna conflicto.

---

### User Story 4 - Cancelar reservas (Priority: P2)

Como comprador, necesito cancelar una reserva para liberar cupos cuando aplique o marcar perdida cuando corresponda.

**Why this priority**: Mantiene consistencia operativa y de reporte.

**Independent Test**: Cancelar una reserva confirmada en distintos umbrales de tiempo y validar capacidad/reportes.

**Acceptance Scenarios**:

1. **Given** una reserva confirmada con mas de 48 horas para el evento, **When** cancelo, **Then** se libera capacidad.
2. **Given** una reserva confirmada con menos de 48 horas para el evento, **When** cancelo, **Then** se marca perdida y no libera capacidad.

---

### User Story 5 - Reportes de ocupacion (Priority: P2)

Como administrador operativo, necesito reportes de ocupacion para analizar capacidad utilizada incluyendo perdidas.

**Why this priority**: Es clave para operacion y analitica.

**Independent Test**: Generar reporte y verificar inclusion de reservas perdidas y reglas de capacidad.

**Acceptance Scenarios**:

1. **Given** reservas confirmadas y reservas perdidas, **When** genero reporte, **Then** ambas impactan ocupacion segun reglas.
2. **Given** filtros por venue y fechas, **When** consulto reporte, **Then** se devuelven metricas correctas.

---

### Edge Cases

- Colisiones de codigo de reserva `EV-XXXXXX` deben resolverse garantizando unicidad.
- Dos reservas concurrentes para ultimos cupos no deben violar capacidad.
- Cancelacion exacta a 48 horas debe tratarse como "no menor a 48" (no perdida).
- Eventos de fin de semana que inician exactamente a las 22:00 son validos.

## Requirements *(mandatory)*

### Functional Requirements

- **RF-01**: El sistema DEBE permitir crear eventos con: nombre, venue, fecha/hora inicio, fecha/hora fin, precio y capacidad.
- **RF-02**: El sistema DEBE permitir listar eventos con filtros por venue, rango de fechas y estado.
- **RF-03**: El sistema DEBE permitir reservar entradas para eventos validando reglas de negocio de capacidad y tiempo.
  - Regla especial RF-03: Si el evento inicia en menos de 24 horas, el maximo es 5 entradas por transaccion.
  - Prioridad explicita RF-03 vs RN-05: Esta restriccion de 5 entradas tiene prioridad sobre RN-05.
- **RF-04**: El sistema DEBE permitir confirmar pagos de reservas para pasarlas a estado confirmado.
- **RF-05**: El sistema DEBE permitir cancelar reservas confirmadas aplicando:
  - Si NO aplica RN-07: liberar capacidad.
  - Si aplica RN-07: marcar perdida y NO liberar capacidad.
- **RF-06**: El sistema DEBE generar reportes de ocupacion por evento y venue.

### Business Rules (exactas del enunciado)

- **RN-01**: Un evento no puede exceder la capacidad del venue asignado.
- **RN-02**: Dos eventos activos no pueden compartir el mismo venue con horarios superpuestos.
- **RN-03**: Eventos en sabado o domingo no pueden iniciar despues de las 22:00.
- **RN-04**: No se permiten reservas para eventos que inicien en menos de 1 hora.
- **RN-05**: Eventos con precio mayor a 100 limitan a maximo 10 entradas por transaccion.
- **RN-06**: Un evento se marca automaticamente como completado cuando la fecha actual supera la fecha de finalizacion.
- **RN-07**: Si una reserva confirmada se cancela con menos de 48 horas para el evento:
  - se registra como perdida
  - no libera capacidad
  - debe incluirse en reportes

### Key Entities *(include if feature involves data)*

- **Event**: Id, Name, VenueId, StartAt, EndAt, Price, Capacity, Status, CreatedAt.
- **Venue**: Id, Name, City, Capacity (dato preexistente).
- **Reservation**: Id, EventId, BuyerName, BuyerEmail, Quantity, Status, ReservationCode, CreatedAt, CancelledAt, IsLost.
- **Payment**: Id, ReservationId, ConfirmedAt, Reference, Status.
- **OccupancyReport**: EventId, VenueId, CapacityTotal, CapacityConsumed, OccupancyPercentage.

### Preexisting Data

Los venues preexistentes cargados inicialmente son:
- Auditorio Central (200) - Bogota
- Sala Norte (50) - Bogota
- Arena Sur (500) - Medellin

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Crear evento valido y recuperarlo por listado/filtro exitosamente.
- **SC-002**: El sistema impide exceder capacidad bajo carga concurrente.
- **SC-003**: Flujo completo Reserva -> Confirmacion de pago se completa en <= 30 segundos.
- **SC-004**: Reportes de ocupacion reflejan valores correctos por evento y venue.
- **SC-005**: Cancelacion aplica correctamente liberacion o no liberacion de capacidad segun RN-07.
- **SC-006**: Cambios de estado de evento a completado se realizan automaticamente al superar EndAt.
- **SC-007**: RN-01 a RN-07 se aplican sin excepciones.
- **SC-008**: Consultas y reportes cumplen p95 < 500 ms.
- **SC-009**: Flujo end-to-end (crear evento, reservar, confirmar, cancelar, reportar) es ejecutable sin pasos manuales fuera del sistema.

## Assumptions

- No existe sistema de autenticacion.
- El comprador se identifica unicamente por BuyerName y BuyerEmail al reservar.
- No existe mecanismo de acceso con credenciales para compradores.
- La confirmacion de pago la ejecuta un operador administrativo del sistema, sin mecanismo de autenticacion en esta prueba.
- Zona horaria de operacion: Colombia (UTC-5).
- El codigo de reserva usa formato `EV-XXXXXX` y debe ser unico.
- Los venues son datos fijos de arranque y no se editan en este alcance.
