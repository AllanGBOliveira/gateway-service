import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  Logger
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import type {
  LoginDto,
  RegisterDto,
  UpdateUserDto,
  ValidateTokenDto,
  AuthResponse,
  User,
  UsersResponse
} from '../../types/auth.d';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly clientAuth: ClientProxy,
    private readonly i18n: I18nService,
  ) {}

  // ========== PUBLIC ROUTES (No Authentication Required) ==========

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log(this.i18n.t('auth.LOG_LOGIN_REQUEST'), { email: loginDto.email });
    return firstValueFrom(this.clientAuth.send({ cmd: 'login' }, loginDto));
  }

  @Post('auth/register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log(this.i18n.t('auth.LOG_REGISTER_REQUEST'), { email: registerDto.email, name: registerDto.name });
    return firstValueFrom(this.clientAuth.send({ cmd: 'register' }, registerDto));
  }

  @Post('auth/validate')
  async validateToken(@Body() payload: ValidateTokenDto): Promise<{ user: User; valid: boolean }> {
    this.logger.log(this.i18n.t('auth.LOG_TOKEN_VALIDATION_REQUEST'));
    try {
      const result = await firstValueFrom(
        this.clientAuth.send({ cmd: 'validate_token' }, payload)
      );
      return result;
    } catch (error) {
      this.logger.error('Token validation error:', error);
      throw error;
    }
  }

  @Get('health')
  healthCheck(): Promise<{ status: string; timestamp: string }> {
    return firstValueFrom(this.clientAuth.send({ cmd: 'health_check' }, {}));
  }

  // ========== PROTECTED ROUTES (JWT Authentication Required) ==========

  @Get('users')
  @UseGuards(JwtAuthGuard)
  findAllUsers(@Request() req: any): Promise<UsersResponse> {
    this.logger.log(this.i18n.t('auth.LOG_FIND_ALL_USERS_REQUEST'));
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return firstValueFrom(this.clientAuth.send({ cmd: 'find_all_users' }, {
      token,
      user: req.user
    }));
  }

  @Get('users/profile')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@Request() req: any): Promise<User> {
    this.logger.log(this.i18n.t('auth.LOG_GET_USER_PROFILE_REQUEST'));
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return firstValueFrom(this.clientAuth.send({ cmd: 'get_user_profile' }, {
      token,
      user: req.user
    }));
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  findUserById(@Param('id') id: string, @Request() req: any): Promise<User> {
    this.logger.log(this.i18n.t('auth.LOG_FIND_USER_BY_ID_REQUEST'), { userId: id });
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return firstValueFrom(this.clientAuth.send({ cmd: 'find_user_by_id' }, {
      id,
      token,
      user: req.user
    }));
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ): Promise<User> {
    this.logger.log(this.i18n.t('auth.LOG_UPDATE_USER_REQUEST'), { userId: id, updateData: updateUserDto });
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return firstValueFrom(this.clientAuth.send({ cmd: 'update_user' }, {
      id,
      updateUserDto,
      token,
      user: req.user
    }));
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: string, @Request() req: any): Promise<{ message: string; deletedUser: User }> {
    this.logger.log(this.i18n.t('auth.LOG_DELETE_USER_REQUEST'), { userId: id });
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return firstValueFrom(this.clientAuth.send({ cmd: 'delete_user' }, {
      id,
      token,
      user: req.user
    }));
  }
}
