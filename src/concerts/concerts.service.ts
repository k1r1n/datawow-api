import { Injectable } from '@nestjs/common';
import { Concert } from './interfaces/concert.interface';
import { CreateConcertDto } from './dto/create-concert.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConcertsService {
  private readonly concerts: Concert[] = [];

  create(createConcertDto: CreateConcertDto): Concert {
    const newConcert: Concert = {
      id: uuidv4(),
      ...createConcertDto,
      seatsAvailable: createConcertDto.seatTotal,
    };
    this.concerts.push(newConcert);
    return newConcert;
  }

  findAll(): Concert[] {
    return this.concerts;
  }
}
