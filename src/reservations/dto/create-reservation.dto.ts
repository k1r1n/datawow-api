import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  concertId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
