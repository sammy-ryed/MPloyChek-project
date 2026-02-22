// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginPayload } from '../models/user.model';

const TOKEN_KEY = 'mpoly_token';
const USER_KEY  = 'mpoly_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private _currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  readonly currentUser$: Observable<User | null> = this._currentUser$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Getters ──────────────────────────────────────────────────────────────
  get currentUser(): User | null { return this._currentUser$.getValue(); }
  get token(): string | null     { return sessionStorage.getItem(TOKEN_KEY); }
  get isLoggedIn(): boolean      { return !!this.token && !!this.currentUser; }
  get isAdmin(): boolean         { return this.currentUser?.role === 'Admin'; }

  // ── Login ─────────────────────────────────────────────────────────────────
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => {
        if (res.success) {
          sessionStorage.setItem(TOKEN_KEY, res.token);
          sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this._currentUser$.next(res.user);
        }
      })
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this._currentUser$.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Refresh current user from API ─────────────────────────────────────────
  refreshUser(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res.success) {
          sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this._currentUser$.next(res.user);
        }
      })
    );
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private loadUser(): User | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
