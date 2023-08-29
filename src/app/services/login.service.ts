import { Admin } from './../model/admin';
import { Observable, tap } from 'rxjs';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private _httpClient : HttpClient) { }

  private _headers = new HttpHeaders({'Content-Type' : 'application/json'});

  adminLogin(adminReq:any):Observable<any> {
    return this._httpClient.post<any>(`${environment.baseUrl}/v1/admin/login`, adminReq);
  }

  adminRegister(adminReq:Admin):Observable<any> {
    return this._httpClient.post<Admin>(`${environment.baseUrl}/v1/admin`, adminReq);
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
  
  onLogOut(adminId:number) {
    return this._httpClient.post<any>(`${environment.baseUrl}/v1/user/${adminId}/logout`,{id:adminId},{headers:this._headers})
    .pipe(tap(data => console.log(`logout response : ${data}`)));
  }
}
