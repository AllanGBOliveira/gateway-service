import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { catchError, map, timeout } from 'rxjs/operators';
import { throwError, firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @Inject('GAMES_SERVICE') private client: ClientProxy,
    private readonly i18n: I18nService
  ) {}

  async getGameDetails(id: string): Promise<any> {
    const pattern = { cmd: 'get_game_details' };
    const payload = {
      id,
      lang: I18nContext.current()?.lang || 'en'
    };

    this.logger.log(this.i18n.t('games.LOG_SENDING_GAME_DETAILS_REQUEST'), { gameId: id });

    try {
      const gameDetails: Observable<any> = this.client.send(pattern, payload);

      const response = await firstValueFrom(
        gameDetails.pipe(timeout(5000)),
      );

      this.logger.log(this.i18n.t('games.LOG_RECEIVED_GAME_DETAILS'), { gameId: id, response });
      return response;
    } catch (error) {
      this.logger.error(this.i18n.t('games.LOG_ERROR_FETCHING_GAME_DETAILS'), error.stack, { gameId: id });
      
      if (error.message.includes('timeout')) {
        throw new Error(this.i18n.t('common.TIMEOUT_ERROR'));
      }
      throw new Error(this.i18n.t('games.GAME_FETCH_ERROR'));
    }
  }

  async createGame(gameData: { id: string; name: string }): Promise<{ message: string }> {
    const eventPattern = 'game_created';
    this.logger.log(this.i18n.t('games.LOG_EMITTING_GAME_CREATED_EVENT'), { gameData });

    this.client.emit(eventPattern, {
      ...gameData,
      lang: I18nContext.current()?.lang || 'en'
    });

    return { 
      message: this.i18n.t('games.GAME_CREATED')
    };
  }

  async deleteGame(id: string): Promise<{ message: string }> {
    const eventPattern = 'game_deleted';
    this.logger.log(this.i18n.t('games.LOG_EMITTING_GAME_DELETED_EVENT'), { gameId: id });

    this.client.emit(eventPattern, {
      id,
      lang: I18nContext.current()?.lang || 'en'
    });

    return { 
      message: this.i18n.t('games.GAME_DELETED')
    };
  }
}
