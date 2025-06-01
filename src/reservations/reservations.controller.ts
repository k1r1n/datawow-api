import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponse } from './interfaces/reservation.interface';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get(':userId')
  getActiveReservationsForUser(
    @Param('userId') userId: string,
  ): ReservationResponse {
    return {
      data: this.reservationsService.getActiveReservationsForUser(userId),
      success: true,
    };
  }
}
