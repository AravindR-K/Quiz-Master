import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate';
  group?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isLoggedIn.set(true);
    }
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        complete: () => this.clearAuth(),
        error: () => this.clearAuth()
      });
    } else {
      this.clearAuth();
    }
  }

  private handleAuth(res: AuthResponse): void {
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return this.currentUser()?.role || null;
  }

  getDashboardRoute(): string {
    const role = this.getUserRole();
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'hr': return '/hr/dashboard';
      case 'candidate': return '/candidate/dashboard';
      default: return '/login';
    }
  }
}
