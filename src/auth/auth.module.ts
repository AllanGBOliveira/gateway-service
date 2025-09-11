import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBITMQ_DEFAULT_USER')}:${configService.get('RABBITMQ_DEFAULT_PASS')}@rabbitmq:${configService.get('RABBITMQ_DEFAULT_PORT')}`,
            ],
            queue: 'auth_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [ClientsModule, JwtAuthGuard],
})
export class AuthModule {}
