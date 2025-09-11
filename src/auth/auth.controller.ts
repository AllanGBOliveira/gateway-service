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
  Get,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
  Inject,
  Logger
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from './jwt-auth.guard';
import type {
  LoginDto,
  RegisterDto,
  UpdateUserDto,
  ValidateTokenDto,
  AuthResponse,
  User,
  UsersResponse
} from 'types/auth';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly clientAuth: ClientProxy,
  ) {}

  // ========== PUBLIC ROUTES (No Authentication Required) ==========

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    console.log('Login request received in gateway:', loginDto);
    return this.clientAuth.send({ cmd: 'login' }, loginDto).toPromise();
  }

  @Post('auth/register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    console.log('Register request received in gateway:', registerDto);
    return this.clientAuth.send({ cmd: 'register' }, registerDto).toPromise();
  }

  @Post('auth/validate')
  validateToken(@Body() payload: ValidateTokenDto): Promise<{ user: User; valid: boolean }> {
    console.log('Token validation request received in gateway');
    return this.clientAuth.send({ cmd: 'validate_token' }, payload).toPromise();
  }

  @Get('health')
  healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.clientAuth.send({ cmd: 'health_check' }, {}).toPromise();
  }

  // ========== PROTECTED ROUTES (JWT Authentication Required) ==========

  @Get('users')
  @UseGuards(JwtAuthGuard)
  findAllUsers(@Request() req: any): Promise<UsersResponse> {
    console.log('Find all users request received in gateway');
    return this.clientAuth.send({ cmd: 'find_all_users' }, {
      token: req.headers?.authorization,
      user: req.user
    }).toPromise();
  }

  @Get('users/profile')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@Request() req: any): Promise<User> {
    console.log('Get user profile request received in gateway');
    return this.clientAuth.send({ cmd: 'get_user_profile' }, {
      token: req.headers?.authorization,
      user: req.user
    }).toPromise();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  findUserById(@Param('id') id: string, @Request() req: any): Promise<User> {
    console.log('Find user by ID request received in gateway:', id);
    return this.clientAuth.send({ cmd: 'find_user_by_id' }, {
      id,
      token: req.headers?.authorization,
      user: req.user
    }).toPromise();
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ): Promise<User> {
    console.log('Update user request received in gateway:', id, updateUserDto);
    return this.clientAuth.send({ cmd: 'update_user' }, {
      id,
      updateUserDto,
      token: req.headers?.authorization,
      user: req.user
    }).toPromise();
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: string, @Request() req: any): Promise<{ message: string; deletedUser: User }> {
    console.log('Delete user request received in gateway:', id);
    return this.clientAuth.send({ cmd: 'delete_user' }, {
      id,
      token: req.headers?.authorization,
      user: req.user
    }).toPromise();
  }
}
