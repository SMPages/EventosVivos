import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiClientService } from '../../services/api-client.service';
import { EventItem, OccupancyItem } from '../../models/ui-models';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    SelectModule,
    TagModule,
  ],
  template: `
    <section class="page">
      <header>
        <h2 class="section-title">Modulo de Reservas</h2>
        <p class="subtle-text">Orquesta la venta de entradas con control de capacidad disponible en tiempo real.</p>
      </header>

      <section class="layout-grid">
        <p-card styleClass="surface-card event-summary" *ngIf="selectedEvent; else noEventTpl">
          <div class="summary-top">
            <h3>{{ selectedEvent.name }}</h3>
            <p-tag [value]="eventStatusLabel(selectedEvent.status)" [severity]="selectedEvent.status === 'Active' ? 'success' : 'info'"></p-tag>
          </div>
          <p class="subtle-text">{{ selectedEvent.startAt | date: 'medium' }} · Recinto {{ selectedEvent.venueId }}</p>
          <div class="summary-stats">
            <div>
              <small>Capacidad Total</small>
              <strong>{{ selectedEvent.capacity }}</strong>
            </div>
            <div>
              <small>Disponibles</small>
              <strong>{{ selectedAvailableSeats }}</strong>
            </div>
            <div>
              <small>Precio Unitario</small>
              <strong>{{ selectedEvent.price | currency: 'USD' }}</strong>
            </div>
          </div>
          <div class="capacity-block">
            <div class="capacity-labels">
              <span>Ocupacion</span>
              <strong>{{ selectedOccupancy | number: '1.0-0' }}%</strong>
            </div>
            <p-progressBar [value]="selectedOccupancy"></p-progressBar>
          </div>
          <p-message *ngIf="capacityWarning" severity="warn" [text]="capacityWarning"></p-message>
        </p-card>

        <ng-template #noEventTpl>
          <p-card styleClass="surface-card event-summary empty-summary">
            <h3>Selecciona un evento</h3>
            <p class="subtle-text">Al elegir ID de evento veras disponibilidad, ocupacion y potencial de ingresos antes de reservar.</p>
          </p-card>
        </ng-template>

        <p-card styleClass="surface-card">
        <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
          <div class="field-wrap">
            <label for="eventId">ID del evento</label>
            <p-select
              id="eventId"
              [options]="eventOptions"
              optionLabel="label"
              optionValue="value"
              formControlName="eventId"
              placeholder="Selecciona evento"
              (onChange)="onEventSelected()"
            ></p-select>
            <small class="field-error" *ngIf="form.controls.eventId.invalid && form.controls.eventId.touched">Requerido y mayor a 0</small>
          </div>

          <div class="field-wrap">
            <label for="buyerName">Nombre del comprador</label>
            <input id="buyerName" pInputText formControlName="buyerName" />
            <small class="field-error" *ngIf="form.controls.buyerName.invalid && form.controls.buyerName.touched">El nombre es obligatorio</small>
          </div>

          <div class="field-wrap">
            <label for="buyerEmail">Correo del comprador</label>
            <input id="buyerEmail" pInputText formControlName="buyerEmail" />
            <small class="field-error" *ngIf="form.controls.buyerEmail.hasError('required')">El correo es obligatorio</small>
            <small class="field-error" *ngIf="form.controls.buyerEmail.hasError('email')">Formato de correo invalido</small>
          </div>

          <div class="field-wrap">
            <label for="quantity">Cantidad</label>
            <input id="quantity" pInputText type="number" formControlName="quantity" />
            <small class="field-error" *ngIf="form.controls.quantity.invalid && form.controls.quantity.touched">Cantidad minima: 1</small>
            <small class="field-error" *ngIf="capacityExceeded">La cantidad supera los asientos disponibles para este evento.</small>
          </div>

          <div class="form-actions">
            <button pButton type="button" label="Limpiar" severity="secondary" [outlined]="true" (click)="reset()"></button>
            <button pButton type="submit" label="Crear reserva" icon="pi pi-save" [loading]="saving" [disabled]="capacityExceeded"></button>
          </div>
        </form>
      </p-card>
      </section>

      <section class="loading" *ngIf="saving">
        <p-progressSpinner ariaLabel="loading"></p-progressSpinner>
      </section>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 16px;
      }

      .layout-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: 1fr 1.2fr;
      }

      .event-summary {
        align-content: start;
        display: grid;
        gap: 10px;
      }

      .summary-top {
        align-items: start;
        display: flex;
        justify-content: space-between;
      }

      .summary-top h3 {
        margin: 0;
      }

      .summary-stats {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, minmax(90px, 1fr));
      }

      .summary-stats small {
        color: #60749b;
        display: block;
      }

      .summary-stats strong {
        display: block;
        font-size: 1rem;
      }

      .capacity-block {
        display: grid;
        gap: 6px;
      }

      .capacity-labels {
        display: flex;
        justify-content: space-between;
      }

      .empty-summary {
        align-content: center;
        min-height: 210px;
      }

      .form-grid {
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
        font-size: 0.86rem;
        font-weight: 600;
      }

      .field-error {
        color: #b3261e;
        font-size: 0.76rem;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        grid-column: 1 / -1;
        justify-content: flex-end;
      }

      .loading {
        display: grid;
        justify-content: center;
      }

      @media (max-width: 960px) {
        .layout-grid {
          grid-template-columns: 1fr;
        }

        .summary-stats {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ReservationFormComponent {
  readonly form = new FormGroup({
    eventId: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    buyerName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    buyerEmail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    quantity: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  saving = false;
  events: EventItem[] = [];
  occupancyMap = new Map<number, OccupancyItem>();
  selectedEvent: EventItem | null = null;
  selectedOccupancy = 0;
  selectedAvailableSeats = 0;
  capacityWarning = '';

  get eventOptions(): Array<{ label: string; value: number }> {
    return this.events.map((event) => ({ label: `${event.id} · ${event.name}`, value: event.id }));
  }

  get capacityExceeded(): boolean {
    if (!this.selectedEvent) return false;
    return this.form.controls.quantity.value > this.selectedAvailableSeats;
  }

  eventStatusLabel(status: string): string {
    if (status === 'Active') return 'Activo';
    if (status === 'Completed') return 'Completado';
    if (status === 'Cancelled') return 'Cancelado';
    return status;
  }

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {
    this.loadCatalog();
  }

  onEventSelected(): void {
    const eventId = this.form.controls.eventId.value;
    this.selectedEvent = this.events.find((x) => x.id === eventId) ?? null;

    if (!this.selectedEvent) {
      this.selectedOccupancy = 0;
      this.selectedAvailableSeats = 0;
      this.capacityWarning = '';
      return;
    }

    const occupancy = this.occupancyMap.get(this.selectedEvent.id);
    this.selectedOccupancy = occupancy?.occupancyPercentage ?? 0;
    const consumed = occupancy?.capacityConsumed ?? 0;
    this.selectedAvailableSeats = Math.max(this.selectedEvent.capacity - consumed, 0);
    this.capacityWarning = this.selectedAvailableSeats === 0 ? 'Este evento no tiene capacidad disponible.' : '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.capacityExceeded) {
      this.form.controls.quantity.markAsTouched();
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar reserva',
      message: 'Se creara una nueva reserva con los datos diligenciados. Deseas continuar?',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Crear',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.saving = true;
        const value = this.form.getRawValue();
        this.apiClient
          .createReservation({
            eventId: value.eventId,
            buyerName: value.buyerName,
            buyerEmail: value.buyerEmail,
            quantity: value.quantity,
          })
          .subscribe({
            next: (reservation) => {
              this.messageService.add({ severity: 'success', summary: 'Reserva creada', detail: `Codigo ${reservation.reservationCode}` });
              this.saving = false;
              this.reset();
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No fue posible crear la reserva' });
              this.saving = false;
            },
          });
      },
    });
  }

  reset(): void {
    this.form.reset({ eventId: 0, buyerName: '', buyerEmail: '', quantity: 1 });
    this.selectedEvent = null;
    this.selectedOccupancy = 0;
    this.selectedAvailableSeats = 0;
    this.capacityWarning = '';
  }

  private loadCatalog(): void {
    forkJoin([this.apiClient.getEvents(), this.apiClient.getOccupancy()]).subscribe({
      next: ([eventsRes, occupancyRes]) => {
        this.events = eventsRes.items;
        this.occupancyMap = new Map(occupancyRes.items.map((item) => [item.eventId, item]));
        this.onEventSelected();
      },
      error: () => {
        this.messageService.add({ severity: 'warn', summary: 'Catalogo parcial', detail: 'No se pudo cargar la vista de capacidad.' });
      },
    });
  }
}
