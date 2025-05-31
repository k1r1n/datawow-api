import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createConcertDto: CreateConcertDto) {
    return this.concertsService.create(createConcertDto);
  }

  @Get()
  findAll() {
    return this.concertsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.concertsService.remove(id);
  }
}
