import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const started = performance.now();

    console.log(`Request: ${req.method} ${req.url}`);

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const elapsed = performance.now() - started;
            console.log(
              `Response: ${req.method} ${req.url} (${elapsed.toFixed(1)} ms)`
            );
          }
        },
        error: (error) => {
          const elapsed = performance.now() - started;
          console.error(
            `Error: ${req.method} ${req.url} (${elapsed.toFixed(1)} ms)`,
            error
          );
        },
        complete: () => {
          const elapsed = performance.now() - started;
          console.log(
            `Completed: ${req.method} ${req.url} (${elapsed.toFixed(1)} ms)`
          );
        }
      })
    );
  }
}
