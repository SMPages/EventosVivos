# EventosVivos 🎭

**Plataforma Full Stack de Reservas para Eventos Culturales**

Sistema de gestión integral de eventos y reservas con arquitectura profesional en .NET 10 y Angular 21. Diseñado como prueba técnica Senior Full Stack, implementando patrones de arquitectura limpia, CQRS, y buenas prácticas empresariales.

---

## Descripción del Negocio

EventosVivos es una plataforma que permite a organizadores crear y gestionar eventos (conferencias, talleres, conciertos) en diferentes venues, y a asistentes realizar reservas, confirmar pagos y cancelar reservas cuando sea necesario.

**Problema que resuelve:**
- Gestión centralizada de eventos en múltiples venues
- Control de capacidad y disponibilidad en tiempo real
- Validaciones de negocio complejas (solapamiento de eventos, límites de horario)
- Generación de códigos de reserva y tracking de cancelaciones
- Reportes de ocupación y análisis de ingresos

---

## Características Principales Implementadas

### Gestión de Eventos
- ✅ Creación de eventos con validaciones de negocio
- ✅ Listado con filtros por venue, fecha, tipo, estado y búsqueda
- ✅ Estados de evento (Active, Completed, Cancelled)
- ✅ Tipos de evento (Conference, Workshop, Concert)
- ✅ Asignación automática de estado según fecha/hora

### Gestión de Reservas
- ✅ Creación de reservas con validación de capacidad
- ✅ Generación de códigos únicos de reserva
- ✅ Estados de reserva (Pending, Confirmed, Cancelled)
- ✅ Cancelación de reservas con validación de código
- ✅ Cálculo automático de pérdida (< 48 horas)

### Confirmación de Pagos
- ✅ Endpoint para confirmar pagos
- ✅ Vinculación pago-reserva
- ✅ Registro de fecha y referencia de pago

### Reportes Operativos
- ✅ Reporte de ocupación por evento y venue
- ✅ Resumen agregado: capacidad, ingresos, ocupación promedio
- ✅ Filtros por rango de fecha y venue

### Validaciones de Negocio
- ✅ RN-01: Capacidad del evento no puede exceder capacity del venue
- ✅ RN-02: No pueden existir eventos solapados en el mismo venue
- ✅ RN-03: Restricción de horario en fin de semana (no después de 22:00)
- ✅ SC-002: Validación de capacidad disponible en reserva
- ✅ RN-07: Marcación de reserva como "lost" si se cancela < 48 horas antes

---

## Arquitectura Implementada

### Patrón Arquitectónico: Clean Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  (EventosVivos.Api - Controllers, Middleware, Models)           │
└────────┬────────────────────────────────────────────────────────┘
         │ Dependency Injection
┌────────▼────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│  (MediatR Handlers, Commands, Queries, Validators, DTOs)        │
│  - CQRS Pattern: Separación lectura/escritura                   │
│  - FluentValidation: Validaciones declarativas                  │
│  - Exception Handling: Excepciones de negocio personalizadas    │
└────────┬────────────────────────────────────────────────────────┘
         │ Dependencies
┌────────▼────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                                │
│  (Entities, Enums, Business Logic, Repository Interfaces)       │
│  - Entidades anémicas con métodos de dominio                    │
│  - Lógica de negocio encapsulada                                │
└────────┬────────────────────────────────────────────────────────┘
         │ Persistence abstraction
┌────────▼────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                          │
│  (EF Core, DbContext, Migrations, Repositories, Services)       │
│  - Entity Framework Core 10.0.9                                 │
│  - Azure SQL Server Database Provider                           │
│  - Seeding, Migrations, UnitOfWork pattern                      │
└─────────────────────────────────────────────────────────────────┘
```

### Patrones Implementados

| Patrón | Implementación | Ubicación |
|--------|----------------|-----------|
| **Clean Architecture** | Separación en capas independientes | Estructura de proyectos |
| **CQRS** | Comandos y Queries separados | Application/Commands, Application/Queries |
| **MediatR** | Pipeline de mediación de requests | Application/DependencyInjection.cs |
| **Repository Pattern** | Acceso a datos abstracto | Infrastructure/Persistence |
| **Dependency Injection** | Inyección de dependencias nativa | Program.cs, DependencyInjection.cs |
| **Fluent Validation** | Validaciones declarativas | Application/Validators |
| **Entity Framework Core** | ORM modern | Infrastructure/Persistence |
| **Unit of Work** | Transacciones con SaveChangesAsync | AppDbContext |

### Flow de Solicitud Típica

```
HTTP Request
    ↓
[EventsController.Create(CreateEventCommand)]
    ↓
[MediatR Pipeline → Validators]
    ↓
[CreateEventCommandHandler]
    ↓
[Business Logic (Event.Overlaps, RN-01, RN-02)]
    ↓
[EF Core → DbContext.Events.Add]
    ↓
[AppDbContext.SaveChangesAsync()] → Azure SQL Database
    ↓
