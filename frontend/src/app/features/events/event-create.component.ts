import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ApiClientService } from '../../services/api-client.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
  ],
  template: `
    <section class="page">
      <header>
        <h2 class="section-title">Crear Evento</h2>
        <p class="subtle-text">Registra eventos con reglas de negocio y validaciones completas.</p>
      </header>

      <p-card styleClass="surface-card">
        <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
          <div class="field-wrap full">
            <label for="name">Titulo</label>
            <input id="name" pInputText formControlName="name" placeholder="Ej: Conferencia de Arquitectura .NET" />
            <small class="field-error" *ngIf="form.controls.name.touched && form.controls.name.invalid">Entre 5 y 100 caracteres.</small>
          </div>

          <div class="field-wrap full">
            <label for="description">Descripcion</label>
            <textarea id="description" pTextarea formControlName="description" rows="4" placeholder="Describe objetivo, publico y agenda del evento"></textarea>
            <small class="field-error" *ngIf="form.controls.description.touched && form.controls.description.invalid">Entre 10 y 500 caracteres.</small>
          </div>

          <div class="field-wrap">
            <label for="eventType">Tipo de evento</label>
            <p-select inputId="eventType" [options]="eventTypes" optionLabel="label" optionValue="value" formControlName="eventType" placeholder="Selecciona tipo"></p-select>
          </div>

          <div class="field-wrap">
            <label for="venueId">Recinto</label>
            <p-select inputId="venueId" [options]="venues" optionLabel="label" optionValue="value" formControlName="venueId" placeholder="Selecciona recinto"></p-select>
          </div>

          <div class="field-wrap">
            <label for="capacity">Capacidad maxima</label>
            <p-inputnumber inputId="capacity" formControlName="capacity" [min]="1" [useGrouping]="false"></p-inputnumber>
          </div>

          <div class="field-wrap">
            <label for="price">Precio de entrada</label>
            <p-inputnumber inputId="price" formControlName="price" mode="decimal" [min]="0.01" [minFractionDigits]="2" [maxFractionDigits]="2"></p-inputnumber>
          </div>

          <div class="field-wrap">
            <label for="startAt">Fecha/hora inicio</label>
            <p-datepicker inputId="startAt" formControlName="startAt" [showTime]="true" hourFormat="24" appendTo="body"></p-datepicker>
          </div>

          <div class="field-wrap">
            <label for="endAt">Fecha/hora fin</label>
            <p-datepicker inputId="endAt" formControlName="endAt" [showTime]="true" hourFormat="24" appendTo="body"></p-datepicker>
          </div>

          <div class="actions full">
            <button pButton type="button" severity="secondary" [outlined]="true" label="Limpiar" (click)="reset()"></button>
            <button pButton type="submit" label="Crear evento" icon="pi pi-save" [loading]="saving"></button>
          </div>
        </form>
      </p-card>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 16px;
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

      .field-wrap.full,
      .actions.full {
        grid-column: 1 / -1;
      }

      .actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .field-error {
        color: #b3261e;
        font-size: 0.76rem;
      }

      :host ::ng-deep .p-select,
      :host ::ng-deep .p-datepicker,
      :host ::ng-deep .p-inputnumber,
      :host ::ng-deep .p-inputnumber input,
      :host ::ng-deep textarea,
      :host ::ng-deep input {
        width: 100%;
      }
    `,
  ],
})
export class EventCreateComponent {
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)] }),
    eventType: new FormControl<'Conference' | 'Workshop' | 'Concert' | null>(null, { validators: [Validators.required] }),
    venueId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    capacity: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    price: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    startAt: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    endAt: new FormControl<Date | null>(null, { validators: [Validators.required] }),
  });

  saving = false;

  readonly eventTypes = [
    { label: 'Conferencia', value: 'Conference' },
    { label: 'Taller', value: 'Workshop' },
    { label: 'Concierto', value: 'Concert' },
  ];

  readonly venues = [
    { label: 'Auditorio Central', value: 1 },
    { label: 'Sala Norte', value: 2 },
    { label: 'Arena Sur', value: 3 },
  ];

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly messageService: MessageService,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.startAt || !value.endAt || !value.eventType || !value.venueId || !value.capacity || !value.price) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.apiClient
      .createEvent({
        name: value.name,
        description: value.description,
        eventType: value.eventType,
        venueId: value.venueId,
        capacity: value.capacity,
        price: value.price,
        startAt: value.startAt.toISOString(),
        endAt: value.endAt.toISOString(),
      })
      .subscribe({
        next: (event) => {
          this.messageService.add({ severity: 'success', summary: 'Evento creado', detail: `${event.name} registrado correctamente` });
          this.saving = false;
          this.reset();
        },
        error: (error) => {
          const message = error?.error?.detail || error?.error?.title || 'No fue posible crear el evento';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
          this.saving = false;
        },
      });
  }

  reset(): void {
    this.form.reset({
      name: '',
      description: '',
      eventType: null,
      venueId: null,
      capacity: null,
      price: null,
      startAt: null,
      endAt: null,
    });
  }
}
