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
      this.clearAllUserData();
      return of(null);
    }

    return this.http.post(this.baseURL + 'auth/logout', {}).pipe(
      map(() => {
        this.clearAllUserData();
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAllUserData();
        return of(null);
      })
    );
  }

  private clearAllUserData() {
    // Clear user name
    this.name.next('');
    
    // Clear basket
    this.basketService.deleteBasket();
    
    // Clear auth data
    this.authService.logout();
    
    // Clear any stored favorites or other user data from localStorage
    if (typeof window !== 'undefined') {
      // Clear any additional user-related data from localStorage
      localStorage.removeItem('basketId');
      localStorage.removeItem('favorites');
      // Add any other user-related data that needs to be cleared
    }
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
