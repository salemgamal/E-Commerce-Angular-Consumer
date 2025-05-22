import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from '../Services/loading.service';

@Injectable()
export class loaderInterceptor implements HttpInterceptor {
  constructor(private _service: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._service.loading();

    return next.handle(request).pipe(
      catchError(error => {
        this._service.hideLoader();
        return throwError(() => error);
      }),
      finalize(() => {
        this._service.hideLoader();
      })
    );
  }
}