HTTP Response (201 Created + EventDto)
```

---

## Tecnologías Utilizadas

### Backend

**Framework & Core**
- **.NET 10** - Framework unificado multiplataforma
- **ASP.NET Core 10** - Web API framework
- **C# 13** - Lenguaje de programación

**Persistencia & ORM**
- **Entity Framework Core 10.0.9** - ORM moderno y type-safe
- **Microsoft.EntityFrameworkCore.SqlServer 10.0.9** - Provider SQL Server
- **Microsoft.Data.SqlClient 6.1.1** - Driver nativo SQL Server
- **Azure.Identity 1.14.2** - Autenticación Azure

**APIs & Validación**
- **MediatR** - Patrón mediador (versión incluida en Application layer)
- **FluentValidation.AspNetCore 11.3.1** - Validaciones fluidas
- **Swashbuckle.AspNetCore 10.2.3** - Documentación Swagger/OpenAPI
- **Microsoft.AspNetCore.OpenApi 10.0.8** - Soporte OpenAPI 3.0

**Testing**
- **xunit 2.9.3** - Framework de testing
- **Moq 4.20.72** - Mocking
- **FluentAssertions 8.10.0** - Assertions fluidas
- **Microsoft.EntityFrameworkCore.InMemory 10.0.9** - BD en memoria para tests

### Frontend

**Framework & Core**
- **Angular 21.2.0** - Framework frontend moderno (standalone)
- **TypeScript 5.9** - Lenguaje con tipos
- **RxJS 7.8.0** - Programación reactiva

**UI Components**
- **PrimeNG 21.1.9** - Componentes enterprise
- **PrimeFlex** - Grid & utilities (incluido en @primeuix/themes)
- **@primeuix/themes 2.0.3** - Sistema de temas moderno
- **primeicons 7.0.0** - Iconografía profesional

**Build & Development**
- **Angular CLI 21.2.3** - Herramienta de scaffolding
- **@angular/build 21.2.3** - Build system
- **Vitest 4.0.8** - Testing framework (alternativa rápida)
- **Prettier 3.8.1** - Code formatting

### Cloud & Infraestructura

**Hosting Backend**
- **Azure App Service** - Hosting de la API
- **Azure SQL Database** - Base de datos relacional

**Hosting Frontend**
- **Vercel** - Deploy automático desde GitHub

**Version Control**
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

---

## Estructura del Proyecto

```
CEIBA/
├── backend/
│   ├── EventosVivos.Api/                          # Capa de Presentación
│   │   ├── Controllers/
│   │   │   ├── EventsController.cs
│   │   │   ├── ReservationsController.cs
│   │   │   ├── PaymentsController.cs
│   │   │   └── OccupancyController.cs
│   │   ├── Middleware/
│   │   │   └── ErrorHandlingMiddleware.cs
│   │   ├── Program.cs                             # Configuración bootstrap
│   │   ├── appsettings.json                       # Config de BD y logging
│   │   └── EventosVivos.Api.csproj
│   │
│   ├── EventosVivos.Application/                  # Capa de Aplicación (CQRS)
│   │   ├── Commands/
│   │   │   ├── Events/
│   │   │   │   ├── CreateEventCommand.cs
│   │   │   │   └── CreateEventCommandHandler.cs
│   │   │   ├── Reservations/
│   │   │   │   ├── CreateReservationCommand.cs
│   │   │   │   ├── CreateReservationCommandHandler.cs
│   │   │   │   ├── CancelReservationCommand.cs
│   │   │   │   └── CancelReservationCommandHandler.cs
│   │   │   └── Payments/
│   │   │       ├── ConfirmPaymentCommand.cs
│   │   │       └── ConfirmPaymentCommandHandler.cs
│   │   ├── Queries/
│   │   │   ├── Events/
│   │   │   │   ├── GetEventsQuery.cs
│   │   │   │   └── GetEventsQueryHandler.cs
│   │   │   ├── Reservations/
│   │   │   │   ├── GetReservationsByBuyerQuery.cs
│   │   │   │   └── GetReservationsByBuyerQueryHandler.cs
│   │   │   └── Occupancy/
│   │   │       ├── GetOccupancyQuery.cs
│   │   │       └── GetOccupancyQueryHandler.cs
│   │   ├── Validators/                            # FluentValidation
│   │   │   ├── CreateEventCommandValidator.cs
│   │   │   ├── CreateReservationCommandValidator.cs
│   │   │   └── CancelReservationCommandValidator.cs
│   │   ├── Contracts/                             # DTOs
│   │   │   ├── Events/EventDto.cs
│   │   │   ├── Reservations/ReservationDto.cs
│   │   │   ├── Payments/PaymentDto.cs
│   │   │   └── Occupancy/OccupancyDto.cs
│   │   ├── Abstractions/
│   │   │   ├── IAppDbContext.cs                   # Repository interface
│   │   │   ├── IReservationCodeGenerator.cs
│   │   │   └── IDateTimeProvider.cs
│   │   ├── Services/                              # Application services
│   │   │   ├── ReservationCodeGenerator.cs
│   │   │   └── SystemDateTimeProvider.cs
│   │   ├── Common/
│   │   │   └── Exceptions/                        # Custom exceptions
│   │   │       ├── NotFoundException.cs
│   │   │       └── ConflictException.cs
│   │   └── DependencyInjection.cs                 # Service registration
│   │
│   ├── EventosVivos.Domain/                       # Capa de Dominio
│   │   ├── Entities/
│   │   │   ├── Event.cs
│   │   │   ├── Reservation.cs
│   │   │   ├── Payment.cs
│   │   │   └── Venue.cs
│   │   ├── Enums/
│   │   │   ├── EventType.cs                       # Conference, Workshop, Concert
│   │   │   ├── EventStatus.cs                     # Active, Completed, Cancelled
│   │   │   ├── ReservationStatus.cs               # Pending, Confirmed, Cancelled
│   │   │   └── PaymentStatus.cs                   # Confirmed
│   │   └── EventosVivos.Domain.csproj
│   │
│   ├── EventosVivos.Infrastructure/               # Capa de Infraestructura
│   │   ├── Persistence/
│   │   │   ├── AppDbContext.cs                    # EF DbContext
│   │   │   ├── DbSeeder.cs                        # Seed de datos iniciales
│   │   │   └── Migrations/
│   │   │       └── 20260625163154_InitialSqlServer.cs
│   │   ├── DependencyInjection.cs                 # Registro de servicios
│   │   └── EventosVivos.Infrastructure.csproj
│   │
│   ├── EventosVivos.Tests/                        # Capa de Testing
│   │   ├── Unit/                                  # Tests unitarios
│   │   │   ├── Events/
│   │   │   ├── Reservations/
│   │   │   └── Occupancy/
│   │   ├── Integration/                           # Tests de integración
│   │   ├── Performance/                           # Tests de performance
│   │   ├── TestSupport/
│   │   └── EventosVivos.Tests.csproj
│   │
│   └── EventosVivos.slnx                          # Solución
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/                          # Módulos funcionales
│   │   │   │   ├── dashboard/                     # Dashboard operativo
│   │   │   │   │   ├── dashboard.component.ts
│   │   │   │   │   └── dashboard.component.html
│   │   │   │   ├── events/                        # CRUD de eventos
│   │   │   │   │   ├── event-list.component.ts
│   │   │   │   │   ├── event-create.component.ts
│   │   │   │   │   └── event-detail.component.ts
│   │   │   │   ├── reservations/                  # CRUD de reservas
│   │   │   │   │   ├── reservation-list.component.ts
│   │   │   │   │   ├── reservation-create.component.ts
│   │   │   │   │   └── reservation-detail.component.ts
│   │   │   │   └── occupancy/                     # Reportes
│   │   │   │       ├── occupancy.component.ts
│   │   │   │       └── occupancy.component.html
│   │   │   ├── models/                            # Type definitions
│   │   │   │   ├── event.model.ts
│   │   │   │   ├── reservation.model.ts
│   │   │   │   └── payment.model.ts
│   │   │   ├── services/
│   │   │   │   └── api-client.service.ts          # Cliente HTTP
│   │   │   ├── shared/                            # Componentes compartidos
│   │   │   ├── app.routes.ts                      # Rutas
│   │   │   ├── app.config.ts                      # Configuración
│   │   │   └── app.ts                             # Componente root
│   │   ├── environments/
│   │   │   ├── environment.ts                     # Producción
│   │   │   └── environment.development.ts         # Desarrollo
│   │   ├── main.ts                                # Entry point
│   │   └── styles.css/scss                        # Estilos globales
│   │
│   ├── angular.json                               # Config Angular CLI
│   ├── tsconfig.json                              # Config TypeScript
│   ├── package.json                               # Dependencias npm
│   └── public/                                    # Assets estáticos
│
├── specs/
│   └── 001-event-reservation-core/               # Documentación del proyecto
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       └── quickstart.md
│
├── .github/
│   └── copilot-instructions.md                    # Instrucciones para GitHub Copilot
│
└── README.md                                      # Este archivo
```

---

## Reglas de Negocio Implementadas

### RN-01: Capacidad de Evento vs Venue
**Descripción:** La capacidad del evento no puede exceder la capacidad del venue donde se realiza.

**Implementación:**
```csharp
// EventosVivos.Application.Commands.Events.CreateEventCommandHandler
if (request.Capacity > venue.Capacity)
{
    throw new ConflictException("RN-01 violation: event capacity exceeds venue capacity.");
}
```

**Validado en:** CreateEventCommand (Handler y Validator)

---

### RN-02: No Solapamiento de Eventos en Venue
**Descripción:** No pueden existir dos eventos activos simultáneamente en el mismo venue.

**Implementación:**
```csharp
var overlaps = await db.Events
    .Where(e => e.VenueId == request.VenueId)
    .Where(e => e.Status == EventStatus.Active)
    .AnyAsync(e => request.StartAt < e.EndAt && request.EndAt > e.StartAt);
