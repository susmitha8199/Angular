import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface User {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService  {

private baseUrl = 'http://localhost:8080/api/user';

  constructor(private http: HttpClient) { }

  register(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user,  { responseType: 'text' });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }, { responseType: 'text' });
  }

}
