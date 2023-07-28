import { environment } from './../../environments/environment.prod';
import { Observable } from 'rxjs';
import { Driver } from './../model/driver';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(private _httpClient : HttpClient) { }

  headers = new HttpHeaders({'Content-Type' : 'application/json'});

  /* Get All Drivers*/
  getAllDrivers():Observable<Driver[]> {
    return this._httpClient.get<Driver[]>(`${environment.baseUrl}/v1/driver`,{headers:this.headers});
  }

  /* Get Drivers by Id*/
  getDriverData(driverId:number):Observable<Driver> {
    return this._httpClient.get<Driver>(`${environment.baseUrl}/v1/driver/${driverId}`,{headers:this.headers});
  }

  /* Add new Driver or Edit Drivers with Id */
  addEditDriver(driverData:Driver,action:string):Observable<Driver>{
    if(action === 'update')
      return this._httpClient.put<Driver>(`${environment.baseUrl}/v1/driver/${driverData.id}`,driverData,{headers:this.headers});
    else
      return this._httpClient.post<Driver>(`${environment.baseUrl}/v1/driver`,driverData,{headers:this.headers});
  }

  /* Delete Drivers is not allowed*/
  
}
