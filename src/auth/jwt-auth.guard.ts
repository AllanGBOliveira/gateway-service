import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';
import { Observable, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(this.i18n.t('auth.TOKEN_NOT_FOUND'));
    }

    return this.authClient
      .send({ cmd: 'validate_token' }, { token })
      .pipe(
        map((result: any) => {
          this.logger.debug('Auth service response:', JSON.stringify(result));
          
          if (result && result.valid === true && result.user) {
            this.logger.debug('Token validation successful');
            request.user = result.user;
            return true;
          }
          
          if (result && result.status === 'error') {
            this.logger.debug('Auth service returned error:', result.message);
            throw new UnauthorizedException(result.message || this.i18n.t('auth.TOKEN_INVALID'));
          }
          
          if (result && result.valid === false) {
            this.logger.debug('Token validation failed - invalid token');
            throw new UnauthorizedException(this.i18n.t('auth.TOKEN_INVALID'));
          }
          
          this.logger.debug('Unexpected response format:', result);
          throw new UnauthorizedException(this.i18n.t('auth.TOKEN_INVALID'));
        }),
        catchError((error) => {
          throw new UnauthorizedException(this.i18n.t('auth.TOKEN_VALIDATION_FAILED'));
        }),
      );
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
