import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    DrawerModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  mobileMenuVisible = false;

  readonly navItems: MenuItem[] = [
    { label: 'Tablero', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Eventos', icon: 'pi pi-calendar', routerLink: '/events' },
    { label: 'Crear Evento', icon: 'pi pi-plus-circle', routerLink: '/events/new' },
    { label: 'Crear Reserva', icon: 'pi pi-ticket', routerLink: '/reservations/new' },
    { label: 'Confirmar Pago', icon: 'pi pi-credit-card', routerLink: '/reservations/confirm-payment' },
    { label: 'Historial', icon: 'pi pi-history', routerLink: '/reservations/history' },
    { label: 'Ocupacion', icon: 'pi pi-chart-bar', routerLink: '/occupancy' },
  ];
}
