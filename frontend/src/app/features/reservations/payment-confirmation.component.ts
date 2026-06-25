import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiClientService } from '../../services/api-client.service';
import { ReservationItem } from '../../models/ui-models';

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    TagModule,
  ],
  template: `
    <section class="page">
      <header>
        <h2 class="section-title">Centro de Confirmacion de Pagos</h2>
        <p class="subtle-text">Valida reservas pendientes, confirma transacciones y cierra el ciclo de venta de entradas.</p>
      </header>

      <section class="layout-grid">
      <p-card styleClass="surface-card workflow-card">
        <h3>Flujo de trabajo</h3>
        <div class="workflow-step" [class.done]="reservation !== null">
          <span>1</span>
          <p>Buscar reserva por identificador</p>
        </div>
        <div class="workflow-step" [class.done]="reservation?.status === 'Confirmed'">
          <span>2</span>
          <p>Validar codigo de reserva y referencia</p>
        </div>
        <div class="workflow-step" [class.done]="paymentConfirmed">
          <span>3</span>
          <p>Confirmar pago y registrar trazabilidad</p>
        </div>

        <div class="workflow-meter" *ngIf="reservation">
          <div class="meter-labels">
            <span>Completado</span>
            <strong>{{ paymentConfirmed ? 100 : 66 }}%</strong>
          </div>
          <p-progressBar [value]="paymentConfirmed ? 100 : 66"></p-progressBar>
        </div>
      </p-card>

      <p-card styleClass="surface-card">
        <form [formGroup]="form" class="form-grid" (ngSubmit)="search()">
          <div class="field-wrap">
            <label for="reservationId">ID de reserva</label>
            <input id="reservationId" pInputText type="number" formControlName="reservationId" />
            <small class="field-error" *ngIf="form.controls.reservationId.invalid && form.controls.reservationId.touched">ID valido requerido</small>
          </div>

          <div class="field-wrap">
            <label for="reservationCode">Codigo de reserva</label>
            <input id="reservationCode" pInputText formControlName="reservationCode" />
          </div>

          <div class="field-wrap">
            <label for="reference">Referencia</label>
            <input id="reference" pInputText formControlName="reference" />
          </div>

          <div class="actions">
            <button pButton type="submit" label="Buscar" icon="pi pi-search" [loading]="searching"></button>
            <button pButton type="button" label="Confirmar pago" icon="pi pi-check" [disabled]="!reservation || searching || reservation.status === 'Confirmed'" (click)="confirmPayment()"></button>
          </div>
        </form>
      </p-card>
      </section>

      <section class="loading" *ngIf="searching">
        <p-progressSpinner ariaLabel="loading"></p-progressSpinner>
      </section>

      <p-card styleClass="surface-card result-card" *ngIf="reservation">
        <h3>Resumen de Reserva</h3>
        <div class="result-grid">
          <div>
            <small>Codigo</small>
            <p>{{ reservation.reservationCode }}</p>
          </div>
          <div>
            <small>Comprador</small>
            <p>{{ reservation.buyerName }}</p>
          </div>
          <div>
            <small>Email</small>
            <p>{{ reservation.buyerEmail }}</p>
          </div>
          <div>
            <small>Entradas</small>
            <p>{{ reservation.quantity }}</p>
          </div>
        </div>
        <div class="status-row">
          <span>Estado actual</span>
          <p-tag [value]="reservationStatusLabel(reservation.status)" [severity]="reservation.status === 'Confirmed' ? 'success' : 'warn'"></p-tag>
        </div>
      </p-card>

      <p-card styleClass="surface-card success-card" *ngIf="paymentConfirmed">
        <div class="success-wrap">
          <i class="pi pi-check-circle"></i>
          <div>
            <h3>Pago confirmado exitosamente</h3>
            <p class="subtle-text">La reserva ya forma parte del revenue confirmado y del inventario vendido.</p>
          </div>
        </div>
      </p-card>

      <p-card styleClass="surface-card error-card" *ngIf="errorMessage">
        <div class="error-content">
          <i class="pi pi-exclamation-triangle"></i>
          <p>{{ errorMessage }}</p>
        </div>
      </p-card>
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
        grid-template-columns: 0.9fr 1.3fr;
      }

      .workflow-card {
        display: grid;
        gap: 10px;
      }

      .workflow-card h3 {
        margin: 0;
      }

      .workflow-step {
        align-items: center;
        border: 1px solid #dce6f8;
        border-radius: 12px;
        display: flex;
        gap: 8px;
        padding: 0.55rem 0.7rem;
      }

      .workflow-step span {
        align-items: center;
        background: #e9f1ff;
        border-radius: 50%;
        color: #235fd4;
        display: inline-flex;
        font-size: 0.8rem;
        font-weight: 700;
        height: 1.35rem;
        justify-content: center;
        width: 1.35rem;
      }

      .workflow-step p {
        margin: 0;
      }

      .workflow-step.done {
        border-color: #9ed8b4;
      }

      .workflow-meter {
        display: grid;
        gap: 6px;
      }

      .meter-labels {
        display: flex;
        justify-content: space-between;
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

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        grid-column: 1 / -1;
      }

      .loading {
        display: grid;
        justify-content: center;
      }

      .result-card p {
        margin: 6px 0;
      }

      .result-grid {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }

      .result-grid small {
        color: #60749b;
        display: block;
      }

      .result-grid p {
        font-weight: 600;
        margin: 0.25rem 0 0;
      }

      .status-row {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-top: 0.8rem;
      }

      .success-card {
        border: 1px solid #abdfbe;
      }

      .success-wrap {
        align-items: center;
        display: flex;
        gap: 10px;
      }

      .success-wrap i {
        color: #148a3f;
        font-size: 1.6rem;
      }

      .error-content {
        align-items: center;
        display: flex;
        gap: 10px;
      }

      .error-content i {
        color: #b3261e;
      }

      @media (max-width: 960px) {
        .layout-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PaymentConfirmationComponent {
  readonly form = new FormGroup({
    reservationId: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    reservationCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    reference: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  reservation: ReservationItem | null = null;
  searching = false;
  errorMessage = '';
  paymentConfirmed = false;

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {}

  search(): void {
    if (this.form.controls.reservationId.invalid) {
      this.form.controls.reservationId.markAsTouched();
      return;
    }

    this.searching = true;
    this.errorMessage = '';
    this.reservation = null;
    this.paymentConfirmed = false;

    this.apiClient.getReservationById(this.form.controls.reservationId.value).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        if (!this.form.controls.reservationCode.value) {
          this.form.controls.reservationCode.setValue(reservation.reservationCode);
        }
        this.searching = false;
      },
      error: () => {
        this.errorMessage = 'No se encontro la reserva solicitada.';
        this.searching = false;
      },
    });
  }

  confirmPayment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar pago',
      message: 'Esta accion cambiara el estado de la reserva a Confirmada. Continuar?',
      icon: 'pi pi-credit-card',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const value = this.form.getRawValue();
        this.searching = true;
        this.apiClient
          .confirmPayment({
            reservationId: value.reservationId,
            reservationCode: value.reservationCode,
            reference: value.reference,
          })
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Pago confirmado', detail: 'El estado fue actualizado correctamente' });
              if (this.reservation) {
                this.reservation = { ...this.reservation, status: 'Confirmed' };
              }
              this.paymentConfirmed = true;
              this.searching = false;
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No fue posible confirmar el pago' });
              this.searching = false;
            },
          });
      },
    });
  }

  reservationStatusLabel(status: string): string {
    if (status === 'Pending') return 'Pendiente';
    if (status === 'Confirmed') return 'Confirmada';
    if (status === 'Cancelled') return 'Cancelada';
    return status;
  }
}
