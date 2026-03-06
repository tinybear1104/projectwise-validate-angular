import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'refresh_token';

  constructor(private http: HttpClient) {}

  // ---- LOGIN ----
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/login', credentials).pipe(
      tap((response: any) => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      })
    );
  }

  // ---- TOKEN STORAGE ----
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  // ---- LOGOUT ----
  logout(): void {
    this.clearTokens();
  }

  // ---- TOKEN DECODING ----
  decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  // ---- EXPIRATION CHECK ----
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  // ---- REFRESH TOKEN ----
  refreshToken(): Observable<any> {
    return this.http.post('/api/auth/refresh', {
      refreshToken: this.getRefreshToken()
    }).pipe(
      tap((response: any) => {
        this.setToken(response.accessToken);
      })
    );
  }

  // ---- AUTH CHECK ----
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }
}
