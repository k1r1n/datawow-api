import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './interfaces/reservation.interface';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: {
            create: jest.fn(),
            getAllReservations: jest.fn(),
            getActiveReservationsForUser: jest.fn(),
            cancelReservation: jest.fn(),
            getCancelledReservations: jest.fn(),
            getReservationLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the correct parameters', () => {
      const createReservationDto: CreateReservationDto = {
        userId: 'testUser',
        concertId: 'testConcert',
      };
      controller.create(createReservationDto);
      expect(service.create).toHaveBeenCalledWith(createReservationDto);
    });

    it('should return the result of service.create', () => {
      const createReservationDto: CreateReservationDto = {
        userId: 'testUser',
        concertId: 'testConcert',
      };
      const expectedResult: Reservation = {
        id: '1',
        ...createReservationDto,
        createdAt: new Date(),
      };
      jest.spyOn(service, 'create').mockReturnValue(expectedResult);
      const result = controller.create(createReservationDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
