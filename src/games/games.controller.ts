import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get(':id')
  async getGameDetails(@Param('id') id: string): Promise<any> {
    return this.gamesService.getGameDetails(id);
  }

  @Post()
  createGame(@Body() gameData: { id: string; name: string }): {
    message: string;
  } {
    return this.gamesService.createGame(gameData);
  }

  @Post(':id/delete')
  deleteGame(@Param('id') id: string): { message: string } {
    return this.gamesService.deleteGame(id);
  }
}
