import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private adminTokenSubject = new BehaviorSubject<string | null>(this.getToken());
  adminToken$ = this.adminTokenSubject.asObservable();

  private apiUrl = 'http://localhost:5177/api/admin/auth';

  googleLogin(idToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap(response => {
        if (response && response.token) {
          sessionStorage.setItem('adminToken', response.token);
          this.adminTokenSubject.next(response.token);
        }
      })
    );
  }

  logout() {
    sessionStorage.removeItem('adminToken');
    this.adminTokenSubject.next(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('adminToken');
    }
    return null;
  }

  isAdminAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin' && payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }
}
