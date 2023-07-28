import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NumberValidator } from './../../shared/number-validator';
import { RestaurantService } from './../../services/restaurant.service';
import { Restaurant } from './../../model/restaurant';
import { ActivatedRoute, Router } from '@angular/router';
import { Dish } from './../../model/dish';
import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef, TemplateRef } from '@angular/core';

@Component({
  selector: 'fds-dish-edit',
  templateUrl: './dish-edit.component.html',
  styleUrls: ['./dish-edit.component.css']
})
export class DishEditComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  // For Form in the page
  title:string = '';
  dishInfo:Dish | undefined | null;
  dishListForm!: FormGroup;
  editDish:boolean = false;
  errorMessage:string='';
  listOfRestaurants$! : Observable<Restaurant[]>// = [];
  
  addDishImage: any;

  constructor(private _route:ActivatedRoute, private _fb : FormBuilder, private _resService: RestaurantService, private _router: Router, private _restModalService : NgbModal) {
    this._validationMessages = {
     name : {
        required : 'Please enter the name of the dish'
      },
      price : {
        required : 'Please enter the price',
        price : 'Enter a valid amount without currancy symbol.'
      },
      restaurant : {
        required : 'Please select a restaurant'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
   }

  ngOnInit(): void {
    this.initializeNewForm();
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        console.log(`id is : ${id}`);
        if(id > 0)
          this.getDishData(id);
        else{
          this.addDishImage = '../../../assets/img/add-dish.png';
          this.dishInfo = null;
          this.dishListForm!.reset();
          this.title = 'Add New Dish';
        }
      }
    );
  }

  ngOnDestroy() : void{
    this.errorMessage = '';
    this._sub!.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.dishListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.dishListForm);
    });
  }

  initializeNewForm(){
    this.dishListForm = this._fb.group({
      dishId : [0],
      dish_name : ['', Validators.required],
      price : ['', [Validators.required, NumberValidator.price()]],
      restaurant : ['', Validators.required],
      description : [''],
      dishImageUrl : ['']
    });

    this.listOfRestaurants$ = this._resService.allRestaurant$;

    /* this._resService.getAllRestaurants().subscribe({
      next: data => {
        this.listOfRestaurants = data;
        //this._getDataService.bookingListFromService = data; 
      },
      error : err => {
        this.errorMessage = err.console.error.message;
        //console.log(err)
      }
    }); */
  }

  getDishData(dishId : number){
    this._resService.getDishesByDishId(dishId).subscribe({
      next : data => {
        //console.log(`********* dish data is : ${JSON.stringify(data)}`);
        this.dishInfo = data
        this.dishDisplay()
      },
      error : err => {
        this.addDishImage = '../../../assets/img/add-dish.png';
        this.errorMessage = err.error.message;
        //console.log(err);
        //this._router.navigate(['/dishes',dishId]);
      }
    });
  }

  dishDisplay(){
    if(this.dishListForm){
      this.dishListForm.reset();
    }
    this.title = `${this.dishInfo!.dish_name}`;
    //console.log(this.dishInfo!.dishImageUrl);
    this.dishListForm.patchValue({
      dishId : this.dishInfo!.dishId!,
      dish_name : this.dishInfo!.dish_name!,
      price : this.dishInfo!.price,
      restaurant : this.dishInfo!.restaurant.id,//`${data.restaurant.id} - ${data.restaurant.name}`,
      description : this.dishInfo!.description!,
      dishImageUrl : this.dishInfo!.dishImageUrl!
    });

  }

  onFormSubmit(){
    if(this.dishListForm.valid){
      if(this.dishListForm.dirty){
        let restId = this.dishListForm.value.restaurant;
        this.dishListForm.value.restaurant = {'id':restId};
        const dishData = {...this.dishInfo, ...this.dishListForm.value};
        let action:string = 'update';
        if(!this.dishListForm.value.id){
          action = 'add';
          delete this.dishListForm.value.id;
        }
        this._resService.addEditDish(dishData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data, action),
          error : err => {
            //console.log(err);
            this.errorMessage = err.error.message;
          }
        });
      }else{
        this._router.navigate(['dishes']);
      }
    }else{
      this.errorMessage = 'Please correct the validation errors';
    }
  }

  openDeleteDishModal(modal:TemplateRef<any>){
    //this.restInfo = data;
    this._restModalService.open(modal).result.then(
			(result) => {
				//console.log(`Closed with: ${result}`);
			},
			(reason) => {
			},
		);
  }

  onDelete(){
    //console.log(this.restaurantListForm.value.id);
    this._resService.deleteDish(this.dishListForm.value.dishId).subscribe({ 
      next : (data) => {

        this.onFormSubmitComplete(data, 'delete')
      },
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
    this._restModalService.dismissAll('deleteDishModal');
  }

  onFormSubmitComplete(dishData:Dish|null , action : string){
    //console.log(JSON.stringify(data));
    this.dishListForm.reset();
    if(action === 'add' || action==='delete')
      this._router.navigate(['/dishes']);
    else if(action === 'update')
      this._router.navigate(['restaurants',dishData?.restaurant.id,'/dishes']);
  }

}
