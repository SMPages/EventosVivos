export interface EventItem {
  id: number;
  name: string;
  description: string;
  eventType: 'Conference' | 'Workshop' | 'Concert' | string;
  venueId: number;
  startAt: string;
  endAt: string;
  price: number;
  capacity: number;
  status: 'Active' | 'Completed' | 'Cancelled' | string;
}

export interface ReservationItem {
  id: number;
  eventId: number;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | string;
  reservationCode: string;
  createdAt: string;
  cancelledAt: string | null;
  isLost: boolean;
}

export interface OccupancyItem {
  eventId: number;
  eventName: string;
  venueId: number;
  venueName: string;
  eventStatus: 'Active' | 'Completed' | 'Cancelled' | string;
  capacityTotal: number;
  capacityConsumed: number;
  confirmedTicketsSold: number;
  availableSeats: number;
  occupancyPercentage: number;
  totalRevenue: number;
  includesLostReservations: boolean;
}
