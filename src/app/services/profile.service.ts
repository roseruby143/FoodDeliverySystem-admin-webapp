import { Admin } from './../model/admin';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private _httpClient : HttpClient) { }

  private _headers = new HttpHeaders({'Content-Type' : 'application/json'});

  getAdminById(adminId:number):Observable<Admin> {
    return this._httpClient.get<Admin>(`${environment.baseUrl}/v1/admin/${adminId}`, {headers : this._headers});
  }

  getAdminByEmail(email:string):Observable<Admin> {
    return this._httpClient.get<Admin>(`${environment.baseUrl}/v1/admin/${email}`, {headers : this._headers});
  }

  /* Edit Admin with Id */
  editAdmin(data:Admin):Observable<Admin>{
    return this._httpClient.put<Admin>(`${environment.baseUrl}/v1/admin`,data,{headers:this._headers});
  }
}
