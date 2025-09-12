import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let controller: GamesController;

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
      const mockResponse = { id: '1', name: 'Test Game' };
      mockGamesService.getGameDetails.mockResolvedValue(mockResponse);

      const result: unknown = await controller.getGameDetails(gameId);

      expect(mockGamesService.getGameDetails).toHaveBeenCalledWith(gameId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createGame', () => {
    it('should call gamesService.createGame', () => {
      const gameData = { id: 'new-game-id', name: 'New Game' };
      const expectedResponse = { id: 'new-game-id', name: 'New Game' };

      mockGamesService.createGame.mockReturnValue(expectedResponse);

      const result = controller.createGame(gameData);

      expect(mockGamesService.createGame).toHaveBeenCalledWith(gameData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteGame', () => {
    it('should call gamesService.deleteGame', () => {
      const gameId = 'game-123';
      const expectedResponse = { message: 'Game deleted successfully' };

      mockGamesService.deleteGame.mockReturnValue(expectedResponse);

      const result = controller.deleteGame(gameId);

      expect(mockGamesService.deleteGame).toHaveBeenCalledWith(gameId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