if (overlaps)
{
    throw new ConflictException("RN-02 violation: overlapping event in same venue.");
}
```

**Validado en:** CreateEventCommandHandler

---

### RN-03: Restricción de Horario en Fin de Semana
**Descripción:** Los eventos en fin de semana no pueden iniciar después de las 22:00.

**Implementación:**
```csharp
// Domain.Entities.Event
public bool StartsAfterWeekendLimit()
{
    var day = StartAt.DayOfWeek;
    if (day is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
    {
        return false;
    }
    return StartAt.TimeOfDay > TimeSpan.FromHours(22);
}
```

**Validado en:** CreateEventCommandValidator (FluentValidation)

---

### SC-002: Capacidad Disponible en Reserva
**Descripción:** La suma de reservas confirmadas y pendientes de un evento no puede exceder la capacidad del evento.

**Implementación:**
```csharp
var confirmedOrPending = await db.Reservations
    .Where(r => r.EventId == request.EventId)
    .Where(r => r.Status != ReservationStatus.Cancelled || r.IsLost)
    .SumAsync(r => (int?)r.Quantity) ?? 0;

if (confirmedOrPending + request.Quantity > ev.Capacity)
{
    throw new ConflictException("SC-002 violation: insufficient available capacity.");
}
```

**Validado en:** CreateReservationCommandHandler

---

### RN-07: Marcación de Reserva como Pérdida
**Descripción:** Si una reserva confirmada se cancela menos de 48 horas antes del evento, se marca como "lost" (pérdida).

**Implementación:**
```csharp
var hoursToStart = (ev.StartAt.ToUniversalTime() - clock.UtcNow).TotalHours;
var isLost = hoursToStart < 48;

reservation.Cancel(isLost, clock.UtcNow);
```

**Validado en:** CancelReservationCommandHandler

---

### RN-04: Generación Única de Código de Reserva
**Descripción:** Cada reserva debe tener un código único e irrepetible.

**Implementación:**
```csharp
var code = codeGenerator.Generate();
var exists = await db.Reservations.AnyAsync(r => r.ReservationCode == code);
if (exists)
{
    code = codeGenerator.Generate();
}
```

**Servicio:** ReservationCodeGenerator (Application.Services)

---

### RN-05: Validación de Código en Cancelación
**Descripción:** Solo se puede cancelar una reserva proporcionando su código exacto.

**Implementación:**
```csharp
if (!string.Equals(reservation.ReservationCode, request.ReservationCode, StringComparison.Ordinal))
{
    throw new ConflictException("Reservation code mismatch.");
}
```

**Validado en:** CancelReservationCommandHandler

---

### RN-06: Estados Válidos de Cancelación
**Descripción:** Solo las reservas confirmadas pueden cancelarse; no pueden cancelarse reservas ya canceladas o pendientes.

**Implementación:**
```csharp
if (reservation.Status == ReservationStatus.Cancelled)
{
    throw new ConflictException("Reservation already cancelled.");
}

if (reservation.Status != ReservationStatus.Confirmed)
{
    throw new ConflictException("Only confirmed reservations can be cancelled.");
}
```

**Validado en:** CancelReservationCommandHandler

---

### RN-08: Auto-transición de Estado de Evento
**Descripción:** Un evento pasa automáticamente a estado "Completed" cuando su fecha de finalización (EndAt) es anterior a la fecha actual.

**Implementación:**
```csharp
// Domain.Entities.Event
public void RefreshStatus(DateTime nowUtc)
{
    if (nowUtc > EndAt.ToUniversalTime())
    {
        Status = EventStatus.Completed;
    }
}
```

**Invocado en:** CreateEventCommandHandler, GetEventsQueryHandler

---

## Modelo de Datos

### Entidades & Relaciones

```sql
┌──────────────────┐
│     Venues       │
├──────────────────┤
│ Id (PK)          │
│ Name             │
│ City             │
│ Capacity         │
└──────────────────┘
         │ 1
         │
         │ N
         ▼
┌──────────────────┐
│     Events       │
├──────────────────┤
│ Id (PK)          │
│ Name             │
│ Description      │
│ VenueId (FK)     │
│ StartAt          │
│ EndAt            │
│ Price (10,2)     │
│ Capacity         │
│ EventType        │
│ Status           │
│ CreatedAt        │
└──────────────────┘
         │ 1
         │
         │ N
         ▼
┌──────────────────────┐
│   Reservations       │
├──────────────────────┤
│ Id (PK)              │
│ EventId (FK)         │
│ BuyerName            │
│ BuyerEmail           │
│ Quantity             │
│ Status               │
│ ReservationCode (UK) │
│ CreatedAt            │
│ CancelledAt          │
│ IsLost               │
└──────────────────────┘
         │ 1
         │
         │ N
         ▼
┌──────────────────┐
│    Payments      │
├──────────────────┤
│ Id (PK)          │
│ ReservationId(FK)│
│ ConfirmedAt      │
│ Reference        │
│ Status           │
└──────────────────┘
```

### Esquema SQL

**Venues**
```sql
CREATE TABLE Venues (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    Capacity INT NOT NULL
);
```

**Events**
```sql
CREATE TABLE Events (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    VenueId INT NOT NULL FOREIGN KEY REFERENCES Venues(Id),
    StartAt DATETIME2 NOT NULL,
    EndAt DATETIME2 NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Capacity INT NOT NULL,
    EventType INT NOT NULL,
    Status INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL
);
```

**Reservations**
```sql
CREATE TABLE Reservations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    EventId INT NOT NULL FOREIGN KEY REFERENCES Events(Id),
    BuyerName NVARCHAR(100) NOT NULL,
    BuyerEmail NVARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    Status INT NOT NULL,
    ReservationCode NVARCHAR(50) NOT NULL UNIQUE,
    CreatedAt DATETIME2 NOT NULL,
    CancelledAt DATETIME2 NULL,
    IsLost BIT NOT NULL
);
```

**Payments**
```sql
CREATE TABLE Payments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ReservationId INT NOT NULL FOREIGN KEY REFERENCES Reservations(Id),
    ConfirmedAt DATETIME2 NOT NULL,
    Reference NVARCHAR(100) NOT NULL,
    Status INT NOT NULL
);
```

### Enums del Dominio

| Enum | Valores | Descripción |
|------|---------|-------------|
| **EventType** | Conference, Workshop, Concert | Tipo de evento |
| **EventStatus** | Active, Completed, Cancelled | Estado del evento |
| **ReservationStatus** | Pending, Confirmed, Cancelled | Estado de reserva |
| **PaymentStatus** | Confirmed | Estado de pago |

### Seeders

Datos iniciales inyectados en `DbSeeder.SeedAsync()`:

**3 Venues:**
- Auditorio Central (Bogotá) - Capacity: 200
- Sala Norte (Bogotá) - Capacity: 50
- Arena Sur (Medellín) - Capacity: 500

**2 Eventos Demo:**
- Conferencia .NET para Equipos (Venue 1, en 10 días)
- Taller Angular Avanzado (Venue 2, en 12 días)

**Seed Policy:** No-destructivo (solo inserta si la tabla está vacía)

---

## API REST - Especificación Completa

### Base URL
```
https://eventosvivos-api-sebastian.azurewebsites.net/api
```

### Documentación Interactiva
```
https://eventosvivos-api-sebastian.azurewebsites.net/swagger/index.html
```

---

### 📌 Eventos

#### POST /events
**Crear un nuevo evento**

```http
POST /api/events HTTP/1.1
Content-Type: application/json

