import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { firstValueFrom } from 'rxjs';
import type {
  LoginDto,
  RegisterDto,
  UpdateUserDto,
  ValidateTokenDto,
  AuthResponse,
  User,
  UsersResponse
} from '../../types/auth.d';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly clientAuth: ClientProxy,
    private readonly i18n: I18nService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log(this.i18n.t('auth.LOG_LOGIN_REQUEST'), { email: loginDto.email });
    return firstValueFrom(this.clientAuth.send({ cmd: 'login' }, {
      ...loginDto,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log(this.i18n.t('auth.LOG_REGISTER_REQUEST'), { email: registerDto.email, name: registerDto.name });
    return firstValueFrom(this.clientAuth.send({ cmd: 'register' }, {
      ...registerDto,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async validateToken(payload: ValidateTokenDto): Promise<{ user: User; valid: boolean }> {
    this.logger.log(this.i18n.t('auth.LOG_TOKEN_VALIDATION_REQUEST'));
    try {
      const result = await firstValueFrom(
        this.clientAuth.send({ cmd: 'validate_token' }, {
          ...payload,
          lang: I18nContext.current()?.lang || 'en'
        })
      );
      return result;
    } catch (error) {
      this.logger.error('Token validation error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return firstValueFrom(this.clientAuth.send({ cmd: 'health_check' }, {
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async findAllUsers(token: string, user: any): Promise<UsersResponse> {
    this.logger.log(this.i18n.t('auth.LOG_FIND_ALL_USERS_REQUEST'));
    return firstValueFrom(this.clientAuth.send({ cmd: 'find_all_users' }, {
      token,
      user,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async getUserProfile(token: string, user: any): Promise<User> {
    this.logger.log(this.i18n.t('auth.LOG_GET_USER_PROFILE_REQUEST'));
    return firstValueFrom(this.clientAuth.send({ cmd: 'get_user_profile' }, {
      token,
      user,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async findUserById(id: string, token: string, user: any): Promise<User> {
    this.logger.log(this.i18n.t('auth.LOG_FIND_USER_BY_ID_REQUEST'), { userId: id });
    return firstValueFrom(this.clientAuth.send({ cmd: 'find_user_by_id' }, {
      id,
      token,
      user,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, token: string, user: any): Promise<User> {
    this.logger.log(this.i18n.t('auth.LOG_UPDATE_USER_REQUEST'), { userId: id, updateData: updateUserDto });
    return firstValueFrom(this.clientAuth.send({ cmd: 'update_user' }, {
      id,
      updateUserDto,
      token,
      user,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }

  async deleteUser(id: string, token: string, user: any): Promise<{ message: string; deletedUser: User }> {
    this.logger.log(this.i18n.t('auth.LOG_DELETE_USER_REQUEST'), { userId: id });
    return firstValueFrom(this.clientAuth.send({ cmd: 'delete_user' }, {
      id,
      token,
      user,
      lang: I18nContext.current()?.lang || 'en'
    }));
  }
}
