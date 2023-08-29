import { async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, Observable, Subject, shareReplay } from 'rxjs';
import { GeneralService } from './../../services/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { RestaurantService } from './../../services/restaurant.service';
import { Restaurant } from './../../model/restaurant';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class RestaurantListComponent /* implements OnInit  */{
  
  private _filterRestNameSubject = new BehaviorSubject<string>('');
  filterRestNameAction$ = this._filterRestNameSubject.asObservable();
  
  private _errorMessageSubject = new Subject<string>();
  errorMessage$ = this._errorMessageSubject.asObservable();

  allRestaurantList!:Restaurant[];
  
  allRestaurants$ = combineLatest([this._restService.restaurantWithCRUD$,this.filterRestNameAction$]).pipe(
    map(([restaurants, filterRestName]) => {
      return restaurants.filter(rest => 
        {
          //console.log(restaurants);
          this.allRestaurantList = restaurants;
          return filterRestName ? rest.name.toLocaleLowerCase().includes(filterRestName.toLocaleLowerCase()) : true
        })
    }),
    catchError(
      err => {
      //console.log(`restaurant list error handler : ${(this.errorMessage$)}`);
      this._errorMessageSubject.next(err.message);
      return EMPTY;
    }),
    shareReplay(1)
  ); 

  
  //filteredRestaurants$ = this.allRestaurants$;
   /* this._restService.allRestaurant$.pipe(
    map(restaurants => {
      restaurants.filter(rest => this.filterRestName ? rest.name === this.filterRestName : true)
    })
  );  */  //! : Observable<Restaurant[]>;
  
  
  restInfo : Restaurant | undefined;
  /* showImage = false;
  imageWidth = 50;
  imageMargin = 2; */

  /* ******** For Pagination ******* */
  page: number = 1;
  count: number = 0;
  tableSize: number = 7;
  //tableSizes: any = [3, 6, 9, 12];

  /* ********* For Sorting Table ********** */
  booleanValue: any = true;
  modifiedBy : string = 'id';

  /* private _listFilter = '';
  private _closeResult = '' */;

  /* get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    //this.filteredRestaurants$ = this.listFilter ? this.performFilter(this.listFilter) : this.allRestaurants$;
  } */

  constructor(private _restService:RestaurantService, private _router : Router, private _restModalService : NgbModal, private _generalService : GeneralService) { }

  /* ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants():void{
    this.allRestaurants$ = this._restService.getAllRestaurants().pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );
    this.filteredRestaurants$ = this.allRestaurants$;
  } */

  onTableDataChange(event: any) {
    this.page = event;
    //this.fetchRestaurants();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    //this.fetchRestaurants();
  }

  openRestaurantAddEdit(id:number){
    const editRestauranturl = `/restaurants/${id}/edit`;
    this._restService.selectedRestaurantChanged(id);
    //console.log(`navigating to url : ${editRestauranturl}`);
    this._router.navigateByUrl(editRestauranturl);
  }

  openDeleteRestaurantModal(content:any, data:Restaurant){
    this.restInfo = data;
    this._restModalService.open(content).result.then(
			(result) => {
				//this._closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				//this._closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
  }

  deleteRestaurant(resDataToBeDeleted:Restaurant){
    this._restService.deleteRestaurant(resDataToBeDeleted);
    this.closeModel('deleteRestaurantModal');
  }

  /* toggleImage(): void {
    this.showImage = !this.showImage;
  } */

  closeModel(modelRef:any) {
    this._restModalService.dismissAll(modelRef);
  }

  performFilter(filterBy: string) {
    //console.log(filterBy);
    this._filterRestNameSubject.next(filterBy.toLocaleLowerCase());

    /* filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allRestaurants)}`);
    return this.allRestaurants$.pipe(map( res => 
      res.filter(rest => rest.name.toLocaleLowerCase().includes(filterBy))
    )); */
    /* filter((rest) => {
      return rest.name.toLocaleLowerCase().includes(filterBy)// !== -1
    }); */
  }

  sort(colName:any, boolean:any) {
    this.modifiedBy = colName;
    //console.log(`Sort col name is : ${colName}`)
    //const data = this.allRestaurants$ | async
    console.log(JSON.stringify(this.allRestaurantList));
    
    this._generalService.sortObservable(this.allRestaurants$ ,colName,boolean);
    this.booleanValue = !this.booleanValue;
  }

}
