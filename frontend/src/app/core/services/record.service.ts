// core/services/record.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecordsResponse, Record } from '../models/record.model';

export interface SingleRecordResponse {
  success: boolean;
  data: Record;
}

@Injectable({ providedIn: 'root' })
export class RecordService {

  private readonly apiUrl = `${environment.apiUrl}/records`;

  constructor(private http: HttpClient) {}

  /**
   * Retrieve records scoped to current user/role.
   * Pass delayMs to trigger async simulation via ?delay=<ms>.
   */
  getAll(delayMs?: number): Observable<RecordsResponse> {
    let params = new HttpParams();
    if (delayMs && delayMs > 0) { params = params.set('delay', delayMs.toString()); }
    return this.http.get<RecordsResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<SingleRecordResponse> {
    return this.http.get<SingleRecordResponse>(`${this.apiUrl}/${id}`);
  }
}
