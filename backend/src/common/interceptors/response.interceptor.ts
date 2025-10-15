import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const { message, ...rest } = data || {};
        return {
          status: true,
          message: message || 'Operation successful',
          data: Object.keys(rest).length > 0 ? rest : null,
        };
      }),
    );
  }
}
