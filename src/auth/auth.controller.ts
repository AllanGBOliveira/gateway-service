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
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
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
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ========== PUBLIC ROUTES (No Authentication Required) ==========

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('auth/register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('auth/validate')
  async validateToken(@Body() payload: ValidateTokenDto): Promise<{ user: User; valid: boolean }> {
    return this.authService.validateToken(payload);
  }

  @Get('health')
  healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.authService.healthCheck();
  }

  // ========== PROTECTED ROUTES (JWT Authentication Required) ==========

  @Get('users')
  @UseGuards(JwtAuthGuard)
  findAllUsers(@Request() req: any): Promise<UsersResponse> {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return this.authService.findAllUsers(token, req.user);
  }

  @Get('users/profile')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@Request() req: any): Promise<User> {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return this.authService.getUserProfile(token, req.user);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  findUserById(@Param('id') id: string, @Request() req: any): Promise<User> {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return this.authService.findUserById(id, token, req.user);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ): Promise<User> {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return this.authService.updateUser(id, updateUserDto, token, req.user);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: string, @Request() req: any): Promise<{ message: string; deletedUser: User }> {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return this.authService.deleteUser(id, token, req.user);
  }
}
