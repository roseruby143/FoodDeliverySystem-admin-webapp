import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NumberValidator } from './../../shared/number-validator';
import { GenericValidator } from './../../shared/generic-validator';
import { Restaurant } from './../../model/restaurant';
import { RestaurantService } from './../../services/restaurant.service';
import { FormGroup, FormBuilder, Validators, FormControlName } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { Subscription, Observable, merge, debounceTime, catchError, Subject, EMPTY, map, fromEvent } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'fds-restaurant-edit',
  templateUrl: './restaurant-edit.component.html',
  styleUrls: ['./restaurant-edit.component.css']
})
export class RestaurantEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  //tagLine:string = environment.projectTagLine;
  private _errorMessageSubject = new Subject<string>();
  errorMessage$ = this._errorMessageSubject.asObservable();

  restaurantInfo!:Restaurant;
  /* $ = this._resService.selectedRestaurantData$.pipe(
    catchError(err => {
      this._errorMessageSubject.next(err.message);
      return EMPTY;
    })
  ); */
  title$ = this.restaurantInfo ? this.restaurantInfo.name : 'Add New Restaurant';
  
  //restaurantInfo:Restaurant | undefined | null;
  restaurantListForm!: FormGroup;
  //editRestaurant:boolean = false;
  errorMessage:string='';
  
  addRestaurantImage!: string;

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _resService : RestaurantService, private _router : Router, private _restModalService : NgbModal) { 
    this._validationMessages = {
      email : {
        required : 'Please enter your email',
        email : 'Please enter a valid email'
      },
      name : {
        required : 'Please enter the name of the restaurant'
      },
      address : {
        required : 'Please enter the full address'
      },
      phone : {
        required : 'Please enter the phone number',
        pattern : 'Please provide 10 digit phone number.'
      },
      contact_person : {
        required : 'Please enter the contact person'
      },
      rating : {
        range : 'Please provide rating between 1(lowest) and 5(highest).'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
  }

  ngOnInit(): void {
    this.initializeNewForm();
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getRestaurantData(id);
        else{
          this.addRestaurantImage = '../../../assets/img/add-restaurant.jpeg';;
          //this.restaurantInfo = null;
          this.restaurantListForm!.reset();
          //this.title = 'Add New Restaurant';
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
    merge(this.restaurantListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.restaurantListForm);
    });
  }

  initializeNewForm():void{
    this.restaurantListForm = this._fb.group({
      id : [0],
      name : ['', Validators.required],
      description : [''],
      address : ['', Validators.required],
      phone : ['',[Validators.required, Validators.pattern('^[1-9][0-9]{9}$')]],
      email : ['', [Validators.required, Validators.email]],
      category : [''],
      contact_person : ['', Validators.required],
      rating : ['',[NumberValidator.range(1, 5)]],
      restaurantImageUrl : ['']
    });
  }

  getRestaurantData(id:number){
    this._resService.getRestaurantData(id).subscribe({
      next : data => {
        //console.log(`********* restaurant data is : ${JSON.stringify(data)}`);
        this.restaurantInfo = data
        this.restaurantDisplay(data)
      },
      error : err => {
        //this.restaurantInfo = null;
        this.addRestaurantImage = '../../../assets/img/add-restaurant.jpeg';;
        this.errorMessage = err.error.message;
        //console.log(err);
        //this._router.navigate(['/restaurants']);
      }
    });
  }

  restaurantDisplay(value:Restaurant){
    if(this.restaurantListForm){
      this.restaurantListForm.reset();
    }
    //console.log(`value : ${value}`);
      this.restaurantListForm.patchValue({
        id : value?.id!,
        name : value?.name!,
        description : value?.description!,
        address : value?.address!,
        phone : value?.phone!,
        email : value?.email!,
        category : value?.category!,
        contact_person : value?.contact_person!,
        rating : value?.rating!,
        restaurantImageUrl : value?.restaurantImageUrl!
      });
    
  }


  onFormSubmit():void{
    if(this.restaurantListForm.valid){
      if(this.restaurantListForm.dirty){
        const resData = {...this.restaurantInfo, ...this.restaurantListForm.value}
        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        let action:string = 'update';
        if(!this.restaurantListForm.value.id  || this.restaurantListForm.value.id == 0){
          action = 'add';
          delete this.restaurantListForm.value.id;
          this._resService.addRestaurant(this.restaurantListForm.value);
        }
        else
          this._resService.updateRestaurant(resData);
        /* addEditRestaurant(resData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            //console.log(err);
            this.errorMessage = err.error.message;
          }
        }); */
      }
      this.onFormSubmitComplete();
    }else{
      this.errorMessage = 'Please correct the validation errors';
    }
  }

  openDeleteRestaurantModal(modalToOpen:any){
    //this.restInfo = data;
    this._restModalService.open(modalToOpen);
  }

  onDelete():void{
    let res:Restaurant = {...this.restaurantListForm.value, added_on : this.restaurantInfo.added_on};
    this._resService.deleteRestaurant(res);
    this._restModalService.dismissAll('deleteRestaurantModal');
    this.onFormSubmitComplete();
  }

  onFormSubmitComplete(){
    //console.log(JSON.stringify(data));
    this.restaurantListForm.reset();
    this._router.navigate(['/restaurants']);
  }

  goToDishes():void{
    const restaurantId = this.restaurantListForm.value.id;
    //console.log(`id : ${restaurantId}`);
    this.restaurantListForm.reset();
    if(restaurantId && restaurantId > 0){
      this._router.navigate(['/restaurants',restaurantId,'dishes']);
    }else{
      this._router.navigate(['/dishes']);
    }
  }
}
