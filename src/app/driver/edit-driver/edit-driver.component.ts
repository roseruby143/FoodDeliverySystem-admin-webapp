import { NumberValidator } from './../../shared/number-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DriverService } from './../../services/driver.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from './../../model/driver';
import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';

@Component({
  selector: 'fds-edit-driver',
  templateUrl: './edit-driver.component.html',
  styleUrls: ['./edit-driver.component.css']
})
export class EditDriverComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;
  addDriverImage! : string;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  title:string = '';
  //tagLine:string = environment.projectTagLine;
  driverInfo:Driver | undefined | null;
  driverListForm!: FormGroup;
  editDriver:boolean = false;
  errorMessage:string='';

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _driverService : DriverService, private _router : Router, private _restModalService : NgbModal) { 
    this._validationMessages = {
      email : {
        required : 'Please enter your email',
        email : 'Please enter a valid email',
        exists : 'Driver with this email already exists'
      },
      first_name : {
        required : 'Please enter the first name'
      },
      phone : {
        required : 'Please enter the phone number',
        pattern : 'Please provide 10 digit phone number'
      },
      vehicalNumber : {
        required : 'Please enter the vehicle number'
      },
      rating : {
        range : 'Please provide rating between 1(lowest) and 5(highest).'
      },
      status : {
        required : 'Please select the status'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
  }

  ngOnInit(): void {
    this.errorMessage = '';
    this.initializeNewForm();
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getDriverData(id);
        else{
          this.addDriverImage = '../../../assets/img/add-driver.jpeg';
          this.driverInfo = null;
          this.driverListForm!.reset();
          this.title = 'Add New Driver';
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
    merge(this.driverListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.driverListForm);
    });
  }

  initializeNewForm():void{
    this.driverListForm = this._fb.group({
      id : [0],
      first_name : ['', Validators.required],
      last_name : [''],
      email : ['', [Validators.required, Validators.email]],
      phone : ['',[Validators.required, Validators.pattern('^[1-9][0-9]{9}$')]],
      vehicalNumber: ['', Validators.required],
      rating: ['',[NumberValidator.range(1, 5)]],
      status : ['', Validators.required],
      imgUrl : ['']
    });
  }

  getDriverData(id:number){
    this._driverService.getDriverData(id).subscribe({
      next : data => {
        //console.log(`********* Driver data is : ${JSON.stringify(data)}`);
        this.driverInfo = data
        this.DriverDisplay(data)
      },
      error : err => {
        this.addDriverImage = '../../../assets/img/add-driver.jpeg';
        this.errorMessage = err.error.message;
      }
    });
  }

  DriverDisplay(data:Driver){
    if(this.driverListForm){
      this.driverListForm.reset();
    }
    //this.title = `Driver Information : ${data.first_name} ${data.last_name}`;
    this.title = `${data.first_name} ${data.last_name}`;
    //console.log(data.imgUrl);
    this.driverListForm.patchValue({
      id : data.id!,
      first_name : data.first_name!,
      last_name : data.last_name!,
      phone : data.phone!,
      email : data.email!,
      vehicalNumber : data.vehicalNumber,
      rating : data.rating,
      status : data.status!,
      imgUrl : data.imgUrl!
    });
  }


  onFormSubmit():void{
    if(this.driverListForm.valid){
      if(this.driverListForm.dirty){
        const resData = {...this.driverInfo, ...this.driverListForm.value};

        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        let action:string = 'update';
        if(this.driverListForm.value.id < 1){
          action = 'add';
          delete this.driverListForm.value.id;
          if(!this.driverListForm.value.status)
            this.driverListForm.value.status = 'active';
        }
        this._driverService.addEditDriver(resData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            /* this.driverListForm.controls['email'].setErrors({'exists': true});
            //console.log(err); */
            this.errorMessage = err.error.message;
          }
        });
      }else{
        this.onFormSubmitComplete('nothing changed');
      }
    }else{
      this.errorMessage = 'Please correct the validation errors';
    }
  }

  openDeactivateDriverModal(modalToOpen:any){
    //this.restInfo = data;
    this._restModalService.open(modalToOpen).result.then(
			(result) => {
				//console.log(`Closed with: ${result}`);
			},
			(reason) => {
			},
		);
  }

  onDeactivate():void{
    this.driverListForm.value.status = this.driverListForm.value.status.toLocaleLowerCase() === 'active'?'inactive':'active';
    //console.log(this.driverListForm.value.status);

    const resData = {...this.driverInfo, ...this.driverListForm.value};
    this._driverService.addEditDriver(resData,'update').subscribe({ 
      next : (data) => this.onFormSubmitComplete(data),
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
    this._restModalService.dismissAll('deleteDriverModal');
  }

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));
    this.driverListForm.reset();
    this._router.navigate(['/drivers']);
  }
}
