import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable, firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(@Inject('GAMES_SERVICE') private client: ClientProxy) {}

  @Get(':id')
  async getGameDetails(@Param('id') id: string): Promise<any> {
    const pattern = { cmd: 'get_game_details' };
    const payload = id;

    this.logger.log('Gateway sending request for game details', { gameId: id });

    try {
      const gameDetails: Observable<any> = this.client.send(pattern, payload);

      const response = await firstValueFrom(
        gameDetails.pipe(timeout(5000)),
      );

      this.logger.log('Gateway received game details', { gameId: id, response });
      return response;
    } catch (error) {
      this.logger.error('Error fetching game details', error.stack, { gameId: id });
      if (error.message.includes('timeout')) {
        throw new Error('The game service timed out. Please try again later.');
      }
      throw new Error('Could not retrieve game details.');
    }
  }

  @Post()
  async createGame(
    @Body() gameData: { id: string; name: string },
  ): Promise<{ message: string }> {
    const eventPattern = 'game_created';
    this.logger.log('Gateway emitting game_created event', { gameData });

    this.client.emit(eventPattern, gameData);

    return { message: 'Game creation event sent successfully!' };
  }
  @Post(':id/delete')
  async deleteGame(@Param('id') id: string): Promise<{ message: string }> {
    const eventPattern = 'game_deleted';
    this.logger.log('Gateway emitting game_deleted event', { gameId: id });

    this.client.emit(eventPattern, id);

    return { message: 'Game deletion event sent successfully!' };
  }
}
