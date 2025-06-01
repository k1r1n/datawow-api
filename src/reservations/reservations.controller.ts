import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  ReservationLogResponse,
  ReservationResponse,
} from './interfaces/reservation.interface';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get('all')
  getAllReservations(): ReservationResponse {
    return {
      data: {
        list: this.reservationsService.getAllReservations(),
        total: this.reservationsService.getAllReservations().length,
      },
      success: true,
    };
  }

  @Get('user/:userId')
  getActiveReservationsUser(
    @Param('userId') userId: string,
  ): ReservationResponse {
    return {
      data: {
        list: this.reservationsService.getActiveReservationsForUser(userId),
        total:
          this.reservationsService.getActiveReservationsForUser(userId).length,
      },
      success: true,
    };
  }

  @Delete(':id')
  cancel(@Param('id') reservationId: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId query parameter is required for cancellation.');
    }

    return this.reservationsService.cancelReservation(reservationId, userId);
  }

  @Get('cancelled')
  getCancelledReservations() {
    return {
      data: {
        total: this.reservationsService.getCancelledReservations(),
      },
      success: true,
    };
  }

  @Get('history')
  getAdminReservationHistory(): ReservationLogResponse {
    return {
      data: {
        list: this.reservationsService.getReservationLogs(),
        total: this.reservationsService.getReservationLogs().length,
      },
      success: true,
    };
  }
}
