import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { ConcertsService } from '../concerts/concerts.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  Reservation,
  ReservationLog,
} from './interfaces/reservation.interface';
import { Concert } from '../concerts/interfaces/concert.interface';

const mockConcertsService = {
  findOne: jest.fn(),
  decreaseSeats: jest.fn(),
  increaseSeats: jest.fn(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ConcertsService,
          useValue: mockConcertsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    jest.clearAllMocks();

    service['activeReservations'].length = 0;
    service['reservationLogs'].length = 0;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReservationDto: CreateReservationDto = {
      concertId: 'concert1',
      userId: 'user1',
    };
    const mockConcert: Concert = {
      id: 'concert1',
      name: 'Test Concert',
      description: 'A great concert',
      seat: 1,
    };

    it('should create a reservation successfully', () => {
      mockConcertsService.findOne.mockReturnValue(mockConcert);

      const result = service.create(createReservationDto);

      expect(result.concertId).toBe('concert1');
      expect(result.userId).toBe('user1');
      expect(mockConcertsService.findOne).toHaveBeenCalledWith('concert1');
      expect(mockConcertsService.decreaseSeats).toHaveBeenCalledWith(
        'concert1',
      );
      expect(service['activeReservations'].length).toBe(1);
      expect(service['reservationLogs'].length).toBe(1);
      expect(service['reservationLogs'][0].action).toBe('reserved');
    });

    it('should throw ConflictException if concert has no available seats', () => {
      mockConcertsService.findOne.mockReturnValue({ ...mockConcert, seat: 0 });

      expect(() => service.create(createReservationDto)).toThrow(
        ConflictException,
      );
      expect(() => service.create(createReservationDto)).toThrow(
        'Concert with ID "concert1" has no available seats.',
      );
      expect(mockConcertsService.decreaseSeats).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user has already reserved a seat for the concert', () => {
      mockConcertsService.findOne.mockReturnValue(mockConcert);
      service.create(createReservationDto);

      expect(() => service.create(createReservationDto)).toThrow(
        ConflictException,
      );
      expect(() => service.create(createReservationDto)).toThrow(
        'User "user1" has already reserved a seat for concert "concert1".',
      );
      expect(mockConcertsService.decreaseSeats).toHaveBeenCalledWith(
        'concert1',
      );
    });

    it('should throw NotFoundException if concert does not exist', () => {
      mockConcertsService.findOne.mockImplementation(() => {
        throw new NotFoundException('Concert not found');
      });

      expect(() => service.create(createReservationDto)).toThrow(
        NotFoundException,
      );
      expect(mockConcertsService.decreaseSeats).not.toHaveBeenCalled();
    });
  });

  describe('getActiveReservationsForUser', () => {
    it('should return active reservations for a user', () => {
      const reservation1: Reservation = {
        id: 'res1',
        concertId: 'c1',
        userId: 'user1',
        createdAt: new Date(),
      };
      const reservation2: Reservation = {
        id: 'res2',
        concertId: 'c2',
        userId: 'user2',
        createdAt: new Date(),
      };
      const reservation3: Reservation = {
        id: 'res3',
        concertId: 'c3',
        userId: 'user1',
        createdAt: new Date(),
      };
      service['activeReservations'].push(
        reservation1,
        reservation2,
        reservation3,
      );

      const result = service.getActiveReservationsForUser('user1');
      expect(result.length).toBe(2);
      expect(result).toContain(reservation1);
      expect(result).toContain(reservation3);
    });

    it('should return an empty array if user has no active reservations', () => {
      const result = service.getActiveReservationsForUser('userNonExistent');
      expect(result.length).toBe(0);
    });
  });

  describe('getAllReservations', () => {
    it('should return all active reservations', () => {
      const reservation1: Reservation = {
        id: 'res1',
        concertId: 'c1',
        userId: 'user1',
        createdAt: new Date(),
      };
      service['activeReservations'].push(reservation1);

      const result = service.getAllReservations();
      expect(result.length).toBe(1);
      expect(result).toContain(reservation1);
    });
  });

  describe('getCancelledReservations', () => {
    it('should return the count of cancelled reservations', () => {
      service['reservationLogs'].push(
        {
          id: 'l1',
          userId: 'u1',
          userName: 'un1',
          concertId: 'c1',
          concertName: 'cn1',
          action: 'reserved',
          timestamp: new Date(),
        } as ReservationLog,
        {
          id: 'l2',
          userId: 'u2',
          userName: 'un2',
          concertId: 'c2',
          concertName: 'cn2',
          action: 'cancelled',
          timestamp: new Date(),
        } as ReservationLog,
        {
          id: 'l3',
          userId: 'u3',
          userName: 'un3',
          concertId: 'c3',
          concertName: 'cn3',
          action: 'reserved',
          timestamp: new Date(),
        } as ReservationLog,
        {
          id: 'l4',
          userId: 'u4',
          userName: 'un4',
          concertId: 'c4',
          concertName: 'cn4',
          action: 'cancelled',
          timestamp: new Date(),
        } as ReservationLog,
      );
      const result = service.getCancelledReservations();
      expect(result).toBe(2);
    });
  });

  describe('cancelReservation', () => {
    const userId = 'user1';
    const concertId = 'concert1';
    let reservationId: string;
    const mockConcert: Concert = {
      id: concertId,
      name: 'Test Concert',
      description: 'A great concert',
      seat: 0,
    };

    beforeEach(() => {
      mockConcertsService.findOne.mockReturnValue({ ...mockConcert, seat: 1 });
      const createdReservation = service.create({ concertId, userId });
      reservationId = createdReservation.id;

      mockConcertsService.findOne.mockReturnValue(mockConcert);
      jest.clearAllMocks();
      mockConcertsService.findOne.mockReturnValue(mockConcert);
    });

    it('should cancel a reservation successfully', () => {
      const result = service.cancelReservation(reservationId, userId);

      expect(result.message).toBe('Reservation successfully cancelled.');
      expect(mockConcertsService.increaseSeats).toHaveBeenCalledWith(concertId);
      expect(
        service['activeReservations'].find((r) => r.id === reservationId),
      ).toBeUndefined();
      expect(service['reservationLogs'].length).toBe(2);
      expect(service['reservationLogs'][0].action).toBe('cancelled');
      expect(service['reservationLogs'][0].concertId).toBe(concertId);
    });

    it('should throw NotFoundException if reservation to cancel is not found for the user', () => {
      expect(() =>
        service.cancelReservation('non-existent-id', userId),
      ).toThrow(NotFoundException);
      expect(() =>
        service.cancelReservation('non-existent-id', userId),
      ).toThrow(
        'Active reservation with ID "non-existent-id" not found for this user.',
      );
      expect(mockConcertsService.increaseSeats).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if reservation belongs to another user', () => {
      expect(() =>
        service.cancelReservation(reservationId, 'anotherUser'),
      ).toThrow(NotFoundException);
      expect(mockConcertsService.increaseSeats).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if concert for cancelled reservation is not found', () => {
      mockConcertsService.findOne.mockImplementationOnce(() => {
        return { ...mockConcert, seat: 1 };
      });
      mockConcertsService.findOne.mockImplementationOnce(() => {
        throw new NotFoundException('Concert not found during cancellation');
      });

      service['activeReservations'].length = 0;
      service['reservationLogs'].length = 0;
      const newReservation = service.create({ concertId, userId });

      expect(() =>
        service.cancelReservation(newReservation.id, userId),
      ).toThrow(NotFoundException);
      expect(mockConcertsService.increaseSeats).not.toHaveBeenCalled();
    });
  });

  describe('getReservationLogs', () => {
    it('should return sorted reservation logs (newest first)', () => {
      const date1 = new Date(2023, 0, 1);
      const date2 = new Date(2023, 0, 2);
      service['reservationLogs'].push(
        {
          id: 'log1',
          action: 'reserved',
          timestamp: date1,
          userId: 'u1',
          concertId: 'c1',
          concertName: 'cn1',
          userName: 'un1',
        } as ReservationLog,
        {
          id: 'log2',
          action: 'cancelled',
          timestamp: date2,
          userId: 'u2',
          concertId: 'c2',
          concertName: 'cn2',
          userName: 'un2',
        } as ReservationLog,
      );

      const result = service.getReservationLogs();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('log2');
      expect(result[1].id).toBe('log1');
    });
  });
});