{
  "name": "Conferencia Cloud Native",
  "description": "Arquitectura moderna en la nube",
  "venueId": 1,
  "startAt": "2026-07-15T09:00:00Z",
  "endAt": "2026-07-15T15:00:00Z",
  "price": 150.00,
  "capacity": 100,
  "eventType": "Conference"
}
```

**Response: 201 Created**
```json
{
  "id": 5,
  "name": "Conferencia Cloud Native",
  "description": "Arquitectura moderna en la nube",
  "eventType": "Conference",
  "venueId": 1,
  "startAt": "2026-07-15T09:00:00Z",
  "endAt": "2026-07-15T15:00:00Z",
  "price": 150.00,
  "capacity": 100,
  "status": "Active"
}
```

**Validaciones:**
- Capacidad no exceda venue capacity (RN-01)
- Sin solapamiento de eventos en venue (RN-02)
- Fin de semana: startAt <= 22:00 (RN-03)

---

#### GET /events
**Listar eventos con filtros**

```http
GET /api/events?venueId=1&from=2026-07-01&to=2026-08-31&status=Active&eventType=Conference&search=Cloud HTTP/1.1
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| venueId | int? | Filtrar por venue |
| from | datetime? | Fecha inicio (desde) |
| to | datetime? | Fecha fin (hasta) |
| status | string? | Estado: Active, Completed, Cancelled |
| eventType | EventType? | Tipo: Conference, Workshop, Concert |
| search | string? | Búsqueda en nombre |

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Conferencia .NET para Equipos",
      "description": "...",
      "eventType": "Conference",
      "venueId": 1,
      "startAt": "2026-07-05T09:00:00Z",
      "endAt": "2026-07-05T15:00:00Z",
      "price": 120.00,
      "capacity": 120,
      "status": "Active"
    }
  ]
}
```

---

#### GET /events/{id}
**Obtener evento por ID**

```http
GET /api/events/1 HTTP/1.1
```

**Response: 200 OK**
```json
{
  "id": 1,
  "name": "Conferencia .NET para Equipos",
  "description": "...",
  "eventType": "Conference",
  "venueId": 1,
  "startAt": "2026-07-05T09:00:00Z",
  "endAt": "2026-07-05T15:00:00Z",
  "price": 120.00,
  "capacity": 120,
  "status": "Active"
}
```

**Response: 404 Not Found** si evento no existe

---

### 📌 Reservas

#### POST /reservations
**Crear una nueva reserva**

```http
POST /api/reservations HTTP/1.1
Content-Type: application/json

