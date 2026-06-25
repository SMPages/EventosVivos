import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventItem, OccupancyItem, ReservationItem } from '../models/ui-models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getEvents(params?: { venueId?: number; from?: string; to?: string; status?: string; eventType?: string; search?: string }) {
    const search = new URLSearchParams();
    if (params?.venueId) search.set('venueId', String(params.venueId));
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    if (params?.status) search.set('status', params.status);
    if (params?.eventType) search.set('eventType', params.eventType);
    if (params?.search) search.set('search', params.search);

    const suffix = search.toString() ? `?${search.toString()}` : '';
    return this.http.get<{ items: EventItem[] }>(`${this.baseUrl}/events${suffix}`);
  }

  createEvent(payload: {
    name: string;
    description: string;
    venueId: number;
    capacity: number;
    startAt: string;
    endAt: string;
    price: number;
    eventType: 'Conference' | 'Workshop' | 'Concert';
  }) {
    return this.http.post<EventItem>(`${this.baseUrl}/events`, payload);
  }

  getOccupancy(params?: { venueId?: number; from?: string; to?: string }) {
    const search = new URLSearchParams();
    if (params?.venueId) search.set('venueId', String(params.venueId));
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);

    const suffix = search.toString() ? `?${search.toString()}` : '';
    return this.http.get<{ items: OccupancyItem[] }>(`${this.baseUrl}/occupancy${suffix}`);
  }

  createReservation(payload: {
    eventId: number;
    buyerName: string;
    buyerEmail: string;
    quantity: number;
  }) {
    return this.http.post<ReservationItem>(`${this.baseUrl}/reservations`, payload);
  }

  getReservationById(id: number) {
    return this.http.get<ReservationItem>(`${this.baseUrl}/reservations/${id}`);
  }

  getReservationByCode(reservationCode: string) {
    return this.http.get<ReservationItem>(`${this.baseUrl}/reservations/by-code/${encodeURIComponent(reservationCode)}`);
  }

  getReservations(params?: { buyerEmail?: string; status?: string }) {
    const search = new URLSearchParams();
    if (params?.buyerEmail) search.set('buyerEmail', params.buyerEmail);
    if (params?.status) search.set('status', params.status);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return this.http.get<{ items: ReservationItem[] }>(`${this.baseUrl}/reservations${suffix}`);
  }

  getReservationsByBuyer(buyerEmail: string, status?: string) {
    const search = new URLSearchParams({ buyerEmail });
    if (status) search.set('status', status);
    return this.http.get<{ items: ReservationItem[] }>(`${this.baseUrl}/reservations/by-buyer?${search.toString()}`);
  }

  confirmPayment(payload: { reservationCode: string }) {
    return this.http.post<{ reservationId: number; reservationCode: string; paymentReference: string; status: string; confirmedAt: string }>(
      `${this.baseUrl}/payments/confirm`,
      payload,
    );
  }

  cancelReservation(payload: { reservationId: number; reservationCode: string }) {
    return this.http.post<ReservationItem>(`${this.baseUrl}/reservations/${payload.reservationId}/cancel`, {
      reservationCode: payload.reservationCode,
    });
  }
}
