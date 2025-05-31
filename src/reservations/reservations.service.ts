import { ConflictException, Injectable } from '@nestjs/common';
import { Reservation } from './interfaces/reservation.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConcertsService } from 'src/concerts/concerts.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationsService {
  private readonly reservations: Reservation[] = [];
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

    const existingReservation = this.reservations.find(
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
      reservedAt: new Date(),
    };

    this.reservations.push(newReservation);

    return newReservation;
  }
}
