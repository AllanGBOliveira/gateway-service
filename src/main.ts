import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RpcExceptionInterceptor } from './middleware/rpc-exception.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useGlobalInterceptors(new RpcExceptionInterceptor());

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`API Gateway is listening on port ${port}`);
}
bootstrap();
