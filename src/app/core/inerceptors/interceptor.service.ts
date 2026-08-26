import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from '../services/local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {


  /*    V1
  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localStorage.getItem('token');

    console.log('================ HTTP INTERCEPTOR ================');
    console.log('URL:', request.url);
    console.log('TOKEN:', token);
    console.log('TOKEN LENGTH:', token?.length);
    console.log('===================================================');

    if (token && !request.url.includes('/myschool/api/auth/signin')) {
      request = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + token)
      });
    }
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.localStorage.clear();
            this.router.navigate(['/']);
          }
        }
        return throwError(() => err?.error);
      })
    )

  } */

  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const v2Token = this.localStorage.getItem('v2_access_token');
    const v1Token = this.localStorage.getItem('token');

    const isV2Session = !!v2Token;
    const token = v2Token ?? v1Token;


    console.log('================ HTTP INTERCEPTOR ================');
    console.log('URL:', request.url);
    console.log('V1 TOKEN:', v1Token);
    console.log('V2 TOKEN:', v2Token);
    console.log('SESSION:', isV2Session ? 'V2' : 'V1');
    console.log('TOKEN USED:', token);
    console.log('===================================================');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((err) => {

        if (err instanceof HttpErrorResponse) {

          if (err.status === 401) {

            if (isV2Session) {
              this.localStorage.removeItem('v2_access_token');
              this.localStorage.removeItem('v2_tenant_uuid');
              this.localStorage.removeItem('v2_organization_uuid');
              this.localStorage.removeItem('v2_user');
              this.localStorage.removeItem('v2_organizations');

              this.router.navigate(['/']);
            } else {
              this.localStorage.clear();
              this.router.navigate(['/']);
            }
          }

          return throwError(() => err);
        }

        return throwError(() => err);
      })
    );
  }


}
