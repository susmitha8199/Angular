import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarqueeService {

  private apiUrl = 'http://localhost:8080/api/marquee';

  constructor(private http: HttpClient) { }

  getMarqueeMessage(role: string): Observable<string> {
    return this.http.get(`${this.apiUrl}?role=${role}`, { responseType: 'text' });
  }
  
}
