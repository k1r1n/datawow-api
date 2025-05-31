export interface Concert {
  id: string;
  name: string;
  description: string;
  seat: number;
}

export interface ConcertResponse {
  data: {
    list: Concert[];
    totalSeats: number;
  };
  success: boolean;
}
