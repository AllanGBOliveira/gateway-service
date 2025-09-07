import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { ClientProxy } from '@nestjs/microservices';

describe('GamesController', () => {
  let controller: GamesController;
  let mockGamesClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    mockGamesClient = {
      send: jest.fn(),
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: 'GAMES_SERVICE',
          useValue: mockGamesClient,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
