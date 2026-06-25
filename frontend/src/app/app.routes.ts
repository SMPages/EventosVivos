import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{
		path: 'dashboard',
		loadComponent: () => import('./features/dashboard/dashboard-home.component').then((m) => m.DashboardHomeComponent),
	},
	{
		path: 'events',
		loadComponent: () => import('./features/events/event-list.component').then((m) => m.EventListComponent),
	},
	{
		path: 'events/new',
		loadComponent: () => import('./features/events/event-create.component').then((m) => m.EventCreateComponent),
	},
	{
		path: 'reservations/new',
		loadComponent: () => import('./features/reservations/reservation-form.component').then((m) => m.ReservationFormComponent),
	},
	{
		path: 'reservations/confirm-payment',
		loadComponent: () => import('./features/reservations/payment-confirmation.component').then((m) => m.PaymentConfirmationComponent),
	},
	{
		path: 'reservations/history',
		loadComponent: () => import('./features/reservations/reservation-history.component').then((m) => m.ReservationHistoryComponent),
	},
	{
		path: 'occupancy',
		loadComponent: () => import('./features/occupancy/occupancy-dashboard.component').then((m) => m.OccupancyDashboardComponent),
	},
];
