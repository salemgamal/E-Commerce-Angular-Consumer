import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPagnation } from '../shared/Models/Pagnation';
import { ICateogry } from '../shared/Models/Category';
import { ProductParam } from '../shared/Models/ProductParam';
import { IProduct } from '../shared/Models/Product';
import { environment } from '../../environments/environment.development';
import { IReview } from '../shared/Models/review';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  constructor(private http: HttpClient) { }

  baseURL = environment.baseURL.endsWith('/') ? environment.baseURL : environment.baseURL + '/';

  getProduct(productParam: ProductParam) {
    let param = new HttpParams();
    
    if (productParam.CategoryId !== undefined && productParam.CategoryId !== null && productParam.CategoryId !== 0) {
      param = param.append("CategoryId", productParam.CategoryId.toString());
    }
    
    if (productParam.Sort) {
      param = param.append("Sort", productParam.Sort);
    }
    
    if (productParam.Search) {
      param = param.append("Search", productParam.Search);
    }
    
    if (productParam.PageSize) {
      param = param.append("PageSize", productParam.PageSize.toString());
    }
    
    if (productParam.PageNumber) {
      param = param.append("PageNumber", productParam.PageNumber.toString());
    }

    const url = `${this.baseURL}Product`;
    console.log('Making API request to:', url);
    console.log('With params:', param.toString());

    return this.http.get<IPagnation>(url, { params: param })
      .pipe(
        tap(response => console.log('API Response:', response)),
        catchError(error => {
          console.error('API Error:', error);
          if (error.status === 0) {
            console.error('Cannot connect to the API. Please ensure the API is running.');
          }
          return throwError(() => new Error(error.message || 'Failed to load products'));
        })
      );
  }

  getCategory() {
    const url = `${this.baseURL}Categories`;
    console.log('Fetching categories from:', url);
    return this.http.get<ICateogry[]>(url)
      .pipe(
        tap(response => console.log('Categories Response:', response)),
        catchError(error => {
          console.error('Categories Error:', error);
          if (error.status === 0) {
            console.error('Cannot connect to the API. Please ensure the API is running.');
          }
          return throwError(() => new Error(error.message || 'Failed to load categories'));
        })
      );
  }

  getProductDetails(id: number) {
    const url = `${this.baseURL}Product/${id}`;
    return this.http.get<IProduct>(url)
      .pipe(
        catchError(error => {
          console.error('Product Details Error:', error);
          return throwError(() => new Error(error.message || 'Failed to load product details'));
        })
      );
  }

  getProductRating(id: number) {
    const url = `${this.baseURL}Product/ratings/${id}`;
    return this.http.get<IReview[]>(url)
      .pipe(
        catchError(error => {
          console.error('Product Ratings Error:', error);
          return throwError(() => new Error(error.message || 'Failed to load product ratings'));
        })
      );
  }
}
