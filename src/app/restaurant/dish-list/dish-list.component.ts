import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from './../../services/general.service';
import { Dish } from './../../model/dish';
import { RestaurantService } from './../../services/restaurant.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-dish-list',
  templateUrl: './dish-list.component.html',
  styleUrls: ['./dish-list.component.css']
})
export class DishListComponent implements OnInit {

  private _sub:Subscription | undefined;

  allDishes : Dish[] = [];
  restaurantName:string | null= null;

  /***** for filter with dish name *******/
  filteredDishes: Dish[] = [];
  private _listFilter = '';
  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredDishes = this.listFilter ? this.performFilter(this.listFilter) : this.allDishes;
  }

  /* ********* For Sorting Table ********** */
  booleanValue: any = true;
  modifiedBy : string = 'id';

  /****** Error message while fetching data *****/
  errorMessage = ';'

  /********** For Showing image ******** */
  showImage = false;
  imageWidth = 50;
  imageMargin = 2;

  /* ******** For Pagination ******* */
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  //tableSizes: any = [3, 6, 9, 12];

  /****** Deleting Dish Data *******/
  dishInfo : Dish | undefined;

  constructor(private _route:ActivatedRoute, private _restService: RestaurantService, private _generalService:GeneralService, private _restModalService : NgbModal, private _router : Router) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchDishes();
  }

  ngOnDestroy() : void{
    this._sub!.unsubscribe();
  }

  fetchDishes(){
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          {
            this.getDishesForRestaurant(id);
          }
        else{
          this.restaurantName = null;
          this.getAllDishes();
        }
      }
    );
  }

  getDishesForRestaurant(restId : number){
    //console.log(`Start fetching dishes data for restaurant id: ${restId}`);
    this._restService.getDishesByRestaurantId(restId).subscribe({
      next: dishes => {
        //console.log(`Dishes data fetched from backend for restaurant Id : \n${restId} : ${JSON.stringify(dishes)}`);
        this.allDishes = dishes;
        this.filteredDishes = this.allDishes;
        this.restaurantName = dishes[0].restaurant.name;
      },
      error: err => {
        //console.log(`error while fetching dishes for restaurant id ${restId} : ${JSON.stringify(err)}`)
        this.errorMessage = err.error.message
      }
    });
  }

  getAllDishes(){
    //console.log(`Start fetching all dishes.`);
    this._restService.getAllDishes().subscribe({
      next: dishes => {
        //console.log(`All Dishes data fetched from backend : ${JSON.stringify(dishes)}`);
        this.allDishes = dishes;
        this.filteredDishes = this.allDishes;
      },
      error: err => {
        console.log(`error while fetching all dishes : ${JSON.stringify(err)}`)
        this.errorMessage = err.error.message;
      }
    });
  }

  // Code for Filter dish list with dish name
  performFilter(filterBy: string): Dish[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allRestaurants)}`);
    return this.allDishes.filter((rest) => {
      return rest.dish_name.toLocaleLowerCase().includes(filterBy)// !== -1
    });
  }

  // Code to sort the table
  sort(columnName:string){
    this.modifiedBy = columnName;
    this._generalService.sort(this.allDishes,columnName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }

  // Code for pagination
  onTableDataChange(event: any) {
    this.page = event;
    this.fetchDishes();
  }

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  openDeleteDishModal(content:any, data:Dish){
    this.dishInfo = data;
    this._restModalService.open(content).result.then(
			(result) => {
				//this._closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				//this._closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
  }

  deleteDish(dish : Dish){
    if(dish){
      //console.log(JSON.stringify(resDataToBeDeleted));
      this._restService.deleteDish(dish.dishId).subscribe({
        next: data => {
          this.allDishes.splice(this.allDishes.indexOf(dish),1); 
          //console.log(JSON.stringify(data));
        },
        error : err => {
          //console.log(err);
          this.errorMessage = err.error.message;
        }
      });
      this.closeModel('deleteDishModal');
    }
  }

  addNewDish(dishId:number){
    const editDishurl = `/dishes/${dishId}`;
    //console.log(`navigating to url : ${editRestauranturl}`);
    this._router.navigateByUrl(editDishurl);
  }

  closeModel(modelRef:any) {
    this._restModalService.dismissAll(modelRef);
  }

}
