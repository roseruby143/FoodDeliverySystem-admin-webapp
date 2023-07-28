import { Admin } from './../model/admin';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private _httpClient : HttpClient) { }

  adminLogin(adminReq:any):Observable<Admin> {
    return this._httpClient.post<Admin>(`${environment.baseUrl}/v1/admin/login`, adminReq);
  }

  adminRegister(adminReq:Admin):Observable<any> {
    return this._httpClient.post<any[]>(`${environment.baseUrl}/v1/admin`, adminReq);
  }

  userLogin(userReq:any):Observable<any> {
    return this._httpClient.post<any[]>(`${environment.baseUrl}/v1/user/login`,userReq);
  }

  isLoggedIn():boolean {
    let user = localStorage.getItem('user');
    let status = localStorage.getItem('status');
    return !(!user && !status);
  }

  getUser() {
    return localStorage.getItem('user');
  }
  
  logOut() {
    localStorage.clear();
  }
}
