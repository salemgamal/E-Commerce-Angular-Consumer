import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface ICreateOrder {
  items: IOrderItem[];
}

export interface IOrderItem {
  productId: number;
  quantity: number;
}

export interface IOrderResponse {
  id: number;
  totalAmount: number;
  createdAt: Date;
  userId: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private baseUrl = environment.baseURL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createOrder(order: ICreateOrder): Observable<IOrderResponse> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.post<IOrderResponse>(`${this.baseUrl}orders`, order, {
      headers: this.getHeaders()
    });
  }

  getOrders(): Observable<IOrderResponse[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<IOrderResponse[]>(`${this.baseUrl}orders`, {
      headers: this.getHeaders()
    });
  }

  getOrder(id: number): Observable<IOrderResponse> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<IOrderResponse>(`${this.baseUrl}orders/${id}`, {
      headers: this.getHeaders()
    });
  }
} 