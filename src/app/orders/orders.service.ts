import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { IOrder } from '../shared/Models/Order';
import { IRating } from '../shared/Models/rating';
import { AuthService } from '../shared/services/auth.service';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(private http: HttpClient, private authService: AuthService) {}
  private baseUrl = 'https://localhost:7182/api';

  getCurrentOrderForUser(id: number): Observable<IOrder> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<IOrder>(`${this.baseUrl}/Orders/${id}`);
  }

  getAllOrderForUser(): Observable<IOrder[]> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<IOrder[]>(`${this.baseUrl}/Orders`);
  }

  addrating(rate: IRating) {
    return this.http.post(`${this.baseUrl}/Ratings/add-rating`, rate);
  }
}
