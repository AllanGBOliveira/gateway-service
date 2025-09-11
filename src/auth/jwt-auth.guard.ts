import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { Observable, throwError, TimeoutError as RxTimeoutError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import type {
  ValidateTokenRequest,
  ValidateTokenResponse,
  AuthServiceError,
  AuthServiceResponse,
  RabbitMQError,
  CanActivateRequest,
} from '../../types/auth.d';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly i18n: I18nService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<CanActivateRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(this.i18n.t('auth.TOKEN_NOT_FOUND'));
    }

    const payload: ValidateTokenRequest = {
      token,
      lang: I18nContext.current()?.lang || 'en',
    };

    return this.authClient.send({ cmd: 'validate_token' }, payload).pipe(
      timeout(5000),
      map((result: AuthServiceResponse) => {
        this.logger.debug('Auth service response:', JSON.stringify(result));

        if (this.isAuthServiceError(result)) {
          this.logger.debug('Auth service returned error:', result.message);
          throw new UnauthorizedException(
            result.message || this.i18n.t('auth.TOKEN_INVALID'),
          );
        }

        if (this.isValidTokenResponse(result)) {
          if (result.valid === true && result.user) {
            this.logger.debug('Token validation successful');
            request.user = result.user;
            return true;
          }

          if (result.valid === false) {
            this.logger.debug('Token validation failed - invalid token');
            throw new UnauthorizedException(
              this.i18n.t('auth.TOKEN_VALIDATION_FAILED'),
            );
          }
        }

        this.logger.warn(
          'Unexpected response format from auth service:',
          result,
        );
        throw new UnauthorizedException(this.i18n.t('auth.TOKEN_INVALID'));
      }),
      catchError((error) => {
        this.logger.debug('Auth service communication error:', error);

        if (error instanceof RxTimeoutError) {
          this.logger.error('Auth service timeout');
          return throwError(
            () =>
              new UnauthorizedException(
                this.i18n.t('auth.TOKEN_VALIDATION_TIMEOUT'),
              ),
          );
        }

        if (this.isRabbitMQError(error)) {
          this.logger.error('Auth service connection failed');
          return throwError(
            () =>
              new UnauthorizedException(
                this.i18n.t('auth.SERVICE_UNAVAILABLE'),
              ),
          );
        }

        return throwError(
          () =>
            new UnauthorizedException(
              this.i18n.t('auth.TOKEN_VALIDATION_FAILED'),
            ),
        );
      }),
    );
  }

  private extractTokenFromHeader(request: {
    headers?: { authorization?: string };
  }): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }

  private isAuthServiceError(response: unknown): response is AuthServiceError {
    return (
      response !== null &&
      typeof response === 'object' &&
      'status' in response &&
      (response as { status: unknown }).status === 'error'
    );
  }

  private isValidTokenResponse(
    response: unknown,
  ): response is ValidateTokenResponse {
    return (
      response !== null &&
      typeof response === 'object' &&
      'valid' in response &&
      typeof (response as { valid: unknown }).valid === 'boolean'
    );
  }

  private isRabbitMQError(error: unknown): error is RabbitMQError {
    return (
      error !== null &&
      typeof error === 'object' &&
      (('code' in error &&
        (error as { code: unknown }).code === 'ECONNREFUSED') ||
        ('message' in error &&
          typeof (error as { message: unknown }).message === 'string' &&
          (error as { message: string }).message.includes('connection')))
    );
  }
}
