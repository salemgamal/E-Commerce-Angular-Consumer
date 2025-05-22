import { environment } from './../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActiveAccount } from '../shared/Models/ActiveAccount';
import { ResetPassword } from '../shared/Models/ResetPassowrd';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

interface LoginResponse {
  token: string;
  // add other response properties if any
}

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  baseURL = environment.baseURL;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  register(form:any){
    console.log('Sending registration request to:', this.baseURL + "auth/register");
    console.log('Registration data:', form);
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    
    return this.http.post(
      this.baseURL + "auth/register", 
      {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        city: form.city,
        country: form.country
      },
      { headers: headers }
    ).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }
  
  active(param:ActiveAccount){
    return this.http.post(this.baseURL + "auth/active-account", param);
  }
  
  Login(form:any){
    console.log('Sending login request to:', this.baseURL + "auth/login");
    console.log('Login data:', { email: form.email, password: form.password });
    
    const loginModel = {
      email: form.email,
      password: form.password
    };

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    
    return this.http.post<LoginResponse>(this.baseURL + "auth/login", loginModel, { headers }).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.token) {
          this.authService.setToken(response.token);
          console.log('Token stored successfully');
        } else {
          console.warn('No token in response');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }
  
  forgetPassword(email:string){
    return this.http.get(this.baseURL + `auth/send-email-forget-password?email=${email}`);
  }
  
  ResetPassword(param:ResetPassword){
    return this.http.post(this.baseURL + "auth/reset-password", param);
  }
}
