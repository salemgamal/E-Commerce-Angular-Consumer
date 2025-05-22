import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

export interface IFavourite {
  id: number;
  productId: number;
  userId: string;
  name: string;
  newPrice: number;
  photos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private baseUrl = environment.baseURL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getFavourites(): Observable<IFavourite[]> {
    console.log('Getting favorites...');
    try {
      return this.http.get<IFavourite[]>(`${this.baseUrl}favourites`, {
        headers: this.getHeaders()
      }).pipe(
        tap(response => {
          console.log('Favorites response:', response);
        })
      );
    } catch (error) {
      console.error('Error in getFavourites:', error);
      return throwError(() => error);
    }
  }

  addToFavourites(productId: number): Observable<string> {
    console.log('Adding to favorites, productId:', productId);
    try {
      return this.http.post(`${this.baseUrl}favourites/${productId}`, {}, {
        headers: this.getHeaders(),
        responseType: 'text'
      }).pipe(
        tap(response => {
          console.log('Add to favorites response:', response);
        })
      );
    } catch (error) {
      console.error('Error in addToFavourites:', error);
      return throwError(() => error);
    }
  }

  removeFromFavourites(productId: number): Observable<string> {
    console.log('Removing from favorites, productId:', productId);
    try {
      return this.http.delete(`${this.baseUrl}favourites/${productId}`, {
        headers: this.getHeaders(),
        responseType: 'text'
      }).pipe(
        tap(response => {
          console.log('Remove from favorites response:', response);
        })
      );
    } catch (error) {
      console.error('Error in removeFromFavourites:', error);
      return throwError(() => error);
    }
  }
} 