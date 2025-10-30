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

export enum ReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE'
}

@Injectable({
  providedIn: 'root'
})
export class ConcernService {
  private baseUrl = 'http://localhost:8080/api/user';
  private concernUrl = 'http://localhost:8080/api/concerns';
  private commentUrl = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) { }

  fetchConcerns(): Observable<Concern[]> {
    return this.http.get<Concern[]>(`${this.concernUrl}/all`);
  }

  uploadConcern(concern: any): Observable<any> {
    return this.http.post(`${this.concernUrl}/add`, concern);
  }

  locationBasedConcerns(location: string): Observable<Concern[]> {
    return this.http.get<Concern[]>(`${this.concernUrl}/location/${location}`);
  }
  
  statusBasedConcerns(status: string): Observable<Concern[]> {
    return this.http.get<Concern[]>(`${this.concernUrl}/status/${status}`);
  }
  
  searchConcerns(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.concernUrl}/search?keyword=${keyword}`);
  }

  updateUserRole(email: string, role: string): Observable<any> {
    const body = { email, role }; 
    return this.http.post(`${this.baseUrl}/role`, body, { responseType: 'text' }); 
  }

  fetchConcernsPaged(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get(`${this.concernUrl}/paged?page=${page}&size=${size}`);
  }

  addComment(concernId: number, comment: string, userRole: string): Observable<string> {
    return this.http.post(`${this.commentUrl}/${concernId}/comments`, { comment, userRole }, { responseType: 'text' });
  }

  getComments(concernId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.commentUrl}/${concernId}/comments`);
  }

  deleteComment(commentId: number): Observable<string> {
    return this.http.delete(`${this.commentUrl}/comments/${commentId}`, { responseType: 'text' });
  }

  reactToComment(commentId: number, username: string, type: ReactionType): Observable<Comment> {
    return this.http.post<Comment>(`${this.commentUrl}/reactions/${commentId}/react`, null, {
      params: { username, type }
    });
  }

  updateStatus(concernId: number, status: string): Observable<any> {
    return this.http.post(`${this.concernUrl}/${concernId}/status`, { status });
  }

  getStatusCounts(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.concernUrl}/status-counts`);
  }


}
