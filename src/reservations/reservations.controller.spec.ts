/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  Reservation,
  ReservationResponse,
  ReservationLog,
  ReservationLogResponse,
} from './interfaces/reservation.interface';

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

    jest.clearAllMocks();
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
      (service.create as jest.Mock).mockReturnValue(expectedResult);
      const result = controller.create(createReservationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllReservations', () => {
    it('should call service.getAllReservations and return the correct structure', () => {
      const mockReservations: Reservation[] = [
        { id: '1', concertId: 'c1', userId: 'u1', createdAt: new Date() },
        { id: '2', concertId: 'c2', userId: 'u2', createdAt: new Date() },
      ];
      (service.getAllReservations as jest.Mock).mockReturnValue(
        mockReservations,
      );

      const result: ReservationResponse = controller.getAllReservations();

      expect(service.getAllReservations).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: {
          list: mockReservations,
          total: mockReservations.length,
        },
        success: true,
      });
    });

    it('should handle empty list from service.getAllReservations', () => {
      const mockReservations: Reservation[] = [];
      (service.getAllReservations as jest.Mock).mockReturnValue(
        mockReservations,
      );

      const result: ReservationResponse = controller.getAllReservations();

      expect(service.getAllReservations).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: {
          list: [],
          total: 0,
        },
        success: true,
      });
    });
  });

  describe('getActiveReservationsUser', () => {
    const userId = 'testUser123';

    it('should call service.getActiveReservationsForUser with userId and return reservations', () => {
      const mockUserReservations: Reservation[] = [
        { id: '3', concertId: 'c3', userId: userId, createdAt: new Date() },
      ];
      (service.getActiveReservationsForUser as jest.Mock).mockReturnValue(
        mockUserReservations,
      );

      const result: ReservationResponse =
        controller.getActiveReservationsUser(userId);

      expect(service.getActiveReservationsForUser).toHaveBeenCalledTimes(2);
      expect(service.getActiveReservationsForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: {
          list: mockUserReservations,
          total: mockUserReservations.length,
        },
        success: true,
      });
    });

    it('should handle empty list from service.getActiveReservationsForUser', () => {
      const mockUserReservations: Reservation[] = [];
      (service.getActiveReservationsForUser as jest.Mock).mockReturnValue(
        mockUserReservations,
      );

      const result: ReservationResponse =
        controller.getActiveReservationsUser(userId);

      expect(service.getActiveReservationsForUser).toHaveBeenCalledTimes(2);
      expect(service.getActiveReservationsForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: {
          list: [],
          total: 0,
        },
        success: true,
      });
    });
  });

  describe('cancel', () => {
    const reservationId = 'res123';
    const userId = 'user456';

    it('should call service.cancelReservation with correct parameters', () => {
      controller.cancel(reservationId, userId);

      expect(service.cancelReservation).toHaveBeenCalledWith(
        reservationId,
        userId,
      );
    });

    it('should return the result of service.cancelReservation', () => {
      const expectedResult = { success: true };
      (service.cancelReservation as jest.Mock).mockReturnValue(expectedResult);
      const result = controller.cancel(reservationId, userId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if userId is not provided', () => {
      expect(() => {
        controller.cancel(reservationId, undefined as any);
      }).toThrow('userId query parameter is required for cancellation.');
    });
  });

  describe('getCancelledReservations', () => {
    it('should call service.getCancelledReservations and return the correct structure', () => {
      const cancelledCount = 5;
      (service.getCancelledReservations as jest.Mock).mockReturnValue(
        cancelledCount,
      );

      const result = controller.getCancelledReservations();

      expect(service.getCancelledReservations).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: {
          total: cancelledCount,
        },
        success: true,
      });
    });
  });

  describe('getAdminReservationHistory', () => {
    it('should call service.getReservationLogs and return reservation logs', () => {
      const mockLogs: ReservationLog[] = [
        {
          id: 'log1',
          userId: 'user1',
          concertId: 'concert1',
          concertName: 'Concert Name',
          action: 'reserved',
          timestamp: new Date(),
        },
      ];
      (service.getReservationLogs as jest.Mock).mockReturnValue(mockLogs);

      const result: ReservationLogResponse =
        controller.getAdminReservationHistory();

      expect(service.getReservationLogs).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: {
          list: mockLogs,
          total: mockLogs.length,
        },
        success: true,
      });
    });

    it('should handle empty list from service.getReservationLogs', () => {
      const mockLogs: ReservationLog[] = [];
      (service.getReservationLogs as jest.Mock).mockReturnValue(mockLogs);

      const result: ReservationLogResponse =
        controller.getAdminReservationHistory();

      expect(service.getReservationLogs).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: {
          list: [],
          total: 0,
        },
        success: true,
      });
    });
  });
});
