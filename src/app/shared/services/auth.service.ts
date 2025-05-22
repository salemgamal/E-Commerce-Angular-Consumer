import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface DecodedToken {
  uid: string;  // user ID claim
  unique_name: string; // username claim
  email: string;
  exp: number;
  // add other claims as needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';  // key used to store token in localStorage
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getLocalStorage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  setToken(token: string) {
    const storage = this.getLocalStorage();
    if (storage) {
      console.log('Setting token in localStorage');
      storage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    const storage = this.getLocalStorage();
    if (!storage) return null;

    const token = storage.getItem(this.tokenKey);
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return token;
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log('No token available for getting user ID');
      return null;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      console.log('Decoded token:', decodedToken);
      console.log('User ID from token:', decodedToken.uid);
      return decodedToken.uid;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.unique_name;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch {
      return false;
    }
  }

  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.uid || null;
    } catch {
      return null;
    }
  }

  logout() {
    console.log('Logging out user');
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/']);
  }

  // Helper method to check what's in localStorage
  debugTokenStorage() {
    const storage = this.getLocalStorage();
    if (!storage) {
      console.log('Storage not available (not in browser context)');
      return;
    }

    console.log('All localStorage keys:', Object.keys(storage));
    console.log('Token in localStorage:', storage.getItem(this.tokenKey));
    try {
      if (storage.getItem(this.tokenKey)) {
        const decoded = jwtDecode<DecodedToken>(storage.getItem(this.tokenKey)!);
        console.log('Decoded token contents:', decoded);
      }
    } catch (error) {
      console.error('Error debugging token:', error);
    }
  }
} 