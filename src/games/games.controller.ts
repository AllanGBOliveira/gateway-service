import { Controller, Get, Post, Param, Body, Inject } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators'; // Importando o operador timeout

@Controller('games')
export class GamesController {
  constructor(@Inject('GAMES_SERVICE') private client: ClientProxy) {}

  // --- Exemplo de Request-Response (HTTP -> Microservice) ---
  @Get(':id')
  async getGameDetails(@Param('id') id: string): Promise<any> {
    const pattern = { cmd: 'get_game_details' };
    const payload = id;

    console.log(`Gateway sending request for game details: ${id}`);

    try {
      const gameDetails: Observable<any> = this.client.send(pattern, payload);

      // Usando firstValueFrom para converter Observable em Promise e adicionar timeout
      const response = await firstValueFrom(
        gameDetails.pipe(timeout(5000)), // Timeout de 5 segundos
      );

      console.log('Gateway received game details:', response);
      return response;
    } catch (error) {
      console.error('Error fetching game details:', error);
      // Tratar erro de timeout ou erro retornado pelo microserviço
      if (error.message.includes('timeout')) {
        throw new Error('The game service timed out. Please try again later.');
      }
      throw new Error('Could not retrieve game details.');
    }
  }

  // --- Exemplo de Evento (HTTP -> Microservice - não espera resposta) ---
  @Post()
  async createGame(
    @Body() gameData: { id: string; name: string },
  ): Promise<{ message: string }> {
    const eventPattern = 'game_created';
    console.log('Gateway emitting game_created event:', gameData);

    // O método emit() é assíncrono e não espera por uma resposta.
    // Ele retorna um Observable, mas não é necessário se inscrever nele.
    this.client.emit(eventPattern, gameData);

    return { message: 'Game creation event sent successfully!' };
  }

  // --- Exemplo de Evento de exclusão ---
  @Post(':id/delete')
  async deleteGame(@Param('id') id: string): Promise<{ message: string }> {
    const eventPattern = 'game_deleted';
    console.log(`Gateway emitting game_deleted event for ID: ${id}`);

    this.client.emit(eventPattern, id);

    return { message: 'Game deletion event sent successfully!' };
  }
}
