import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';

describe('GamesController', () => {
  let controller: GamesController;
  let gamesService: GamesService;

  const mockGamesService = {
    getGameDetails: jest.fn(),
    createGame: jest.fn(),
    deleteGame: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    gamesService = module.get<GamesService>(GamesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGameDetails', () => {
    it('should call gamesService.getGameDetails', async () => {
      const gameId = 'game-123';
      const expectedResponse = { id: gameId, title: 'Test Game' };
      
      mockGamesService.getGameDetails.mockResolvedValue(expectedResponse);
      
      const result = await controller.getGameDetails(gameId);
      
      expect(mockGamesService.getGameDetails).toHaveBeenCalledWith(gameId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('createGame', () => {
    it('should call gamesService.createGame', async () => {
      const gameData = { id: 'new-game-id', name: 'New Game' };
      const expectedResponse = { id: 'new-game-id', name: 'New Game' };
      
      mockGamesService.createGame.mockResolvedValue(expectedResponse);
      
      const result = await controller.createGame(gameData);
      
      expect(mockGamesService.createGame).toHaveBeenCalledWith(gameData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteGame', () => {
    it('should call gamesService.deleteGame', async () => {
      const gameId = 'game-123';
      const expectedResponse = { message: 'Game deleted successfully' };
      
      mockGamesService.deleteGame.mockResolvedValue(expectedResponse);
      
      const result = await controller.deleteGame(gameId);
      
      expect(mockGamesService.deleteGame).toHaveBeenCalledWith(gameId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
