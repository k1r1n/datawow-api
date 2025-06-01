import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { NotFoundException } from '@nestjs/common';

describe('ConcertsService', () => {
  let service: ConcertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConcertsService],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new concert and return it with total seats', () => {
      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'A great concert',
        seat: 100,
      };
      const result = service.create(createConcertDto);
      expect(result.success).toBe(true);
      expect(result.data.list.length).toBe(1);
      expect(result.data.list[0].name).toBe('Test Concert');
      expect(result.data.totalSeats).toBe(100);

      const createAnotherConcertDto: CreateConcertDto = {
        name: 'Test Concert 2',
        description: 'Another great concert',
        seat: 50,
      };
      const result2 = service.create(createAnotherConcertDto);
      expect(result2.success).toBe(true);
      expect(result2.data.list.length).toBe(2);
      expect(result2.data.totalSeats).toBe(150);
    });
  });

  describe('findAll', () => {
    it('should return all concerts with total seats', () => {
      const resultEmpty = service.findAll();
      expect(resultEmpty.success).toBe(true);
      expect(resultEmpty.data.list.length).toBe(0);
      expect(resultEmpty.data.totalSeats).toBe(0);

      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'A great concert',
        seat: 100,
      };
      service.create(createConcertDto);
      const result = service.findAll();
      expect(result.success).toBe(true);
      expect(result.data.list.length).toBe(1);
      expect(result.data.totalSeats).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', () => {
      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'A great concert',
        seat: 100,
      };
      const createdConcertResponse = service.create(createConcertDto);
      const concertId = createdConcertResponse.data.list[0].id;

      const foundConcert = service.findOne(concertId);
      expect(foundConcert).toBeDefined();
      expect(foundConcert.id).toBe(concertId);
      expect(foundConcert.name).toBe('Test Concert');
    });

    it('should throw NotFoundException if concert with id is not found', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(
        NotFoundException,
      );
      expect(() => service.findOne('non-existent-id')).toThrow(
        'Concert with ID "non-existent-id" not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a concert by id', () => {
      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'A great concert',
        seat: 100,
      };
      const createdConcertResponse = service.create(createConcertDto);
      const concertId = createdConcertResponse.data.list[0].id;

      const result = service.remove(concertId);
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        `Concert with ID "${concertId}" successfully deleted`,
      );
      expect(() => service.findOne(concertId)).toThrow(NotFoundException);
      const findAllResult = service.findAll();
      expect(findAllResult.data.list.length).toBe(0);
      expect(findAllResult.data.totalSeats).toBe(0);
    });

    it('should throw NotFoundException if concert to remove is not found', () => {
      expect(() => service.remove('non-existent-id')).toThrow(
        NotFoundException,
      );
      expect(() => service.remove('non-existent-id')).toThrow(
        'Concert with ID "non-existent-id" not found',
      );
    });
  });

  describe('decreaseSeats', () => {
    it('should decrease the seat count of a concert', () => {
      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'A great concert',
        seat: 100,
      };
      const createdConcertResponse = service.create(createConcertDto);
      const concertId = createdConcertResponse.data.list[0].id;

      service.decreaseSeats(concertId);
      const updatedConcert = service.findOne(concertId);
      expect(updatedConcert.seat).toBe(99);
    });

    it('should throw NotFoundException if concert to decrease seats is not found', () => {
      expect(() => service.decreaseSeats('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('increaseSeats', () => {
    it('should increase the seat count of a concert', () => {
      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'A great concert',
        seat: 100,
      };
      const createdConcertResponse = service.create(createConcertDto);
      const concertId = createdConcertResponse.data.list[0].id;

      service.increaseSeats(concertId);
      const updatedConcert = service.findOne(concertId);
      expect(updatedConcert.seat).toBe(101);
    });

    it('should throw NotFoundException if concert to increase seats is not found', () => {
      expect(() => service.increaseSeats('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });
});
