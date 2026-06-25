import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ApiClientService } from '../../services/api-client.service';
import { EventItem, OccupancyItem, ReservationItem } from '../../models/ui-models';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ProgressBarModule, SkeletonModule, TagModule],
  template: `
    <section class="page">
      <header class="hero surface-card">
        <div>
          <p class="eyebrow">EventosVivos Intelligence</p>
          <h2 class="section-title">Panel de Control Operativo</h2>
          <p class="subtle-text">Monitorea capacidad, ventas y rendimiento de reservas en tiempo real para decisiones de negocio.</p>
        </div>
        <div class="hero-actions">
          <button pButton label="Nueva Reserva" icon="pi pi-ticket" routerLink="/reservations/new"></button>
          <button pButton severity="secondary" [outlined]="true" label="Ver Eventos" icon="pi pi-calendar" routerLink="/events"></button>
        </div>
      </header>

      <section class="kpi-grid" *ngIf="!loading; else loadingTpl">
        <p-card styleClass="surface-card kpi" *ngFor="let card of kpiCards">
          <div class="kpi-top">
            <span>{{ card.label }}</span>
            <i [class]="card.icon"></i>
          </div>
          <h3>{{ card.value }}</h3>
          <small>{{ card.hint }}</small>
        </p-card>
      </section>

      <section class="insights" *ngIf="!loading && !errorMessage">
        <p-card styleClass="surface-card occupancy-overview">
          <div class="panel-head">
            <h3>Ocupacion Promedio</h3>
            <p-tag value="En vivo" severity="success"></p-tag>
          </div>
          <p class="subtle-text">{{ occupancyAverage | number: '1.0-1' }}% sobre {{ occupancyRows.length }} eventos medidos</p>
          <p-progressBar [value]="occupancyAverage"></p-progressBar>
          <div class="legend-row">
            <span>Asientos vendidos: <strong>{{ soldTickets }}</strong></span>
            <span>Asientos disponibles: <strong>{{ availableSeats }}</strong></span>
            <span>Asientos perdidos: <strong>{{ lostSeats }}</strong></span>
          </div>
        </p-card>

        <p-card styleClass="surface-card heat-list">
          <div class="panel-head">
            <h3>Top Eventos por Ingresos</h3>
          </div>
          <div class="event-row" *ngFor="let row of revenueLeaders">
            <div>
              <p>{{ row.name }}</p>
              <small>{{ row.occupancy | number: '1.0-0' }}% ocupacion</small>
            </div>
            <div class="event-meta">
              <strong>{{ row.revenue | currency: 'USD' }}</strong>
              <p-tag [value]="eventStatusLabel(row.status)" [severity]="row.status === 'Active' ? 'success' : 'info'"></p-tag>
            </div>
          </div>
        </p-card>
      </section>

      <p-card styleClass="surface-card state error" *ngIf="errorMessage && !loading">
        <div class="state-content">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <h3>Error de carga</h3>
            <p>{{ errorMessage }}</p>
            <button pButton label="Reintentar" icon="pi pi-refresh" (click)="load()"></button>
          </div>
        </div>
      </p-card>

      <ng-template #loadingTpl>
        <section class="kpi-grid">
          <p-card styleClass="surface-card" *ngFor="let s of [1,2,3,4,5,6]">
            <p-skeleton height="5.3rem"></p-skeleton>
          </p-card>
        </section>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 18px;
      }

      .hero {
        align-items: center;
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr auto;
        padding: 1.2rem;
      }

      .eyebrow {
        color: #2d5db4;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        margin: 0 0 0.35rem;
        text-transform: uppercase;
      }

      .hero-actions {
        display: flex;
        gap: 10px;
      }

      .kpi-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .kpi .kpi-top {
        align-items: center;
        color: #4e6088;
        display: flex;
        justify-content: space-between;
      }

      .kpi h3 {
        font-size: 1.55rem;
        margin: 0.45rem 0 0.2rem;
      }

      .kpi i {
        color: #2f6ff4;
      }

      .insights {
        display: grid;
        gap: 12px;
        grid-template-columns: 1.2fr 1fr;
      }

      .panel-head {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.6rem;
      }

      .panel-head h3 {
        margin: 0;
      }

      .legend-row {
        color: #4e6088;
        display: grid;
        gap: 6px;
        grid-template-columns: repeat(3, minmax(110px, 1fr));
        margin-top: 0.8rem;
      }

      .event-row {
        align-items: center;
        border-bottom: 1px solid #e6ecf8;
        display: flex;
        justify-content: space-between;
        padding: 0.65rem 0;
      }

      .event-row:last-child {
        border-bottom: none;
      }

      .event-row p {
        font-weight: 600;
        margin: 0;
      }

      .event-row small {
        color: #64789f;
      }

      .event-meta {
        align-items: flex-end;
        display: grid;
        gap: 4px;
        justify-items: end;
      }

      .state-content {
        align-items: center;
        display: flex;
        gap: 12px;
      }

      .state-content i {
        color: #b3261e;
        font-size: 1.2rem;
      }

      @media (max-width: 960px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .hero-actions {
          flex-wrap: wrap;
        }

        .insights {
          grid-template-columns: 1fr;
        }

        .legend-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardHomeComponent {
  loading = false;
  errorMessage = '';

  events: EventItem[] = [];
  reservations: ReservationItem[] = [];
  occupancyRows: OccupancyItem[] = [];

  kpiCards: { label: string; value: string; hint: string; icon: string }[] = [];
  revenueLeaders: { name: string; revenue: number; occupancy: number; status: string }[] = [];

  soldTickets = 0;
  availableSeats = 0;
  lostSeats = 0;
  occupancyAverage = 0;

  constructor(private readonly apiClient: ApiClientService) {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin([this.apiClient.getEvents(), this.apiClient.getOccupancy(), this.apiClient.getReservations()]).subscribe({
      next: ([eventsRes, occupancyRes, reservationsRes]) => {
        this.events = eventsRes.items;
        this.occupancyRows = occupancyRes.items;
        this.reservations = reservationsRes.items;
        this.buildMetrics();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar el panel ejecutivo. Verifica conexion con API.';
        this.loading = false;
      },
    });
  }

  private buildMetrics(): void {
    const activeEvents = this.events.filter((x) => x.status === 'Active').length;
    const completedEvents = this.events.filter((x) => x.status === 'Completed').length;

    const pendingReservations = this.reservations.filter((x) => x.status === 'Pending').length;
    this.soldTickets = this.reservations.filter((x) => x.status === 'Confirmed').reduce((acc, x) => acc + x.quantity, 0);

    const byEvent = new Map(this.events.map((e) => [e.id, e]));
    const totalRevenue = this.occupancyRows.reduce((sum, row) => {
      const event = byEvent.get(row.eventId);
      return sum + (event?.price ?? 0) * row.capacityConsumed;
    }, 0);

    const totalCapacity = this.occupancyRows.reduce((sum, row) => sum + row.capacityTotal, 0);
    const totalConsumed = this.occupancyRows.reduce((sum, row) => sum + row.capacityConsumed, 0);
    this.availableSeats = Math.max(totalCapacity - totalConsumed, 0);
    this.lostSeats = this.reservations.filter((x) => x.isLost).reduce((acc, x) => acc + x.quantity, 0);
    this.occupancyAverage = this.occupancyRows.length
      ? this.occupancyRows.reduce((sum, row) => sum + row.occupancyPercentage, 0) / this.occupancyRows.length
      : 0;

    this.kpiCards = [
      { label: 'Eventos Activos', value: String(activeEvents), hint: 'Programados o en venta', icon: 'pi pi-calendar-plus' },
      { label: 'Eventos Completados', value: String(completedEvents), hint: 'Concluidos en plataforma', icon: 'pi pi-check-circle' },
      { label: 'Reservas Pendientes', value: String(pendingReservations), hint: 'Esperando confirmacion de pago', icon: 'pi pi-clock' },
      { label: 'Entradas Vendidas', value: String(this.soldTickets), hint: 'Reservas confirmadas', icon: 'pi pi-ticket' },
      { label: 'Ingresos Totales', value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue), hint: 'Ingresos acumulados', icon: 'pi pi-dollar' },
      { label: 'Ocupacion Promedio', value: `${this.occupancyAverage.toFixed(1)}%`, hint: 'Uso medio de capacidad', icon: 'pi pi-chart-line' },
    ];

    this.revenueLeaders = this.occupancyRows
      .map((row) => {
        const event = byEvent.get(row.eventId);
        return {
          name: row.eventName,
          occupancy: row.occupancyPercentage,
          revenue: (event?.price ?? 0) * row.capacityConsumed,
          status: event?.status ?? 'Desconocido',
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  eventStatusLabel(status: string): string {
    if (status === 'Active') return 'Activo';
    if (status === 'Completed') return 'Completado';
    if (status === 'Cancelled') return 'Cancelado';
    return status;
  }
}
