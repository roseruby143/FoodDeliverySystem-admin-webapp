import { Driver } from './../../model/driver';
import { Delivery } from './../../model/delivery';
import { DriverService } from './../../services/driver.service';
import { UserService } from './../../services/user.service';
import { User } from './../../model/user';
import { OrderService } from './../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from './../../model/order';
import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';

@Component({
  selector: 'fds-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.css']
})
export class OrderEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;
  addOrderImage! : string;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  title:string = '';
  //tagLine:string = environment.projectTagLine;
  orderInfo:Order | undefined | null;
  orderListForm!: FormGroup;
  editOrder:boolean = false;
  errorMessage:string='';

  allUsers!:User[] ;

  private _orderStatus = [
    {id : 1, status : 'Order Created'},
    {id : 2, status : 'Accepted By Restaurant'},
    {id : 3, status : 'Picked up by Driver'},
    {id : 4, status : 'Completed'},
    {id : 99, status : 'Cancelled'}
  ];
  get orderStatus() {
      return this._orderStatus;
  }

  private _paymentStatus = [
    {id : 1, status : 'Payment Submitted'},
    {id : 2, status : 'Payment Processed'},
    {id : 3, status : 'Payment Refunded'},
    {id : 99, status : 'Payment Declined'}
  ];
  get paymentStatus() {
      return this._paymentStatus;
  }
  
  private _paymentMethod = [
    {id : 1, method : 'Credit/Debit'},
    {id : 2, method : 'Paypal'}
    /* ,
    {id : 3, method : 'Venmo'},
    {id : 4, method : 'Google/Apple Pay'}, */
  ];
  get paymentMethod() {
      return this._paymentMethod;
  }

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _orderService : OrderService, private _router : Router, private _userService : UserService ) { 
    this._validationMessages = {
      orderStatus : {
        required : 'Please select the Order status'
      },
      totalItems : {
        required : 'Please provide the total no. of Items'
      },
      itemsSubTotal : {
        required : 'Please provide the items sub total'
      },
      taxNFees : {
        required : 'Please provide the total tax amount'
      },
      deliveryCharges : {
        required : 'Please provide the total delivery charge amount'
      },
      driverTip : {
        required : 'Please provide the total driver tip amount'
      },
      orderDate : {
        required : 'Please provide order Date'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
  }

  ngOnInit(): void {
    this.errorMessage = '';
    this.initializeNewForm();
    this.addOrderImage = '../../../assets/img/add-order.png';
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getOrderData(id);
        else{
          this.orderInfo = null;
          this.orderListForm!.reset();
          this.title = 'Add New Order';
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
    merge(this.orderListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.orderListForm);
    });
  }

  initializeNewForm():void{
    this.orderListForm = this._fb.group({
      id : [0],
      orderDate : [new Date(),Validators.required],
      orderStatus : ['', Validators.required],
      totalItems : ['', Validators.required],
      itemsSubTotal : ['', Validators.required],
      taxNFees : ['', Validators.required],
      deliveryCharges: ['', Validators.required],
      driverTip: ['', Validators.required],
      totalAmount: ['', Validators.required],
      paymentStatus: [''],
      paymentStatusTitle: [''],
      paymentMethod: [''],
      paymentMethodTitle: [''],
      instruction : [''],
      user: ['', Validators.required],
      delivery: ['']
    });
    this.getAllUsers();
  }

  getOrderData(id:number){
    this._orderService.getOrderById(id).subscribe({
      next : data => {
        //console.log(`********* Order data is : ${JSON.stringify(data)}`);
        this.orderInfo = data
        this.OrderDisplay(data)
      },
      error : err => {
        this.addOrderImage = '../../../assets/img/add-Order.png';
        this.errorMessage = err.error.message;
      }
    });
  }

  OrderDisplay(data:Order){
    if(this.orderListForm){
      this.orderListForm.reset();
    }
    //this.title = `Order Information : ${data.first_name} ${data.last_name}`;
    this.title = `Order Information : ${data.orderId}`;
    //console.log(data.imgUrl);
    this.orderListForm.patchValue({
      id : data.orderId!,
      orderDate : new Date(data.orderDate!),
      orderStatus : data.orderStatus,
      totalItems : data.totalItems,
      itemsSubTotal : data.itemsSubTotal!.toFixed(2),
      taxNFees : data.taxNFees!.toFixed(2),
      deliveryCharges: data.deliveryCharges!.toFixed(2),
      driverTip: data.driverTip!.toFixed(2),
      totalAmount: data.totalAmount!.toFixed(2),
      paymentStatus: data.paymentStatus,
      paymentStatusTitle: data.paymentStatusTitle,
      paymentMethod: data.paymentMethod,
      paymentMethodTitle: data.paymentMethodTitle,
      instruction: data.instruction,
      user: data.user!.id,
      delivery: data.delivery?.id
    });
  }

  getAllUsers(){
    this._userService.getAllUsers().subscribe({
      next : data => {
        this.allUsers = data.filter(obj => {
          return obj.status.toLocaleLowerCase() != 'inactive'
        });
        //console.log(`********* Order data is : ${JSON.stringify(allDrivers)}`);
        
        //this.allDrivers = data;
      },
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
  }

  onFormSubmit():void{
    if(this.orderListForm.valid){
      if(this.orderListForm.dirty){

        //console.log(JSON.stringify(this.orderListForm.value));
        //this.orderListForm.value
        /* if(this.orderListForm.value.orderStatus == 3){
          this.orderListForm.value.OrderDate = new Date();
        }*/

        this.orderListForm.value.user = {id:this.orderListForm.value.user};
        this.orderListForm.value.orderDate = new Date(); 
        
        let resData = {...this.orderInfo, ...this.orderListForm.value};
        //console.log(JSON.stringify(resData));
        
        resData.paymentStatusTitle = this._paymentStatus.filter(obj => {
          return obj.id === this.orderListForm.value.paymentStatus
        })[0].status;

        resData.paymentMethodTitle = this._paymentMethod.filter(obj => {
          return obj.id === this.orderListForm.value.paymentMethod
        })[0].method;
          //this.orderListForm.value.driver.id = driver[0].id;
        
        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        let action:string = 'update';
        if(!this.orderListForm.value.id || this.orderListForm.value.id < 1){
          action = 'add';
          delete this.orderListForm.value.id;
        }

        /********** Creating Delivery *******/
        /* let driverId = Math.floor(Math.random() * (7 - 2 + 1) + 2);
        console.log(`driverId : ${driverId}`); */

        this._orderService.addEditOrder(resData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            /* this.orderListForm.controls['email'].setErrors({'exists': true});
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
    this._router.navigate(['/drivers',this.orderInfo?.driver.id]);
  } */

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));

    this.orderListForm.reset();
    this._router.navigate(['/orders']);
  }
}
