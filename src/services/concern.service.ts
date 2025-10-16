import { HttpClient, HttpParams } from '@angular/common/http';
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
  private concernUrl = 'http://localhost:8080/api/user';

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
  
  searchConcerns(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search?keyword=${keyword}`);
  }

  updateUserRole(email: string, role: string): Observable<any> {
    const body = { email, role }; 
    return this.http.post(`${this.concernUrl}/role`, body); 
  }

  fetchConcernsPaged(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get(`${this.baseUrl}/paged?page=${page}&size=${size}`);
  }

  addComment(concernId: number, comment: string, userRole: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/${concernId}/comments`, { comment, userRole }, { responseType: 'text' });
  }

  getComments(concernId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${concernId}/comments`);
  }

  deleteComment(commentId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/comments/${commentId}`, { responseType: 'text' });
  }

  updateStatus(concernId: number, status: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${concernId}/status`, { status });
  }


}
