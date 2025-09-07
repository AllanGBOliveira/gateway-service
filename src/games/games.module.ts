import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GAMES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://meu_usuario:minha_senha@rabbitmq:5672'],
          queue: 'games_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [GamesController],
  providers: [],
  exports: [ClientsModule],
})
export class GamesModule {}
