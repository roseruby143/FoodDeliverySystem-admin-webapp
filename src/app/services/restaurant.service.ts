import { Dish } from './../model/dish';
import { Restaurant } from './../model/restaurant';
import { environment } from './../../environments/environment';
import { catchError, EMPTY, Observable, Subject, merge, scan, map, BehaviorSubject, combineLatest, concatMap, tap, shareReplay,of } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action } from '../shared/action';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(private _httpClient : HttpClient) { }
  headers = new HttpHeaders({'Content-Type' : 'application/json'});

  allRestaurant$ = this._httpClient.get<Restaurant[]>(`${environment.baseUrl}/v1/restaurant`,{headers:this.headers}).pipe(
    //catchError(this.errorHandle)
  );

  private restaurantModifiedSubject = new Subject<Action<Restaurant>>();
  restaurantModifiedAction$ = this.restaurantModifiedSubject.asObservable();

  restaurantWithCRUD$ = merge(
    this.allRestaurant$,
    this.restaurantModifiedAction$
    .pipe(
      concatMap(operation => this.saveRestaurant(operation))
    )).pipe(
      scan((acc, value) => 
        (value instanceof Array) ? [...value] : this.modifyRestaurant(acc, value), [] as Restaurant[]),
    shareReplay(1)
    //,tap(data => console.log(JSON.stringify(data)))
  );

  saveRestaurant(operation: Action<Restaurant>): Observable<Action<Restaurant>> {
    const restaurant = operation.item;
    //console.log('saverestaurant', JSON.stringify(operation.item));
    if (operation.action === 'add') {
      // Assigning the id to null is required for the inmemory Web API
      // Return the restaurant from the server
      return this._httpClient.post<Restaurant>(`${environment.baseUrl}/v1/restaurant`, { ...restaurant, id: null }, { headers: this.headers })
        .pipe(
          map(restaurant => ({ item: restaurant, action: operation.action }))
        );
    }
    if (operation.action === 'delete') {
      const url = `${environment.baseUrl}/v1/restaurant/${restaurant.id}`;
      return this._httpClient.delete<Restaurant>(url, { headers: this.headers })
        .pipe(
          // Return the original restaurant so it can be removed from the array
          map(() => ({ item: restaurant, action: operation.action }))
        );
    }
    if (operation.action === 'update') {
      const url = `${environment.baseUrl}/v1/restaurant/${restaurant.id}`;
      return this._httpClient.put<Restaurant>(url, restaurant, { headers: this.headers })
        .pipe(
          //tap(data => console.log('Updated restaurant: ' + JSON.stringify(data))),
          // Return the original restaurant so it can replace the restaurant in the array
          map(() => ({ item: restaurant, action: operation.action }))
        );
    }
    // If there is no operation, return the restaurant
    return of(operation);
  }

  modifyRestaurant(restaurants: Restaurant[], operation: Action<Restaurant>): Restaurant[] {
    if (operation.action === 'add') {
      // Return a new array with the added restaurant pushed to it
      return [...restaurants, operation.item];
    } else if (operation.action === 'update') {
      // Return a new array with the updated restaurant replaced
      //console.log('after modify', operation.item);
      return restaurants.map(restaurant => restaurant.id === operation.item.id ? operation.item : restaurant)
    } else if (operation.action === 'delete') {
      // Filter out the deleted restaurant
      return restaurants.filter(restaurant => restaurant.id !== operation.item.id);
    }
    return [...restaurants];
  }

  addRestaurant(newRestaurant: Restaurant): void {
    newRestaurant = newRestaurant;
    this.restaurantModifiedSubject.next({
      item: newRestaurant,
      action: 'add'
    });
  }

  deleteRestaurant(selectedRestaurant: Restaurant): void {
    this.restaurantModifiedSubject.next({
      item: selectedRestaurant,
      action: 'delete'
    });
  }

  updateRestaurant(selectedRestaurant: Restaurant): void {
    // Update a copy of the selected restaurant
    this.restaurantModifiedSubject.next({
      item: selectedRestaurant,
      action: 'update'
    });
  }

  /* addNewRestaurant(data : Restaurant){
    this.restaurantInsertSubject.next(data);
  } */

  private selectedRestaurantSubject = new BehaviorSubject<number>(0);
  selectedRestaurantAction$ = this.selectedRestaurantSubject.asObservable();

  selectedRestaurantData$ = combineLatest([this.allRestaurant$, this.selectedRestaurantAction$])
  .pipe(
    map(([restaurants, selectedRestaurantId]) => restaurants.find(
      (restaurant) => restaurant.id === selectedRestaurantId))
  );
  
  selectedRestaurantChanged(restId:number){
    this.selectedRestaurantSubject.next(restId);
  }

  /* Get All Restaurants*/
  /* getAllRestaurants():Observable<Restaurant[]> {
    return 
  } */

  /* Get Restaurants by Id*/
  getRestaurantData(restId:number):Observable<Restaurant> {
    return this._httpClient.get<Restaurant>(`${environment.baseUrl}/v1/restaurant/${restId}`,{headers:this.headers});
  }

  /* Add new Restaurant or Edit Restaurants with Id */
  addEditRestaurant(restData:Restaurant,action:string):void{
    //console.log(`Inside addRestaurant of Restaurant Servive : ${JSON.stringify(restData)}`)
    if(action === 'update')
      this._httpClient.put<Restaurant>(`${environment.baseUrl}/v1/restaurant/${restData.id}`,restData,{headers:this.headers}).subscribe({
          next : data => {
          //console.log(`Update : ${JSON.stringify(data)}`);
          //this.restaurantInsertSubject.next(data);
        },
        error : err => {
          //console.log(err);
        }
      });
    else
      //this.addNewRestaurant(restData);
      this._httpClient.post<Restaurant>(`${environment.baseUrl}/v1/restaurant`,restData,{headers:this.headers}).subscribe({
        next : data => {
          //console.log(`Add : ${JSON.stringify(data)}`);
          //this.restaurantInsertSubject.next(data);
        },
        error : err => {
          //console.log(err);
        }
      });
  }

  /* Delete Restaurants by id*/
  deleteRestaurantById(id:Restaurant):Observable<Restaurant>{
    return this._httpClient.delete<Restaurant>(`${environment.baseUrl}/v1/restaurant/${id}`,{headers:this.headers});
  }

  /************************************** Dishes CRUD Operations *******************************/
  /* Get All Dishes*/
  getAllDishes():Observable<Dish[]> {
    return this._httpClient.get<Dish[]>(`${environment.baseUrl}/v1/dishes`,{headers:this.headers});
  }

  /* Get Dishes By Restaurant Id*/
  getDishesByRestaurantId(restId:number):Observable<Dish[]> {
    return this._httpClient.get<Dish[]>(`${environment.baseUrl}/v1/restaurant/${restId}/dishes`,{headers:this.headers});
  }

  /* Get Dishes By Restaurant Id*/
  getDishesByDishId(dishId:number):Observable<Dish> {
    return this._httpClient.get<Dish>(`${environment.baseUrl}/v1/dishes/${dishId}`,{headers:this.headers});
  }

  /* Add new Dishes or Edit Dishes with Id */
  addEditDish(dishData:Dish,action:string):Observable<Dish>{
    if(action === 'update')
      return this._httpClient.put<Dish>(`${environment.baseUrl}/v1/dishes/${dishData.dishId}`,dishData,{headers:this.headers});
    else
      return this._httpClient.post<Dish>(`${environment.baseUrl}/v1/restaurant/${dishData.restaurant.id}/dishes`,dishData,{headers:this.headers});
  }

  /* Delete Dish by id*/
  deleteDish(id:number):Observable<Dish>{
    return this._httpClient.delete<Dish>(`${environment.baseUrl}/v1/dishes/${id}`,{headers:this.headers});
  }

  private errorHandle(err : HttpErrorResponse):Observable<never>{
    let errMessage:string;
    if(err.error instanceof ErrorEvent){
      errMessage = err.error.message
    }else{
      errMessage = err.message
    }
    //console.log(`service error : ${errMessage}`);
    return EMPTY;
  }
}
