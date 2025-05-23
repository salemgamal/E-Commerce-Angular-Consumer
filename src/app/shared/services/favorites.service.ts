import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { IProduct } from '../Models/Product';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  baseUrl = environment.baseURL;

  constructor(private http: HttpClient) { }

  getFavorites() {
    return this.http.get<IProduct[]>(`${this.baseUrl}Favourites`);
  }

  addToFavorites(productId: number) {
    return this.http.post(`${this.baseUrl}Favourites/${productId}`, {});
  }

  removeFromFavorites(productId: number) {
    return this.http.delete(`${this.baseUrl}Favourites/${productId}`);
  }

  isFavorite(productId: number) {
    return this.http.get<boolean>(`${this.baseUrl}Favourites/check/${productId}`);
  }
} 