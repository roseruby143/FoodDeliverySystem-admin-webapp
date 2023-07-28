import { RestaurantService } from './../../services/restaurant.service';
import { OrderService } from './../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Dish } from './../../model/dish';
import { OrderItem } from './../../model/order-item';
import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';

@Component({
  selector: 'fds-order-item-edit',
  templateUrl: './order-item-edit.component.html',
  styleUrls: ['./order-item-edit.component.css']
})
export class OrderItemEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;
  addOrderImage! : string;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  title:string = '';
  //tagLine:string = environment.projectTagLine;
  orderItemInfo:OrderItem | undefined | null;
  orderItemListForm!: FormGroup;
  editOrderItem:boolean = false;
  errorMessage:string='';

  allDishes!:Dish[] ;

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _orderItemService : OrderService, private _router : Router, private _restService : RestaurantService ) { 
    this._validationMessages = {
      quantity : {
        required : 'Please select the quantity'
      },
      itemTotalPrice : {
        required : 'Please provide the total price'
      },
      dish : {
        required : 'Please select the dish'
      },
      order :{
        required : 'Please assign the order'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
  }

  ngOnInit(): void {
    this.errorMessage = '';
    this.initializeNewForm();
    this.addOrderImage = '../../../assets/img/add-orderitem.png';
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getOrderItemData(id);
        else{
          this.orderItemInfo = null;
          this.orderItemListForm!.reset();
          this.title = 'Add New Order Item';
        }
      }
    );
  }

  ngOnDestroy() : void{
    this._sub!.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.orderItemListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.orderItemListForm);
    });
  }

  initializeNewForm():void{
    this.orderItemListForm = this._fb.group({
      orderItemId : [0],
      quantity : [0 ,Validators.required],
      itemTotalPrice : [0, Validators.required],
      order : ['', Validators.required],
      dish : ['', Validators.required]
    });
    this.getAllDishes();
  }

  getOrderItemData(id:number){
    this._orderItemService.getOrderItemsById(id).subscribe({
      next : data => {
        //console.log(`********* Order data is : ${JSON.stringify(data)}`);
        this.orderItemInfo = data
        this.OrderDisplay(data)
      },
      error : err => {
        this.addOrderImage = '../../../assets/img/add-orderitem.png';
        this.errorMessage = err.error.message;
      }
    });
  }

  OrderDisplay(data:OrderItem){
    if(this.orderItemListForm){
      this.orderItemListForm.reset();
    }
    //this.title = `Order Information : ${data.first_name} ${data.last_name}`;
    this.title = `Order Item Information : ${data.orderItemId}`;
    //console.log(data.imgUrl);
    this.orderItemListForm.patchValue({
      orderItemId : data.orderItemId!,
      quantity : data.quantity,
      itemTotalPrice : data.itemTotalPrice,
      dish : data.dish.dishId,
      order : data.order.orderId
    });
  }

  getAllDishes(){
    this._restService.getAllDishes().subscribe({
      next : data => {
        this.allDishes = data;
        //console.log(`********* Order data is : ${JSON.stringify(allDrivers)}`);
      },
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
  }

  onFormSubmit():void{
    if(this.orderItemListForm.valid){
      if(this.orderItemListForm.dirty){

        console.log(JSON.stringify(this.orderItemListForm.value));

        this.orderItemListForm.value.dish = {dishId:this.orderItemListForm.value.dish};
        this.orderItemListForm.value.order = {orderId:this.orderItemListForm.value.order};
        //this.orderItemListForm.value.orderDate = new Date(); 
        
        let resData = {...this.orderItemInfo, ...this.orderItemListForm.value};
        console.log(JSON.stringify(resData));
          //this.orderItemListForm.value.driver.id = driver[0].id;
        
        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        let action:string = 'update';
        if(!this.orderItemListForm.value.id || this.orderItemListForm.value.id < 1){
          action = 'add';
          delete this.orderItemListForm.value.orderItemId;
        }

        this._orderItemService.addEditOrderItems(resData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            /* this.orderItemListForm.controls['email'].setErrors({'exists': true});
            console.log(err); */
            this.errorMessage = err.error.message;
          }
        });
      }else{
        this.onFormSubmitComplete('Nothing has been updated');
      }
    }else{
      this.errorMessage = 'Please correct the validation errors';
    }
  }

  /* viewDriver():void{
    this._router.navigate(['/drivers',this.orderItemInfo?.driver.id]);
  } */

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));
    this.orderItemListForm.reset();
    this._router.navigate(['/orderitems']);
  }

  updateItemTotalPrice(){
    console.log(this.orderItemListForm.value.dish);
    if(this.orderItemListForm.value.dish && this.orderItemListForm.value.quantity)
    {
      let dish = this.allDishes.filter((d) => d.dishId == this.orderItemListForm.value.dish);
      console.log(JSON.stringify(dish));
      this.orderItemListForm.patchValue({
        itemTotalPrice : this.orderItemListForm.value.quantity * dish[0].price
      });
      console.log(this.orderItemListForm.value.itemTotalPrice);
    }
  }
}
