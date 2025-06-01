import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Reservation,
  ReservationLog,
} from './interfaces/reservation.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConcertsService } from '../concerts/concerts.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationsService {
  private readonly activeReservations: Reservation[] = [];
  private readonly reservationLogs: ReservationLog[] = [];
  constructor(private readonly concertsService: ConcertsService) {}

  create(createReservationDto: CreateReservationDto): Reservation {
    const { concertId, userId } = createReservationDto;
    const concert = this.concertsService.findOne(concertId);

    if (concert.seat <= 0) {
      throw new ConflictException(
        `Concert with ID "${concertId}" has no available seats.`,
      );
    }

    this.concertsService.decreaseSeats(concertId);

    const existingReservation = this.activeReservations.find(
      (r) => r.concertId === concertId && r.userId === userId,
    );
    if (existingReservation) {
      throw new ConflictException(
        `User "${userId}" has already reserved a seat for concert "${concertId}".`,
      );
    }

    const newReservation: Reservation = {
      id: uuidv4(),
      concertId,
      userId,
      createdAt: new Date(),
    };

    this.reservationLogs.unshift({
      id: uuidv4(),
      userId,
      userName: userId,
      concertId,
      concertName: concert.name,
      action: 'reserved',
      timestamp: newReservation.createdAt,
    });

    this.activeReservations.push(newReservation);

    return newReservation;
  }

  getActiveReservationsForUser(userId: string): Reservation[] {
    return this.activeReservations.filter((r) => r.userId === userId);
  }

  getAllReservations(): Reservation[] {
    return this.activeReservations;
  }

  getCancelledReservations(): number {
    return this.reservationLogs.filter((r) => r.action === 'cancelled').length;
  }

  cancelReservation(reservationId: string, userId: string) {
    const reservationIndex = this.activeReservations.findIndex(
      (r) => r.id === reservationId && r.userId === userId,
    );

    if (reservationIndex === -1) {
      throw new NotFoundException(
        `Active reservation with ID "${reservationId}" not found for this user.`,
      );
    }

    const reservationToCancel = this.activeReservations[reservationIndex];
    const concert = this.concertsService.findOne(reservationToCancel.concertId);

    this.concertsService.increaseSeats(reservationToCancel.concertId);
    this.activeReservations.splice(reservationIndex, 1);

    this.reservationLogs.unshift({
      id: uuidv4(),
      userId: reservationToCancel.userId,
      userName: reservationToCancel.userId,
      concertId: reservationToCancel.concertId,
      concertName: concert.name,
      action: 'cancelled',
      timestamp: new Date(),
    });

    return { message: 'Reservation successfully cancelled.' };
  }

  getReservationLogs() {
    return this.reservationLogs.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }
}
