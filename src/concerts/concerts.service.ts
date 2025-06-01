import { Injectable, NotFoundException } from '@nestjs/common';
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

  findOne(id: string): Concert {
    const concert = this.concerts.find((c) => c.id === id);

    if (!concert) {
      throw new NotFoundException(`Concert with ID "${id}" not found`);
    }
    return concert;
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

  remove(id: string): { success: boolean; message: string } {
    const concertIndex = this.concerts.findIndex((c) => c.id === id);

    if (concertIndex === -1) {
      throw new NotFoundException(`Concert with ID "${id}" not found`);
    }
    this.concerts.splice(concertIndex, 1);

    return {
      success: true,
      message: `Concert with ID "${id}" successfully deleted`,
    };
  }

  decreaseSeats(id: string): void {
    const concert = this.findOne(id);
    concert.seat--;
  }

  increaseSeats(id: string): void {
    const concert = this.findOne(id);
    concert.seat++;
  }
}
