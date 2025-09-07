import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { LoginDto } from 'types/auth';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly clientAuth: ClientProxy,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    console.log('Login request received in gateway:', loginDto);
    return this.clientAuth.send({ cmd: 'login' }, loginDto);
  }

  @Post('register')
  register(@Body() registerDto: any) {
    console.log('Register request received in gateway:', registerDto);
    return this.clientAuth.send({ cmd: 'register' }, registerDto);
  }
}
