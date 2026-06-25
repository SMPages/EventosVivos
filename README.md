# EventosVivos - Prueba Tecnica Fullstack (.NET + Angular)

Sistema de reservas para eventos culturales, conferencias y talleres.

## Arquitectura

- Backend: ASP.NET Core + MediatR + FluentValidation + EF Core (SQLite)
- Frontend: Angular standalone + PrimeNG
- Persistencia: SQLite (`backend/EventosVivos.Api/eventosvivos.db`)
- Estilo: API REST + capa de aplicacion + dominio

## Estructura

- `backend/EventosVivos.Api`: API REST
- `backend/EventosVivos.Application`: casos de uso, validaciones y contratos
- `backend/EventosVivos.Domain`: entidades y reglas de dominio
- `backend/EventosVivos.Infrastructure`: EF Core, DbContext, seeding
- `backend/EventosVivos.Tests`: pruebas unitarias/integracion/performance
- `frontend`: aplicacion Angular

## Requisitos

- .NET SDK 10
- Node.js 20+
- npm

## Configuracion

### Backend

1. Ir a la carpeta backend:

```bash
cd backend
```

2. Ejecutar API:

```bash
dotnet run --project EventosVivos.Api
```

API por defecto: `http://localhost:5162`

### Frontend

1. Ir a la carpeta frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar app:

```bash
npm start
```

Frontend por defecto: `http://localhost:4200`

## Comandos utiles

### Backend

```bash
cd backend
dotnet build
dotnet test
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Funcionalidades implementadas

- Creacion y listado de eventos con filtros
- Creacion de reservas
- Confirmacion de pagos
- Cancelacion de reservas con regla RN-07 (perdida)
- Reporte de ocupacion por evento/venue
- Dashboard operativo con metricas

## Notas de desarrollo

- En ambiente Development se aplica seed deterministico para demo al iniciar la API.
- Los enums se serializan como string para compatibilidad de UI.
- El frontend consume la API desde `frontend/src/environments` (`apiBaseUrl`).