{
  "eventId": 1,
  "buyerName": "Juan Pérez",
  "buyerEmail": "juan@example.com",
  "quantity": 5
}
```

**Response: 201 Created**
```json
{
  "id": 1,
  "eventId": 1,
  "buyerName": "Juan Pérez",
  "buyerEmail": "juan@example.com",
  "quantity": 5,
  "status": "Pending",
  "reservationCode": "RES-ABC123XYZ",
  "createdAt": "2026-06-25T10:30:00Z",
  "cancelledAt": null,
  "isLost": false
}
```

**Validaciones:**
- Evento debe existir
- Capacidad disponible (RN-04): reserved + pending ≤ event.capacity
- Código generado de forma única

---

#### GET /reservations
**Listar reservas del comprador**

```http
GET /api/reservations?buyerEmail=juan@example.com&status=Confirmed HTTP/1.1
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| buyerEmail | string | Email del comprador |
| status | string? | Estado: Pending, Confirmed, Cancelled |

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": 1,
      "eventId": 1,
      "buyerName": "Juan Pérez",
      "buyerEmail": "juan@example.com",
      "quantity": 5,
      "status": "Confirmed",
      "reservationCode": "RES-ABC123XYZ",
      "createdAt": "2026-06-25T10:30:00Z",
      "cancelledAt": null,
      "isLost": false
    }
  ]
}
```

---

#### GET /reservations/{id}
**Obtener reserva por ID**

```http
GET /api/reservations/1 HTTP/1.1
```

**Response: 200 OK**
```json
{
  "id": 1,
  "eventId": 1,
  "buyerName": "Juan Pérez",
  "buyerEmail": "juan@example.com",
  "quantity": 5,
  "status": "Confirmed",
  "reservationCode": "RES-ABC123XYZ",
  "createdAt": "2026-06-25T10:30:00Z",
  "cancelledAt": null,
  "isLost": false
}
```

---

#### GET /reservations/by-buyer
**Obtener reservas por email del comprador (ruta alternativa)**

```http
GET /api/reservations/by-buyer?buyerEmail=juan@example.com HTTP/1.1
```

---

#### POST /reservations/{id}/cancel
**Cancelar una reserva confirmada**

```http
POST /api/reservations/1/cancel HTTP/1.1
Content-Type: application/json

{
  "reservationCode": "RES-ABC123XYZ"
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "eventId": 1,
  "buyerName": "Juan Pérez",
  "buyerEmail": "juan@example.com",
  "quantity": 5,
  "status": "Cancelled",
  "reservationCode": "RES-ABC123XYZ",
  "createdAt": "2026-06-25T10:30:00Z",
  "cancelledAt": "2026-06-25T14:00:00Z",
  "isLost": false
}
```

**Validaciones:**
- Reserva debe existir
- Código debe ser exacto (RN-05)
- Reserva debe estar Confirmed (RN-06)
- No puede estar ya cancelada
- isLost = true si hoursToStart < 48 (RN-07)

---

### 📌 Pagos

#### POST /payments/confirm
**Confirmar un pago**

```http
POST /api/payments/confirm HTTP/1.1
Content-Type: application/json

{
  "reservationId": 1,
  "reference": "TXN-20260625-001"
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "reservationId": 1,
  "confirmedAt": "2026-06-25T14:30:00Z",
  "reference": "TXN-20260625-001",
  "status": "Confirmed"
}
```

---

### 📌 Reportes - Ocupación

#### GET /occupancy
**Obtener ocupación por evento**

```http
GET /api/occupancy?venueId=1&from=2026-07-01&to=2026-08-31 HTTP/1.1
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| venueId | int? | Filtrar por venue |
| from | datetime? | Desde |
| to | datetime? | Hasta |

**Response: 200 OK**
```json
{
  "items": [
    {
      "eventId": 1,
      "eventName": "Conferencia .NET",
      "venueId": 1,
      "venueName": "Auditorio Central",
      "eventStartAt": "2026-07-05T09:00:00Z",
      "capacityTotal": 120,
      "capacityConsumed": 75,
      "confirmedTicketsSold": 75,
      "availableSeats": 45,
      "occupancyPercentage": 62.50,
      "totalRevenue": 9000.00
    }
  ],
  "generatedAt": "2026-06-25T14:45:00Z"
}
```

---

#### GET /occupancy/summary
**Resumen agregado de ocupación**

```http
GET /api/occupancy/summary?venueId=1 HTTP/1.1
```

**Response: 200 OK**
```json
{
  "totalEvents": 5,
  "totalCapacity": 500,
  "totalConsumed": 350,
  "soldTickets": 350,
  "availableSeats": 150,
  "totalRevenue": 45000.00,
  "averageOccupancyPercentage": 70.00,
  "generatedAt": "2026-06-25T14:45:00Z"
}
```

---

### Manejo de Errores

Toda respuesta de error sigue esta estructura:

```json
{
  "error": "Descriptive error message",
  "statusCode": 400
}
```

| Status | Escenario |
|--------|-----------|
| **400** | Bad Request (validación fallida) |
| **404** | Not Found (recurso no existe) |
| **409** | Conflict (violación de regla de negocio) |
| **500** | Internal Server Error |

**Ejemplo: RN-01 violada**
```json
{
  "error": "RN-01 violation: event capacity exceeds venue capacity.",
  "statusCode": 409
}
```

---

## Ejecución Local

### Requisitos Previos
- .NET SDK 10.0.x
- Node.js 20+
- npm 11+
- SQL Server 2019+ (local o Azure)
- Git

### Backend

#### 1. Restaurar dependencias
```powershell
cd backend
dotnet restore
```

