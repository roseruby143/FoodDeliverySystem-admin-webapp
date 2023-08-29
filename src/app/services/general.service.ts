import { Restaurant } from './../model/restaurant';
import { map, Observable, tap } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor() { }

  /* ********* For Sorting Table ********** */
  booleanValue: any = true;
  modifiedBy : string = 'id';

  //Function for sorting the dish table with columns
  sort(data:any, colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    if (boolean == true){
      //console.log(colName);
      data.sort((a:any, b:any) => a[colName] < b[colName] ? 1 : a[colName] > b[colName] ? -1 : 0)
    }
    else{
      //console.log(colName);
      data.sort((a:any, b:any) => a[colName] > b[colName] ? 1 : a[colName] < b[colName] ? -1 : 0)
    }
  }

  //Function for sorting the observable table with columns
  sortObservable(data:Observable<Restaurant[]>, colName:string, boolean:boolean) {
    this.modifiedBy = colName;
    //console.log(`Sort function boolean : ${boolean}`)
    if (boolean == true){
      //console.log(colName);
      data.pipe(
        /* tap(results => {
          results.sort()}), */
        map(results => 
          {
            //console.log(results);
            //const colNameA = a[colName].toL
            return results.sort((a:any, b:any) =>  a.colName < b.colName ? 1 : a.colName > b.colName ? -1 : 0)
          }
          )
        );
      //data.sort((a:any, b:any) => a[colName] < b[colName] ? 1 : a[colName] > b[colName] ? -1 : 0)
    }
    else{
      //console.log(colName);
      data.pipe(
        /* tap(results => {
          results.sort()}), */
        map(results => 
          {
            //console.log(results);
            return results.sort((a:any, b:any) => a.colName > b.colName ? 1 : a.colName < b.colName ? -1 : 0)
          }
        )
      );
      //data.sort((a:any, b:any) => a[colName] > b[colName] ? 1 : a[colName] < b[colName] ? -1 : 0)
    }
  }
}
