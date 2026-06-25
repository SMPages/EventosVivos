import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiClientService } from '../../services/api-client.service';
import { ReservationItem } from '../../models/ui-models';

@Component({
  selector: 'app-reservation-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
  ],
  template: `
    <section class="page">
      <header>
        <h2 class="section-title">Historial de Ciclo de Vida</h2>
        <p class="subtle-text">Audita la evolucion de reservas desde pendiente hasta confirmada, cancelada o perdida.</p>
      </header>

      <p-card styleClass="surface-card">
        <form [formGroup]="filters" class="filters" (ngSubmit)="load()">
          <div class="field-wrap">
            <label for="buyerEmail">Correo del comprador</label>
            <input id="buyerEmail" pInputText formControlName="buyerEmail" />
            <small class="field-error" *ngIf="filters.controls.buyerEmail.invalid && filters.controls.buyerEmail.touched">Ingresa un correo valido</small>
          </div>

          <p-select [options]="statusOptions" optionLabel="label" optionValue="value" formControlName="status" placeholder="Estado"></p-select>

          <button pButton type="submit" label="Buscar" icon="pi pi-search" [loading]="loading"></button>
        </form>
      </p-card>

      <section class="stat-grid" *ngIf="!loading && rows.length > 0">
        <p-card styleClass="surface-card stat-card">
          <small>Reservas Totales</small>
          <h3>{{ rows.length }}</h3>
        </p-card>
        <p-card styleClass="surface-card stat-card">
          <small>Pendientes de pago</small>
          <h3>{{ pendingCount }}</h3>
        </p-card>
        <p-card styleClass="surface-card stat-card">
          <small>Confirmadas</small>
          <h3>{{ confirmedCount }}</h3>
        </p-card>
        <p-card styleClass="surface-card stat-card">
          <small>Perdidas</small>
          <h3>{{ lostCount }}</h3>
        </p-card>
      </section>

      <section class="loading" *ngIf="loading">
        <p-progressSpinner ariaLabel="loading"></p-progressSpinner>
      </section>

      <p-card styleClass="surface-card state error" *ngIf="!loading && errorMessage">
        <div class="state-content"><i class="pi pi-exclamation-triangle"></i><p>{{ errorMessage }}</p></div>
      </p-card>

      <p-card styleClass="surface-card state empty" *ngIf="!loading && !errorMessage && rows.length === 0">
        <div class="state-content"><i class="pi pi-inbox"></i><p>No hay reservas para los criterios seleccionados.</p></div>
      </p-card>

      <p-card styleClass="surface-card" *ngIf="!loading && rows.length > 0">
        <p-table [value]="rows" [paginator]="true" [rows]="8" [rowsPerPageOptions]="[8,16,24]" responsiveLayout="scroll" dataKey="reservationCode">
          <ng-template pTemplate="header">
            <tr>
              <th>Codigo</th>
              <th>Comprador</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Ciclo de Vida</th>
              <th>Creada</th>
              <th>Accion</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.reservationCode }}</td>
              <td>{{ row.buyerName }}<br /><small>{{ row.buyerEmail }}</small></td>
              <td>{{ row.quantity }}</td>
              <td>
                <p-tag [value]="statusLabel(row)" [severity]="statusSeverity(row)"></p-tag>
              </td>
              <td>
                <span class="life-step" [class.life-confirmed]="row.status === 'Confirmed'" [class.life-lost]="row.isLost" [class.life-cancelled]="row.status === 'Cancelled'">
                  {{ lifecycleText(row) }}
                </span>
              </td>
              <td>{{ row.createdAt | date: 'short' }}</td>
              <td>
                <button
                  pButton
                  type="button"
                  size="small"
                  severity="danger"
                  [outlined]="true"
                  label="Cancelar"
                  [disabled]="row.status !== 'Confirmed'"
                  (click)="cancelReservation(row.id, row.reservationCode)">
                </button>
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

      .filters {
        align-items: center;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .stat-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .stat-card small {
        color: #60749b;
      }

      .stat-card h3 {
        margin: 0.35rem 0 0;
      }

      .field-wrap {
        display: grid;
        gap: 6px;
      }

      .field-wrap label {
        color: #41516f;
        font-size: 0.86rem;
        font-weight: 600;
      }

      .field-error {
        color: #b3261e;
        font-size: 0.76rem;
      }

      .table {
        width: 100%;
      }

      .state-content {
        align-items: center;
        display: flex;
        gap: 10px;
      }

      .state-content i {
        color: #335ea8;
      }

      .loading {
        display: grid;
        justify-content: center;
      }

      .life-step {
        background: #fff4cc;
        border-radius: 999px;
        color: #946200;
        display: inline-flex;
        font-size: 0.76rem;
        padding: 0.2rem 0.55rem;
      }

      .life-step.life-confirmed {
        background: #dbf5e5;
        color: #14663a;
      }

      .life-step.life-cancelled {
        background: #ffe0e0;
        color: #8f1e1e;
      }

      .life-step.life-lost {
        background: #f2e2ff;
        color: #6a2b8e;
      }
    `,
  ],
})
export class ReservationHistoryComponent {
  readonly filters = new FormGroup({
    buyerEmail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    status: new FormControl('', { nonNullable: true }),
  });

  readonly statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'Pending' },
    { label: 'Confirmada', value: 'Confirmed' },
    { label: 'Cancelada', value: 'Cancelled' },
  ];

  rows: ReservationItem[] = [];
  loading = false;
  errorMessage = '';

  pendingCount = 0;
  confirmedCount = 0;
  lostCount = 0;

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly messageService: MessageService,
  ) {}

  load(): void {
    if (this.filters.controls.buyerEmail.invalid) {
      this.filters.controls.buyerEmail.markAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const form = this.filters.getRawValue();
    this.apiClient.getReservationsByBuyer(form.buyerEmail, form.status || undefined).subscribe({
      next: (response) => {
        this.rows = response.items;
        this.pendingCount = this.rows.filter((x) => x.status === 'Pending').length;
        this.confirmedCount = this.rows.filter((x) => x.status === 'Confirmed').length;
        this.lostCount = this.rows.filter((x) => x.isLost).length;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo recuperar el historial de reservas.';
        this.loading = false;
      },
    });
  }

  statusLabel(row: ReservationItem): string {
    if (row.isLost) {
      return 'Perdida';
    }
    if (row.status === 'Pending') {
      return 'Pendiente de pago';
    }
    if (row.status === 'Confirmed') {
      return 'Confirmada';
    }
    if (row.status === 'Cancelled') {
      return 'Cancelada';
    }
    return row.status;
  }

  statusSeverity(row: ReservationItem): 'success' | 'info' | 'danger' | 'warn' | 'secondary' | 'contrast' {
    if (row.isLost) return 'contrast';
    if (row.status === 'Pending') return 'warn';
    if (row.status === 'Confirmed') return 'success';
    if (row.status === 'Cancelled') return 'danger';
    return 'secondary';
  }

  lifecycleText(row: ReservationItem): string {
    if (row.isLost) return 'Perdida por timeout';
    if (row.status === 'Confirmed') return 'Pagada y emitida';
    if (row.status === 'Cancelled') return 'Cancelada por politica';
    return 'En espera de pago';
  }

  cancelReservation(reservationId: number, reservationCode: string): void {
    this.apiClient.cancelReservation({ reservationId, reservationCode }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Reserva cancelada', detail: 'La reserva fue cancelada correctamente' });
        this.load();
      },
      error: (error) => {
        const detail = error?.error?.detail || 'No fue posible cancelar la reserva';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      },
    });
  }
}
