import { Injectable } from '@nestjs/common';
import { Concert, ConcertResponse } from './interfaces/concert.interface';
import { CreateConcertDto } from './dto/create-concert.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConcertsService {
  private readonly concerts: Concert[] = [];

  create(createConcertDto: CreateConcertDto): ConcertResponse {
    const newConcert: Concert = {
      id: uuidv4(),
      ...createConcertDto,
      seat: createConcertDto.seat,
    };
    this.concerts.push(newConcert);

    return {
      data: {
        list: this.concerts,
        totalSeats: this.concerts.reduce(
          (acc, concert) => acc + concert.seat,
          0,
        ),
      },
      success: true,
    };
  }

  findAll(): ConcertResponse {
    return {
      data: {
        list: this.concerts,
        totalSeats: this.concerts.reduce(
          (acc, concert) => acc + concert.seat,
          0,
        ),
      },
      success: true,
    };
  }
}