#### 2. Ejecutar migraciones (crear BD)
```powershell
dotnet ef database update --project EventosVivos.Infrastructure --startup-project EventosVivos.Api
```

#### 3. Iniciar API
```powershell
dotnet run --project EventosVivos.Api
```

**La API estará disponible en:** `http://localhost:5162`

**Swagger disponible en:** `http://localhost:5162/swagger/index.html`

#### 4. Alternativa: Usar el archivo de configuración
El archivo `appsettings.json` contiene la cadena de conexión a Azure SQL. Para desarrollo local, modifica la cadena de conexión a tu servidor SQL Server.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Initial Catalog=eventosvivos-local;Integrated Security=true;TrustServerCertificate=true;"
  }
}
```

---

### Frontend

#### 1. Instalar dependencias
```powershell
cd frontend
npm install
```

#### 2. Iniciar servidor de desarrollo
```powershell
npm start
```

**La aplicación estará disponible en:** `http://localhost:4200`

#### 3. Compilar para producción
```powershell
npm run build
```

**Salida:** `frontend/dist/`

---

## Configuración

### Variables de Entorno

**Backend (appsettings.json)**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:eventosvivos-sql-sebastian.database.windows.net,1433;Initial Catalog=eventosvivos-db;User ID=adminEventos;Password=***;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**Frontend (environments/environment.ts)**
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://eventosvivos-api-sebastian.azurewebsites.net/api'
};
```

---

## Despliegue

### Backend - Azure App Service

#### Requisitos
- Cuenta Azure con permisos de App Service
- Azure SQL Database previamente configurada
- Azure CLI instalado (opcional)

#### Pasos

##### 1. Publicar desde Visual Studio 2025
```
1. Clic derecho en proyecto "EventosVivos.Api"
2. Publicar...
3. Seleccionar Azure App Service
4. Crear nuevo o seleccionar existente
5. Configurar nombre, región, plan
6. Siguiente → Base de datos SQL Azure
7. Publicar
```

##### 2. Publicar desde CLI
```powershell
dotnet publish -c Release -o ./publish
cd publish
dotnet EventosVivos.Api.dll
```

Luego subir carpeta `publish` a Azure App Service.

#### Variables de Entorno en Azure

En Azure App Service → Configuración → Configuración de la aplicación:

| Clave | Valor |
|-------|-------|
| `ConnectionStrings__DefaultConnection` | `Server=tcp:eventosvivos-sql-sebastian.database.windows.net,1433;...` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

### Base de Datos - Azure SQL

#### Setup inicial

1. Crear SQL Server en Azure Portal
2. Crear base de datos `eventosvivos-db`
3. Configurar firewall (permitir Azure services)
4. Guardar connection string

#### Migraciones en Azure

Las migraciones se ejecutan **automáticamente** al iniciar la API:

```csharp
// Program.cs
var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await db.Database.MigrateAsync();
await DbSeeder.SeedAsync(db);
```

No requiere pasos manuales. El seeding también es automático.

### Frontend - Vercel

#### Deploy automático desde GitHub

1. Conectar repositorio GitHub a Vercel
2. Vercel detecta automáticamente:
   - Framework: Angular
   - Build command: `npm run build`
   - Output directory: `dist/`

3. Configurar variables de entorno:
   - `NEXT_PUBLIC_API_BASE_URL` (si necesario para SSR)

4. Cada push a `main` dispara deploy automático

**URL publicada:** `https://eventos-vivos-4h13bpane-ceiba2.vercel.app/dashboard`

---

## Pruebas

### Backend Tests

#### Ejecutar todos los tests
```powershell
cd backend
dotnet test
```

#### Ejecutar tests específicos
```powershell
dotnet test --filter "EventosVivos.Tests.Unit"
dotnet test --filter "EventosVivos.Tests.Integration"
dotnet test --filter "EventosVivos.Tests.Performance"
```

#### Coverage
```powershell
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura
```

#### Frameworks Utilizados
- **xunit**: Framework de testing
- **Moq**: Mocking y stubbing
- **FluentAssertions**: Assertions fluidas
- **In-Memory EF Core**: Base de datos en memoria

### Estructura de Tests

```
EventosVivos.Tests/
├── Unit/
│   ├── Events/
│   │   └── CreateEventCommandHandlerTests.cs
│   ├── Reservations/
│   │   ├── CreateReservationCommandHandlerTests.cs
│   │   └── CancelReservationCommandHandlerTests.cs
│   └── Occupancy/
│       └── GetOccupancyQueryHandlerTests.cs
├── Integration/
│   └── [Integration tests against real DB]
└── Performance/
    └── [Performance benchmarks]
```

#### Ejemplo de Test Unitario
```csharp
[Fact]
public async Task CreateEvent_WhenCapacityExceedsVenue_ShouldThrowConflictException()
{
    // Arrange
    var venue = new Venue { Id = 1, Name = "Test", Capacity = 100 };
    var command = new CreateEventCommand 
    { 
        VenueId = 1, 
        Capacity = 150,  // Excede venue capacity
        StartAt = DateTime.UtcNow.AddDays(5),
        EndAt = DateTime.UtcNow.AddDays(5).AddHours(4)
    };

    // Act & Assert
    await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(command, default));
}
```

---

## Decisiones Arquitectónicas

### 1. Clean Architecture
**Por qué:** Separación clara de responsabilidades, independencia de frameworks, y facilidad de testabilidad.

**Cómo:** Capas independientes (Domain → Application → Infrastructure/Presentation) con dependencias hacia adentro.

**Beneficios:**
- Código desacoplado y reutilizable
- Fácil de testear (tests unitarios sin BD)
- Permite cambiar detalles de implementación sin afectar lógica

---

### 2. CQRS (Command Query Responsibility Segregation)
**Por qué:** Separar lecturas de escrituras para optimizar cada una independientemente.

**Cómo:** 
- **Comandos** (`CreateEventCommand`, `CancelReservationCommand`) para cambios de estado
- **Queries** (`GetEventsQuery`, `GetOccupancyQuery`) para lecturas

**Beneficios:**
- Queries optimizadas sin lógica transaccional
- Escalabilidad futura (separar lecturas/escrituras físicamente)
- Claridad de intención en el código

