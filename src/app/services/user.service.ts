import { environment } from './../../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './../model/user';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private _httpClient : HttpClient) { }

  headers = new HttpHeaders({'Content-Type' : 'application/json'});

  /* Get All Users*/
  getAllUsers():Observable<User[]> {
    return this._httpClient.get<User[]>(`${environment.baseUrl}/v1/user`,{headers:this.headers});
  }

  /* Get Users by Id*/
  getUserData(userId:number):Observable<User> {
    return this._httpClient.get<User>(`${environment.baseUrl}/v1/user/${userId}`,{headers:this.headers});
  }

  /* Add new User or Edit Users with Id */
  addEditUser(userData:User,action:string):Observable<User>{
    if(action === 'update')
      return this._httpClient.put<User>(`${environment.baseUrl}/v1/user/${userData.id}`,userData,{headers:this.headers});
    else
      return this._httpClient.post<User>(`${environment.baseUrl}/v1/user`,userData,{headers:this.headers});
  }

  /* Delete Users is not permitted*/
  
}
