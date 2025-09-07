import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.AUTH_SERVICE_HOST ?? 'auth-service',
            port: process.env.AUTH_SERVICE_PORT ?? 3001,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