---

### 3. MediatR
**Por qué:** Implementar Command/Query buses y evitar inyectar todos los handlers en cada controller.

**Cómo:** Controllers envían requests → MediatR → Handler correspondiente

**Beneficios:**
- Desacoplamiento entre controllers y handlers
- Pipeline de validación/middleware centralizado
- Facilita testing (mock MediatR en lugar de todo el stack)

---

### 4. Entity Framework Core (SQL Server)
**Por qué:** ORM moderno con soporte a migraciones versionadas y LINQ type-safe.

**Cómo:** DbContext con DbSets, migrations automáticas, seeding declarativo.

**Beneficios:**
- Versionado de esquema (migraciones)
- Cambios de proveedor sin reescribir queries (SQLite → SQL Server)
- Transacciones nativas

---

### 5. FluentValidation
**Por qué:** Validaciones declarativas, separadas de la lógica de negocio.

**Cómo:** Validators independientes por Command/Query, pipeline en MediatR.

**Beneficios:**
- Validaciones reutilizables
- Errores detallados y contextualizados
- Fácil de testear en aislamiento

---

### 6. Angular 21 Standalone Components
**Por qué:** Arquitectura moderna simplificada, menos boilerplate.

**Cómo:** Componentes con `@Component({ standalone: true })` sin necesidad de módulos.

**Beneficios:**
- Componentes auto-contenidos
- Tree-shaking mejorado (solo incluye dependencias necesarias)
- Routing simplificado

---

### 7. PrimeNG + PrimeFlex
**Por qué:** Componentes enterprise profesionales y consistentes.

**Cómo:** Uso de Card, DataTable, Form, Dialog, Button, etc. de PrimeNG.

**Beneficios:**
- Interfaz profesional desde día 1
- Componentes accesibles (WCAG)
- Temas y personalización

---

### 8. Azure SQL Database
**Por qué:** Escalabilidad, seguridad, y respaldo automático para producción.

**Cómo:** Migraciones versionadas → Auto-apply en startup.

**Beneficios:**
- Alta disponibilidad
- Backups automáticos
- Auditoría integrada
- Cumplimiento normativo (GDPR, ISO)

---

### 9. Vercel para Frontend
**Por qué:** Deploy automático, CDN global, y preview environments.

**Cómo:** Conectar GitHub, build automático en cada push.

**Beneficios:**
- Zero-config deployment
- Performance optimizado
- Logs y analytics integrados

---

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                     │
│  Angular 21 + PrimeNG + PrimeFlex                       │
│  https://eventos-vivos-4h13bpane-ceiba2.vercel.app/   │
└────────┬────────────────────────────────────────────────┘
         │ HTTPS (CORS: AllowAll)
         │
┌────────▼────────────────────────────────────────────────┐
│              AZURE APP SERVICE (Backend)                 │
│  .NET 10 + ASP.NET Core + MediatR + FluentValidation    │
│  https://eventosvivos-api-sebastian.azurewebsites.net/ │
│                                                          │
│  ├─ Controllers (Events, Reservations, Payments, etc.)  │
│  ├─ MediatR Pipeline                                    │
│  ├─ Validators                                          │
│  └─ Error Handling Middleware                           │
└────────┬────────────────────────────────────────────────┘
         │ Entity Framework Core (SQL Server Provider)
         │
┌────────▼────────────────────────────────────────────────┐
│         AZURE SQL DATABASE                              │
│  eventosvivos-db                                        │
│  Server: eventosvivos-sql-sebastian.database.windows.net│
│                                                          │
│  Tables:                                                │
│  ├─ Venues                                              │
│  ├─ Events                                              │
│  ├─ Reservations                                        │
│  └─ Payments                                            │
└─────────────────────────────────────────────────────────┘
```

---

## Flujos de Negocio Clave

### Flow 1: Crear Evento

```
User → [POST /api/events] → EventsController
    ↓
MediatR Pipeline → Validators
    ↓ (Válido)
CreateEventCommandHandler
    ├─ Obtener Venue (RN-01 check)
    ├─ Validar no-solapamiento (RN-02)
    ├─ Validar horario fin de semana (RN-03)
    ├─ Crear entidad Event
    ├─ Refresh estado (RN-08)
    └─ db.SaveChangesAsync()
    ↓
[201 Created + EventDto]
```

---

### Flow 2: Crear Reserva

```
User → [POST /api/reservations] → ReservationsController
    ↓
MediatR Pipeline → Validators
    ↓ (Válido)
CreateReservationCommandHandler
    ├─ Validar evento existe
    ├─ Sumar reserved + pending (RN-04)
    ├─ Validar capacity: reserved + new ≤ event.capacity
    ├─ Generar código único (RN-05)
    ├─ Crear entidad Reservation
    └─ db.SaveChangesAsync()
    ↓
[201 Created + ReservationDto]
```

---

### Flow 3: Cancelar Reserva

```
User → [POST /api/reservations/{id}/cancel] + {code} → ReservationsController
    ↓
MediatR Pipeline → Validators
    ↓ (Válido)
CancelReservationCommandHandler
    ├─ Obtener reserva
    ├─ Validar código exacto (RN-06)
    ├─ Validar estado = Confirmed (RN-07)
    ├─ Calcular horas a evento
    ├─ Determinar isLost (< 48 horas → lost) (RN-07)
    ├─ reservation.Cancel(isLost)
    └─ db.SaveChangesAsync()
    ↓
