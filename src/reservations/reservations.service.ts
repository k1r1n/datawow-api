import { ConflictException, Injectable } from '@nestjs/common';
import {
  Reservation,
  ReservationLog,
} from './interfaces/reservation.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConcertsService } from 'src/concerts/concerts.service';
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
}
