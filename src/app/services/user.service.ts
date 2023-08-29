import { Address } from './../model/address';
import { environment } from './../../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, BehaviorSubject, EMPTY, forkJoin, map, shareReplay, tap } from 'rxjs';
import { User } from './../model/user';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private _httpClient : HttpClient) { }

  private _headers = new HttpHeaders({'Content-Type' : 'application/json'});

  userIdToEdit!:number;
  setUserIdToEdit(userId: number | null) {
    //console.log(`userId : ${userId}`);
    if(userId && userId > 0){
      this._userIdSubject.next(userId);
      this.userIdToEdit = userId;
    }
    //this._filterRestNameSubject.next(value.toLocaleLowerCase());
  }

  getUserIdToEdit():number{
    return this.userIdToEdit;
  }

  private _userIdSubject = new BehaviorSubject<number | null>(null);
  userIdToBeFetched$ = this._userIdSubject.asObservable();

  userDatawithAddress$ = this.userIdToBeFetched$.pipe(
    switchMap(userId => {
      if(userId === null){
        return EMPTY;
      }
      return this._httpClient.get<User>(`${environment.baseUrl}/v1/user/${userId}`, { headers: this._headers }).pipe(
        switchMap(user => {
          //const addressesObservable: Observable<Address[]>;
          //console.log(JSON.stringify(user));
          return this._httpClient.get<Address[]>(`${environment.baseUrl}/v1/user/${user.id}/address`, { headers: this._headers }).pipe(
            map(data => {
              return { user: {...user}, addresses: data }
            }),
            tap(data => console.log(JSON.stringify(data)))
            
          );
          //addressesObservable.push(addressObservable);
          /* return forkJoin(addressObservable).pipe(
            map(addressArray => {
              // Now you have an array of order items arrays, where each array corresponds to order items for a specific order
              // You can associate the order items with their respective orders here and return the result
              // For example:
              return { user: {...user}, addresses: addressArray };
            })
          ); */
        })
      )
      .pipe(
        shareReplay(1)
      )
    })
  );
  //.pipe(tap(data => console.log(`Order Data : ${JSON.stringify(data)}`)));

  /* Get All Users*/
  getAllUsers():Observable<User[]> {
    return this._httpClient.get<User[]>(`${environment.baseUrl}/v1/user`,{headers:this._headers});
  }

  /* Get Users by Id*/
  getUserData(userId:number):Observable<User> {
    return this._httpClient.get<User>(`${environment.baseUrl}/v1/user/${userId}`,{headers:this._headers});
  }

  /* Add new User or Edit Users with Id */
  addEditUser(userData:User,action:string):Observable<User>{
    if(action === 'update')
      return this._httpClient.put<User>(`${environment.baseUrl}/v1/user/${userData.id}`,userData,{headers:this._headers});
    else
      return this._httpClient.post<User>(`${environment.baseUrl}/v1/user/register`,userData,{headers:this._headers});
  }

  /* Delete Users is not permitted*/
  
}
