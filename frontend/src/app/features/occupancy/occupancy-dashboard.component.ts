import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { EventItem, OccupancyItem } from '../../models/ui-models';
import { ApiClientService } from '../../services/api-client.service';

@Component({
  selector: 'app-occupancy-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule, TableModule, ProgressBarModule, TagModule],
  template: `
    <section class="page">
      <header>
        <h2 class="section-title">Centro Ejecutivo de Ocupacion</h2>
        <p class="subtle-text">Visualiza rendimiento por evento, riesgo de perdida y eficiencia de capacidad por recinto.</p>
      </header>

      <section class="stats" *ngIf="!loading && !errorMessage">
        <p-card styleClass="surface-card stat-card">
          <p class="subtle-text">Ocupacion promedio</p>
          <h3>{{ averageOccupancy | number: '1.0-1' }}%</h3>
        </p-card>
        <p-card styleClass="surface-card stat-card">
          <p class="subtle-text">Ingresos estimados</p>
          <h3>{{ revenueSummary | currency: 'USD' }}</h3>
        </p-card>
        <p-card styleClass="surface-card stat-card">
          <p class="subtle-text">Asientos disponibles</p>
          <h3>{{ availableSeats }}</h3>
        </p-card>
        <p-card styleClass="surface-card stat-card">
          <p class="subtle-text">Asientos perdidos</p>
          <h3>{{ lostSeats }}</h3>
        </p-card>
      </section>

      <section class="focus-panels" *ngIf="!loading && !errorMessage && rows.length > 0">
        <p-card styleClass="surface-card">
          <h3>Salud General de Ocupacion</h3>
          <p class="subtle-text">Indice de utilizacion agregado y presion sobre inventario.</p>
          <div class="meter-wrap">
            <div>
              <small>Uso Global</small>
              <strong>{{ averageOccupancy | number: '1.0-0' }}%</strong>
            </div>
            <p-progressBar [value]="averageOccupancy"></p-progressBar>
          </div>
          <div class="meter-wrap">
            <div>
              <small>Capacidad Consumida</small>
              <strong>{{ consumedSeats }}</strong>
            </div>
            <p-progressBar [value]="consumedRate"></p-progressBar>
          </div>
        </p-card>

        <p-card styleClass="surface-card">
          <h3>Riesgo Comercial</h3>
          <p class="subtle-text">Eventos con asientos perdidos o baja traccion de ventas.</p>
          <div class="risk-item" *ngFor="let risk of riskRows">
            <div>
              <p>{{ risk.eventName }}</p>
              <small>{{ risk.capacityConsumed }}/{{ risk.capacityTotal }} asientos consumidos</small>
            </div>
            <p-tag [value]="risk.includesLostReservations ? 'Perdidas detectadas' : 'Saludable'" [severity]="risk.includesLostReservations ? 'warn' : 'success'"></p-tag>
          </div>
        </p-card>
      </section>

      <section class="loading" *ngIf="loading">
        <p-progressSpinner ariaLabel="loading"></p-progressSpinner>
      </section>

      <p-card styleClass="surface-card state error" *ngIf="errorMessage">
        <div class="state-content">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <p>{{ errorMessage }}</p>
            <button pButton type="button" label="Reintentar" icon="pi pi-refresh" (click)="load()"></button>
          </div>
        </div>
      </p-card>

      <p-card styleClass="surface-card state empty" *ngIf="!loading && !errorMessage && rows.length === 0">
        <div class="state-content">
          <i class="pi pi-inbox"></i>
          <p>No hay datos de ocupacion para mostrar.</p>
        </div>
      </p-card>

      <p-card styleClass="surface-card" *ngIf="!loading && !errorMessage && rows.length > 0">
        <p-table [value]="rows" responsiveLayout="scroll" [paginator]="true" [rows]="8" [rowsPerPageOptions]="[8,16,24]" sortMode="multiple">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="eventName">Evento</th>
              <th pSortableColumn="occupancyPercentage">Ocupacion %</th>
              <th pSortableColumn="capacityConsumed">Consumidos</th>
              <th pSortableColumn="capacityTotal">Capacidad</th>
              <th>Ingresos estimados</th>
              <th>Estado</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.eventName }}</td>
              <td>
                <div class="occ-cell">
                  <span>{{ row.occupancyPercentage | number: '1.0-1' }}%</span>
                  <p-progressBar [value]="row.occupancyPercentage"></p-progressBar>
                </div>
              </td>
              <td>{{ row.capacityConsumed }}</td>
              <td>{{ row.capacityTotal }}</td>
              <td>{{ eventRevenue(row.eventId, row.capacityConsumed) | currency: 'USD' }}</td>
              <td>
                <p-tag [value]="row.includesLostReservations ? 'Incluye perdidas' : 'Sin perdidas'" [severity]="row.includesLostReservations ? 'warn' : 'success'"></p-tag>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 16px;
      }

      .stats {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .focus-panels {
        display: grid;
        gap: 12px;
        grid-template-columns: 1.2fr 1fr;
      }

      .stat-card h3 {
        color: #1548a7;
        font-size: 1.6rem;
        margin: 6px 0 0;
      }

      .meter-wrap {
        display: grid;
        gap: 6px;
        margin-top: 0.8rem;
      }

      .meter-wrap small {
        color: #60749b;
      }

      .meter-wrap strong {
        font-size: 1rem;
      }

      .risk-item {
        align-items: center;
        border-bottom: 1px solid #e6ecf8;
        display: flex;
        justify-content: space-between;
        padding: 0.6rem 0;
      }

      .risk-item:last-child {
        border-bottom: none;
      }

      .risk-item p {
        font-weight: 600;
        margin: 0;
      }

      .risk-item small {
        color: #64789f;
      }

      .loading {
        display: grid;
        justify-content: center;
      }

      .state-content {
        align-items: center;
        display: flex;
        gap: 10px;
      }

      .state-content i {
        color: #335ea8;
      }

      .occ-cell {
        display: grid;
        gap: 6px;
        min-width: 180px;
      }

      @media (max-width: 920px) {
        .focus-panels {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class OccupancyDashboardComponent {
  rows: OccupancyItem[] = [];
  loading = false;
  errorMessage = '';

  averageOccupancy = 0;
  revenueSummary = 0;
  availableSeats = 0;
  lostSeats = 0;
  consumedSeats = 0;
  consumedRate = 0;
  riskRows: OccupancyItem[] = [];
  private priceByEvent = new Map<number, number>();

  constructor(private readonly apiClient: ApiClientService) {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin([this.apiClient.getOccupancy(), this.apiClient.getEvents()]).subscribe({
      next: ([occupancyResponse, eventsResponse]) => {
        this.rows = occupancyResponse.items;
        this.computeStats(occupancyResponse.items, eventsResponse.items);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar los indicadores de ocupacion.';
        this.loading = false;
      },
    });
  }

  private computeStats(occupancy: OccupancyItem[], events: EventItem[]): void {
    if (occupancy.length === 0) {
      this.averageOccupancy = 0;
      this.revenueSummary = 0;
      this.availableSeats = 0;
      this.lostSeats = 0;
      return;
    }

    const totalCapacity = occupancy.reduce((sum, item) => sum + item.capacityTotal, 0);
    const totalConsumed = occupancy.reduce((sum, item) => sum + item.capacityConsumed, 0);
    const byEvent = new Map(events.map((e) => [e.id, e]));
    this.priceByEvent = new Map(events.map((e) => [e.id, e.price]));

    this.averageOccupancy = occupancy.reduce((sum, item) => sum + item.occupancyPercentage, 0) / occupancy.length;
    this.availableSeats = Math.max(totalCapacity - totalConsumed, 0);
    this.lostSeats = occupancy.filter((item) => item.includesLostReservations).reduce((sum, item) => sum + item.capacityConsumed, 0);
    this.consumedSeats = totalConsumed;
    this.consumedRate = totalCapacity > 0 ? (totalConsumed / totalCapacity) * 100 : 0;
    this.riskRows = [...occupancy].sort((a, b) => Number(b.includesLostReservations) - Number(a.includesLostReservations)).slice(0, 5);
    this.revenueSummary = occupancy.reduce((sum, item) => {
      const event = byEvent.get(item.eventId);
      return sum + (event?.price ?? 0) * item.capacityConsumed;
    }, 0);
  }

  eventRevenue(eventId: number, consumed: number): number {
    return (this.priceByEvent.get(eventId) ?? 0) * consumed;
  }
}