[200 OK + ReservationDto con status=Cancelled]
```

---

## Mejoras Futuras

### Phase 1: Seguridad & Autenticación (P0)
- [ ] Implementar JWT + Identity Server
- [ ] Roles y autorización (Admin, Organizer, User)
- [ ] Validación de email con OTP
- [ ] Rate limiting en endpoints críticos

### Phase 2: Pagos Real (P1)
- [ ] Integración Stripe/PayU
- [ ] Webhook para confirmación de pago
- [ ] Reintento de pago fallido
- [ ] Facturación automática

### Phase 3: Notificaciones (P1)
- [ ] Email de confirmación de reserva
- [ ] SMS de recordatorio 24h antes
- [ ] Push notifications en app
- [ ] Integración SendGrid/Twilio

### Phase 2: Escalabilidad (P2)
- [ ] CQRS con read replicas
- [ ] Redis para caché de eventos
- [ ] Event sourcing para auditoría
- [ ] Message queue (RabbitMQ/Azure Service Bus)

### Phase 4: Analytics & Reporting (P2)
- [ ] Dashboard ejecutivo con métricas
- [ ] Reportes exportables (PDF/Excel)
- [ ] Análisis predictivo de ocupación
- [ ] Integración Power BI

### Phase 5: Experiencia de Usuario (P2)
- [ ] Sistema de recomendaciones
- [ ] Historial de reservas con filtros
- [ ] Wishlist de eventos favoritos
- [ ] Sistema de reviews/ratings
- [ ] QR code en entrada (validación)

### Phase 6: Internacionalización (P3)
- [ ] Soporte multi-idioma (i18n)
- [ ] Conversión de moneda
- [ ] Ajustes de zona horaria

---

## Infraestructura & Despliegue

### Entornos Desplegados

#### Frontend
- **Ambiente:** Vercel (CI/CD automático)
- **URL:** https://eventos-vivos-4h13bpane-ceiba2.vercel.app/dashboard
- **Build:** `npm run build` (automático)
- **Deploy:** Manual desde GitHub

#### Backend API
- **Ambiente:** Azure App Service
- **URL:** https://eventosvivos-api-sebastian.azurewebsites.net
- **Documentación:** https://eventosvivos-api-sebastian.azurewebsites.net/swagger/index.html
- **Deploy:** Publish desde Visual Studio o Azure DevOps

#### Base de Datos
- **Ambiente:** Azure SQL Database
- **Servidor:** eventosvivos-sql-sebastian.database.windows.net
- **Base de datos:** eventosvivos-db
- **Versión:** SQL Server 2019+
- **Backup:** Automático cada 24h

### URLs Públicas

| Componente | URL |
|-----------|-----|
| **Frontend** | https://eventos-vivos-4h13bpane-ceiba2.vercel.app/dashboard |
| **API** | https://eventosvivos-api-sebastian.azurewebsites.net |
| **Swagger** | https://eventosvivos-api-sebastian.azurewebsites.net/swagger/index.html |
| **Database Server** | eventosvivos-sql-sebastian.database.windows.net |

### CI/CD Pipeline

```
GitHub Push
    ↓
[Frontend] → Vercel Build → Auto-deploy → Live
    ↓
[Backend] → Visual Studio Publish → App Service → Live (manual)
    ↓
[Database] → EF Core Migrations → Auto-apply on startup
```

### Health Check

```bash
# API disponible
curl -I https://eventosvivos-api-sebastian.azurewebsites.net/swagger/index.html

# Swagger endpoints
curl https://eventosvivos-api-sebastian.azurewebsites.net/swagger/v1/swagger.json
```

---

## Comandos Útiles

### Backend

```powershell
# Restaurar dependencias
dotnet restore

# Compilar solución
dotnet build

# Ejecutar tests
dotnet test

# Ejecutar tests con coverage
dotnet test /p:CollectCoverage=true

# Ejecutar API
dotnet run --project EventosVivos.Api

# Crear migración
dotnet ef migrations add InitialCreate --project EventosVivos.Infrastructure --startup-project EventosVivos.Api

# Aplicar migraciones
dotnet ef database update --project EventosVivos.Infrastructure --startup-project EventosVivos.Api

# Ver migraciones pendientes
dotnet ef migrations list --project EventosVivos.Infrastructure --startup-project EventosVivos.Api

# Eliminar migración última
dotnet ef migrations remove --project EventosVivos.Infrastructure --startup-project EventosVivos.Api
```

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar dev server
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Analizar bundle size
npm run build -- --stats-json
```

### Docker (Futuro)

```bash
# Buildear imagen backend
docker build -f backend/Dockerfile -t eventosvivos-api:latest .

# Ejecutar contenedor
docker run -p 5162:80 eventosvivos-api:latest
```

---

## Troubleshooting

### Backend

#### Error: "Connection string 'DefaultConnection' is required"
**Solución:** Verificar `appsettings.json` contiene `ConnectionStrings.DefaultConnection`

#### Error: "Unable to retrieve project metadata" en EF migrations
**Solución:**
```powershell
# Usar rutas absolutas
dotnet ef migrations add InitialSqlServer --project "C:\...\EventosVivos.Infrastructure" --startup-project "C:\...\EventosVivos.Api"

# O asegurar que EventosVivos.Api tiene Microsoft.EntityFrameworkCore.Design package
dotnet add package Microsoft.EntityFrameworkCore.Design
```

#### Error: Database timeout
**Solución:**
- Verificar firewall de Azure SQL (permitir Azure services)
- Verificar connection string incluye `Encrypt=True`
- Aumentar `Connection Timeout=60` en connection string

### Frontend

#### Error: "Cannot GET /api/events" en frontend local
**Solución:** Verificar que backend está corriendo y CORS está configurado con AllowAll

#### Error: "Module not found"
**Solución:**
```bash
npm install
npm start
```

#### Build size muy grande
**Solución:**
```bash
npm run build -- --configuration production --aot
```

---

## Licencia

Este proyecto es un ejercicio técnico para demostración de arquitectura y patrones. No está licenciado para uso comercial.

---

## Autor

**Sebastián**  
Arquitecto de Software Senior | Full Stack (.NET + Angular)

Prueba técnica desarrollada demostrando:
- Clean Architecture en .NET 10
- CQRS con MediatR
- Entity Framework Core con SQL Server
- Angular 21 Standalone Components
- Validaciones de negocio complejas
- Pruebas unitarias e integración
- Deploy en Azure + Vercel

---

## Contacto

Para preguntas técnicas o revisión de código:
- Repository: https://github.com/ceiba/eventos-vivos
- Issues: GitHub Issues
- Pull Requests: Se aceptan contribuciones

---

**Última actualización:** 25 de Junio de 2026  
**Versión:** 2.0 (SQL Server + Azure)  
**Estado:** ✅ Production Ready
