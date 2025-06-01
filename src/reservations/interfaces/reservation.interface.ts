export interface Reservation {
  id: string;
  concertId: string;
  userId: string;
  createdAt: Date;
}

export interface ReservationLog {
  id: string;
  userId: string;
  userName?: string;
  concertId: string;
  concertName: string;
  action: 'reserved' | 'cancelled';
  timestamp: Date;
}

export interface ReservationResponse {
  data: Reservation[];
  success: boolean;
}

export interface ReservationLogResponse {
  data: ReservationLog[];
  success: boolean;
}
