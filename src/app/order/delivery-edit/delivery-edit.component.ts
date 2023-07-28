import { DriverService } from './../../services/driver.service';
import { Driver } from './../../model/driver';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Delivery } from './../../model/delivery';
import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';

@Component({
  selector: 'fds-delivery-edit',
  templateUrl: './delivery-edit.component.html',
  styleUrls: ['./delivery-edit.component.css']
})
export class DeliveryEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;
  addDeliveryImage! : string;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  title:string = '';
  //tagLine:string = environment.projectTagLine;
  deliveryInfo:Delivery | undefined | null;
  deliveryListForm!: FormGroup;
  allDrivers!:Driver[] ;
  editDelivery:boolean = false;
  errorMessage:string='';

  private _deliveryStatus = [
    {id : 1, status : 'Driver Assigned'},
    {id : 2, status : 'Order Picked Up'},
    {id : 3, status : 'Delivered'},
    {id : 4, status : 'Delivery Attempt Failed'}
];
get deliveryStatus() {
    return this._deliveryStatus;
}

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _OrderService : OrderService, private _router : Router, private _driverService : DriverService) { 
    this._validationMessages = {
      deliveryStatus : {
        required : 'Please select the delivery status'
      },
      driver : {
        required : 'Please select the driver'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
  }

  ngOnInit(): void {
    this.errorMessage = '';
    this.initializeNewForm();
    this.addDeliveryImage = '../../../assets/img/add-delivery.png';
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getDeliveryData(id);
        else{
          this.deliveryInfo = null;
          this.deliveryListForm!.reset();
          this.title = 'Add New Delivery';
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
    merge(this.deliveryListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.deliveryListForm);
    });
  }

  initializeNewForm():void{
    this.deliveryListForm = this._fb.group({
      id : [0],
      deliveryStatus : ['', Validators.required],
      deliveryTitle : [''],
      deliveryDate : [''],
      deliveryInstruction : [''],
      driver: ['', Validators.required]
    });
    this.getAllDrivers();
  }

  getDeliveryData(id:number){
    this._OrderService.getDeliveryData(id).subscribe({
      next : data => {
        //console.log(`********* Delivery data is : ${JSON.stringify(data)}`);
        this.deliveryInfo = data
        this.deliveryDisplay(data)
      },
      error : err => {
        this.addDeliveryImage = '../../../assets/img/add-delivery.png';
        this.errorMessage = err.error.message;
      }
    });
  }

  deliveryDisplay(data:Delivery){
    if(this.deliveryListForm){
      this.deliveryListForm.reset();
    }
    //this.title = `Delivery Information : ${data.first_name} ${data.last_name}`;
    this.title = `Delivery Information : ${data.id}`;
    //console.log(data.imgUrl);
    this.deliveryListForm.patchValue({
      id : data.id!,
      deliveryStatus : data.deliveryStatus,
      deliveryTitle : data.deliveryTitle,
      deliveryDate : data.deliveryDate ? data.deliveryDate.toLocaleString() : 'Pending',
      deliveryInstruction : data.deliveryInstruction,
      driver: data.driver.id
    });
  }

  getAllDrivers(){
    this._driverService.getAllDrivers().subscribe({
      next : data => {
        this.allDrivers = data.filter(obj => {
          return obj.status?.toLocaleLowerCase() != 'inactive'
        });
        //console.log(`********* Delivery data is : ${JSON.stringify(allDrivers)}`);
        
        //this.allDrivers = data;
      },
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
  }

  onFormSubmit():void{
    if(this.deliveryListForm.valid){
      if(this.deliveryListForm.dirty){

        if(this.deliveryListForm.value.deliveryStatus == 3){
          this.deliveryListForm.value.deliveryDate = new Date();
        }

        let deliveryTitle = this._deliveryStatus.filter(obj => {
          return obj.id === this.deliveryListForm.value.deliveryStatus
        });
        if(deliveryTitle)
          this.deliveryListForm.value.deliveryTitle = deliveryTitle[0].status;
        
        let resData = {...this.deliveryInfo, ...this.deliveryListForm.value};

        let driver = this._deliveryStatus.filter(obj => {
          return obj.id === this.deliveryListForm.value.driver
        });
        if(driver){
          resData.driver = {id:driver[0].id};
        }
          //this.deliveryListForm.value.driver.id = driver[0].id;
        
        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        let action:string = 'update';
        if(this.deliveryListForm.value.id < 1){
          action = 'add';
          delete this.deliveryListForm.value.id;
        }
        this._OrderService.addEditDelivery(resData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            /* this.deliveryListForm.controls['email'].setErrors({'exists': true});
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

  viewDriver():void{
    this._router.navigate(['/drivers',this.deliveryInfo?.driver.id]);
  }

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));
    this.deliveryListForm.reset();
    this._router.navigate(['/deliveries']);
  }
}
