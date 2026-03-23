import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiErrorModel } from '../models/api-error.model';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const parsedError: ApiErrorModel = {
        status: error.status || 500,
        message:
          (error.error && typeof error.error === 'object' && 'message' in error.error
            ? String(error.error.message)
            : error.message) || 'Unexpected error',
        timestamp: new Date().toISOString(),
        details: error.error
      };

      return throwError(() => parsedError);
    })
  );
};
