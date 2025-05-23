import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { BasketService } from '../basket/basket.service';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private basketService: BasketService
  ) {
    // Initialize user name from auth service on construction
    const username = this.authService.getUsername();
    if (username) {
      this.name.next(username);
    }
  }
  
  baseURL = environment.baseURL;
  private name = new BehaviorSubject<string>('');
  userName$ = this.name.asObservable();

  logout() {
    // If there's no token, just perform local logout
    if (!this.authService.getToken()) {
      this.name.next('');
      this.authService.logout();
      this.basketService.deleteBasket(); // Clear basket on logout
      return of(null);
    }

    return this.http.post(this.baseURL + 'auth/logout', {}).pipe(
      map(() => {
        this.name.next('');
        this.basketService.deleteBasket(); // Clear basket on logout
        this.authService.logout(); // This will clear the token and redirect
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.name.next('');
        this.basketService.deleteBasket(); // Clear basket even on error
        this.authService.logout(); // Still logout even if API call fails
        return of(null);
      })
    );
  }

  getUserName(): Observable<any> {
    // If not authenticated, don't make the API call
    if (!this.authService.isAuthenticated()) {
      this.name.next('');
      return of(null);
    }

    return this.http.get(this.baseURL + 'auth/user-info').pipe(
      map((value: any) => {
        if (value && value.name) {
          this.name.next(value.name);
          return value;
        } else {
          this.name.next('');
          return null;
        }
      }),
      catchError(error => {
        console.error('Get user name error:', error);
        this.name.next('');
        return of(null);
      })
    );
  }
}
