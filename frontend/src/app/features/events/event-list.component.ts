import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';
import { EventItem, OccupancyItem } from '../../models/ui-models';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    ProgressBarModule,
    SkeletonModule,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <h2 class="section-title">Gestor de Eventos</h2>
        <p class="subtle-text">Controla capacidad por recinto, estado comercial y proyeccion de ingresos por evento.</p>
      </header>

      <p-card styleClass="surface-card">
        <form [formGroup]="filters" class="filter-grid" (ngSubmit)="load()">
          <div class="field-wrap">
            <label for="eventType">Tipo de evento</label>
            <p-select inputId="eventType" [options]="eventTypeOptions" optionLabel="label" optionValue="value" formControlName="eventType" placeholder="Todos"></p-select>
          </div>

          <div class="field-wrap">
            <label for="venueId">Recinto</label>
            <p-select inputId="venueId" [options]="venueOptions" optionLabel="label" optionValue="value" formControlName="venueId" placeholder="Todos"></p-select>
          </div>

          <div class="field-wrap">
            <label for="status">Estado</label>
            <p-select inputId="status" [options]="statusOptions" optionLabel="label" optionValue="value" formControlName="status" placeholder="Todos"></p-select>
          </div>

          <div class="field-wrap date-range-wrap">
            <label for="dateRange">Rango de fechas</label>
            <p-datepicker inputId="dateRange" selectionMode="range" [showIcon]="true" formControlName="dateRange" dateFormat="yy-mm-dd" placeholder="Selecciona un rango"></p-datepicker>
          </div>

          <div class="field-wrap search-wrap">
            <label for="search">Busqueda</label>
            <span class="p-input-icon-left search-box">
              <i class="pi pi-search"></i>
              <input id="search" pInputText type="text" formControlName="search" placeholder="Nombre del evento" />
            </span>
          </div>

          <div class="actions">
            <button pButton type="submit" label="Buscar" icon="pi pi-filter" [loading]="loading"></button>
            <button pButton type="button" severity="secondary" [outlined]="true" label="Refrescar" icon="pi pi-refresh" (click)="load()"></button>
          </div>
        </form>
      </p-card>

      <section class="headline-kpis" *ngIf="!loading && !errorMessage">
        <p-card styleClass="surface-card mini-kpi">
          <span>Eventos visibles</span>
          <strong>{{ filteredRows.length }}</strong>
        </p-card>
        <p-card styleClass="surface-card mini-kpi">
          <span>Asientos disponibles</span>
          <strong>{{ totalAvailableSeats }}</strong>
        </p-card>
        <p-card styleClass="surface-card mini-kpi">
          <span>Ingresos proyectados</span>
          <strong>{{ projectedRevenue | currency: 'USD' }}</strong>
        </p-card>
      </section>

      <p-card styleClass="surface-card" *ngIf="loading">
        <div class="skeleton-grid">
          <p-skeleton height="9.6rem"></p-skeleton>
          <p-skeleton height="9.6rem"></p-skeleton>
          <p-skeleton height="9.6rem"></p-skeleton>
        </div>
      </p-card>

      <p-card styleClass="surface-card state-card" *ngIf="!loading && errorMessage">
        <div class="state-content">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <h3>Error al consultar eventos</h3>
            <p>{{ errorMessage }}</p>
            <button pButton type="button" label="Reintentar" icon="pi pi-refresh" (click)="load()"></button>
          </div>
        </div>
      </p-card>

      <p-card styleClass="surface-card state-card" *ngIf="!loading && !errorMessage && filteredRows.length === 0">
        <div class="state-content">
          <i class="pi pi-inbox"></i>
          <div>
            <h3>Sin resultados</h3>
            <p>No hay eventos para los filtros actuales.</p>
          </div>
        </div>
      </p-card>

      <section class="event-grid" *ngIf="!loading && !errorMessage && filteredRows.length > 0">
        <p-card styleClass="surface-card event-card" *ngFor="let row of filteredRows">
          <div class="event-top">
            <div>
              <h3>{{ row.name }}</h3>
              <p>{{ typeLabel(row.eventType) }} · {{ venueLabel(row.venueId) }} · {{ row.startAt | date: 'mediumDate' }}</p>
            </div>
            <p-tag [value]="statusLabel(row.status)" [severity]="statusSeverity(row.status)"></p-tag>
          </div>

          <p class="event-description">{{ row.description }}</p>

          <div class="event-meta-grid">
            <div>
              <small>Capacidad total</small>
              <strong>{{ row.capacity }}</strong>
            </div>
            <div>
              <small>Asientos disponibles</small>
              <strong>{{ availableSeats(row) }}</strong>
            </div>
            <div>
              <small>Precio unitario</small>
              <strong>{{ row.price | currency: 'USD' }}</strong>
            </div>
            <div>
              <small>Vista previa de ingresos</small>
              <strong>{{ revenuePreview(row) | currency: 'USD' }}</strong>
            </div>
          </div>

          <div class="occ-wrap">
            <div class="occ-labels">
              <span>Ocupacion</span>
              <strong>{{ getOccupancy(row.id) | number: '1.0-0' }}%</strong>
            </div>
            <p-progressBar [value]="getOccupancy(row.id)"></p-progressBar>
          </div>
        </p-card>
      </section>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 18px;
      }

      .page-header {
        display: grid;
        gap: 6px;
      }

      .filter-grid {
        align-items: end;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .field-wrap {
        display: grid;
        gap: 6px;
      }

      .field-wrap label {
        color: #41516f;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .date-range-wrap {
        min-width: 280px;
      }

      .search-wrap {
        min-width: 260px;
      }

      .headline-kpis {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .mini-kpi span {
        color: #60749b;
        display: block;
        font-size: 0.8rem;
      }

      .mini-kpi strong {
        display: block;
        font-size: 1.4rem;
        margin-top: 0.3rem;
      }

      .search-box {
        width: 100%;
      }

      .search-box input {
        width: 100%;
      }

      .actions {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        grid-column: 1 / -1;
        justify-content: flex-start;
      }

      .actions button {
        min-width: 122px;
      }

      :host ::ng-deep .filter-grid .p-select,
      :host ::ng-deep .filter-grid .p-datepicker,
      :host ::ng-deep .filter-grid .p-inputtext {
        width: 100%;
      }

      :host ::ng-deep .filter-grid .p-datepicker-input {
        width: 100%;
      }

      .event-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      .event-card h3 {
        margin: 0;
      }

      .event-card p {
        color: #5f7399;
        margin: 0.3rem 0 0;
      }

      .event-description {
        margin-top: 0.75rem;
      }

      .event-top {
        align-items: start;
        display: flex;
        justify-content: space-between;
      }

      .event-meta-grid {
        display: grid;
        gap: 6px;
        grid-template-columns: repeat(2, minmax(110px, 1fr));
        margin-top: 0.9rem;
      }

      .event-meta-grid small {
        color: #60749b;
        display: block;
      }

      .event-meta-grid strong {
        display: block;
        font-size: 1rem;
      }

      .occ-wrap {
        margin-top: 0.9rem;
      }

      .occ-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.4rem;
      }

      .skeleton-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }

      .state-content {
        align-items: center;
        display: flex;
        gap: 12px;
      }

      .state-content i {
        color: #335ea8;
        font-size: 1.4rem;
      }

      @media (max-width: 1200px) {
        .date-range-wrap,
        .search-wrap {
          min-width: 220px;
        }
      }

      @media (max-width: 900px) {
        .date-range-wrap,
        .search-wrap {
          min-width: 0;
        }

        .actions {
          grid-column: 1 / -1;
          justify-content: stretch;
        }

        .actions button {
          flex: 1;
        }
      }
    `,
  ],
})
export class EventListComponent {
  readonly filters = new FormGroup({
    eventType: new FormControl<string>(''),
    venueId: new FormControl<number | null>(null),
    status: new FormControl(''),
    dateRange: new FormControl<Date[] | null>(null),
    search: new FormControl(''),
  });

  readonly eventTypeOptions = [
    { label: 'Todos', value: '' },
    { label: 'Conferencia', value: 'Conference' },
    { label: 'Taller', value: 'Workshop' },
    { label: 'Concierto', value: 'Concert' },
  ];

  readonly venueOptions = [
    { label: 'Todos', value: null },
    { label: 'Auditorio Central', value: 1 },
    { label: 'Sala Norte', value: 2 },
    { label: 'Arena Sur', value: 3 },
  ];

  readonly statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'Active' },
    { label: 'Completado', value: 'Completed' },
    { label: 'Cancelado', value: 'Cancelled' },
  ];

  rows: EventItem[] = [];
  filteredRows: EventItem[] = [];
  occupancyMap = new Map<number, number>();
  loading = false;
  errorMessage = '';
  totalAvailableSeats = 0;
  projectedRevenue = 0;

  constructor(private readonly apiClient: ApiClientService) {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.occupancyMap.clear();

    const form = this.filters.getRawValue();
    const dateRange = form.dateRange ?? null;
    const from = dateRange?.[0] ? dateRange[0].toISOString() : undefined;
    const to = dateRange?.[1] ? dateRange[1].toISOString() : undefined;

    this.apiClient
      .getEvents({
        venueId: form.venueId ?? undefined,
        status: form.status || undefined,
        eventType: form.eventType || undefined,
        search: form.search || undefined,
        from,
        to,
      })
      .subscribe({
        next: (events) => {
          this.rows = events.items;
          this.applyFilters();
          this.loading = false;

          // Occupancy is loaded after rendering events to improve perceived speed.
          this.loadOccupancy(form.venueId ?? undefined, from, to);
        },
        error: (error: unknown) => {
          this.errorMessage = 'Verifica que la API este disponible y vuelve a intentarlo.';
          this.loading = false;
          console.error(error);
        },
      });
  }

  private loadOccupancy(venueId?: number, from?: string, to?: string): void {
    this.apiClient.getOccupancy({ venueId, from, to }).subscribe({
      next: (occupancy) => {
        this.occupancyMap = new Map(occupancy.items.map((item: OccupancyItem) => [item.eventId, item.occupancyPercentage]));
        this.applyFilters();
      },
      error: () => {
        // Keep events visible even if occupancy service fails.
      },
    });
  }

  applyFilters(): void {
    this.filteredRows = this.rows;

    this.totalAvailableSeats = this.filteredRows.reduce((sum, row) => sum + this.availableSeats(row), 0);
    this.projectedRevenue = this.filteredRows.reduce((sum, row) => sum + this.revenuePreview(row), 0);
  }

  typeLabel(eventType: string): string {
    if (eventType === 'Conference') return 'Conferencia';
    if (eventType === 'Workshop') return 'Taller';
    if (eventType === 'Concert') return 'Concierto';
    return eventType;
  }

  venueLabel(venueId: number): string {
    return this.venueOptions.find((v) => v.value === venueId)?.label ?? `Recinto ${venueId}`;
  }

  statusLabel(status: string): string {
    if (status === 'Active') return 'Activo';
    if (status === 'Completed') return 'Completado';
    if (status === 'Cancelled') return 'Cancelado';
    return status;
  }

  getOccupancy(eventId: number): number {
    return this.occupancyMap.get(eventId) ?? 0;
  }

  availableSeats(row: EventItem): number {
    const consumed = Math.round((this.getOccupancy(row.id) / 100) * row.capacity);
    return Math.max(row.capacity - consumed, 0);
  }

  revenuePreview(row: EventItem): number {
    const consumed = Math.round((this.getOccupancy(row.id) / 100) * row.capacity);
    return consumed * row.price;
  }

  statusSeverity(status: string): 'success' | 'info' | 'danger' | 'warn' | 'secondary' | 'contrast' {
    if (status === 'Active') return 'success';
    if (status === 'Completed') return 'info';
    if (status === 'Cancelled') return 'danger';
    return 'secondary';
  }
}
