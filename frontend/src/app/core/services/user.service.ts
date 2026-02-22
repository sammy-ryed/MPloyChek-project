// core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CreateUserPayload {
  userId: string;
  password: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all users (Admin only). Supports optional ?delay=<ms>.
   */
  getAll(delayMs?: number): Observable<UsersResponse> {
    let params = new HttpParams();
    if (delayMs && delayMs > 0) { params = params.set('delay', delayMs.toString()); }
    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserPayload): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
