// gateway/src/common/interceptors/rpc-exception.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UnifiedException } from 'types/common';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: UnifiedException) => {
        if (error?.type !== 'rpc') {
          return throwError(() => error);
        }

        if (error?.type === 'rpc') {
          const errorMessage = error.message;
          const errorStatus = error.status;

          return throwError(() => new HttpException(errorMessage, errorStatus));
        }

        return throwError(
          () =>
            new HttpException(
              'An unexpected error occurred',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
