import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpEventType,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor(private _router : Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(
        err =>
          new Observable<HttpEvent<any>>(observer => {
            if (err instanceof HttpErrorResponse) {
              const errResp = <HttpErrorResponse>err;
              if (errResp.status === 401) {
                console.log(errResp);
              }
            }
            observer.error(err);
            observer.complete();
          })
      )
    );
  }
}
