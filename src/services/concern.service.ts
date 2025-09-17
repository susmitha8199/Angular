import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Concern {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  status: string;
  comments?: string;
  commentsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConcernService {
  private baseUrl = 'http://localhost:8080/api/concerns';

  constructor(private http: HttpClient) { }

  fetchConcerns(): Observable<Concern[]> {
    return this.http.get<Concern[]>(`${this.baseUrl}/all`);
  }

  uploadConcern(concern: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, concern);
  }

  locationBasedConcerns(location: string): Observable<Concern[]> {
    return this.http.get<Concern[]>(`${this.baseUrl}/location/${location}`);
  }
  
  statusBasedConcerns(status: string): Observable<Concern[]> {
    return this.http.get<Concern[]>(`${this.baseUrl}/status/${status}`);
  }
  
}
