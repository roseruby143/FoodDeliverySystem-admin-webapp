import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './../../services/user.service';
import { User } from './../../model/user';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';

@Component({
  selector: 'fds-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;
  addUserImage! : string;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  title:string = '';
  //tagLine:string = environment.projectTagLine;
  userInfo:User | undefined | null;
  userListForm!: FormGroup;
  editUser:boolean = false;
  errorMessage:string='';

  userStatus = [
    {id:'active',status:'active'},
    {id:'inactive',status:'inactive'}
  ];

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _userService : UserService, private _router : Router, private _restModalService : NgbModal) { 
    this._validationMessages = {
      email : {
        required : 'Please enter your email',
        email : 'Please enter a valid email'
      },
      first_name : {
        required : 'Please enter the first name'
      },
      phone : {
        pattern : 'Please provide 10 digit phone number'
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
          this.getUserData(id);
        else{
          this.addUserImage = '../../../assets/img/profile-new-user.png';
          this.userInfo = null;
          this.userListForm!.reset();
          this.title = 'Add New User';
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
    merge(this.userListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.userListForm);
    });
  }

  initializeNewForm():void{
    this.userListForm = this._fb.group({
      id : [0],
      first_name : ['', Validators.required],
      last_name : [''],
      email : ['', [Validators.required, Validators.email]],
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      pincode: [''],
      phone : ['',[Validators.pattern('^[1-9][0-9]{9}$')]],
      status : [''],
      imgUrl : ['']
    });
  }

  getUserData(id:number){
    this._userService.getUserData(id).subscribe({
      next : data => {
        //console.log(`********* User data is : ${JSON.stringify(data)}`);
        this.userInfo = data
        this.UserDisplay(data)
      },
      error : err => {
        this.addUserImage = '../../../assets/img/profile-new-user.png';
        this.errorMessage = err.error.message;
        //console.log(err);
        //this._router.navigate(['/users']);
      }
    });
  }

  UserDisplay(data:User){
    if(this.userListForm){
      this.userListForm.reset();
    }
    //this.title = `User Information : ${data.first_name} ${data.last_name}`;
    this.title = `${data.first_name} ${data.last_name}`;
    //console.log(data.imgUrl);
    this.userListForm.patchValue({
      id : data.id!,
      first_name : data.first_name!,
      last_name : data.last_name!,
      phone : data.phone!,
      email : data.email!,
      street : data.street,
      city : data.city,
      state : data.state,
      country : data.country,
      pincode : data.pincode,
      status : data.status!,
      imgUrl : data.imgUrl!
    });
  }


  onFormSubmit():void{
    if(this.userListForm.valid){
      if(this.userListForm.dirty){
        const resData = {...this.userInfo, ...this.userListForm.value};

        /****** Remove it later. Just for development ******/
        if(!resData.password)
        resData.password = 'test';

        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        let action:string = 'update';
        if(this.userListForm.value.id < 1){
          action = 'add';
          delete this.userListForm.value.id;
          if(!this.userListForm.value.status)
            this.userListForm.value.status = 'active';
        }
        this._userService.addEditUser(resData,action).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            console.log(err);
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

  openDeactivateUserModal(modalToOpen:any){
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
    //console.log(this.userListForm.value.id);
    this.userListForm.value.status = this.userListForm.value.status.toLocaleLowerCase() === 'active'?'inactive':'active';
    console.log(this.userListForm.value.status);

    const resData = {...this.userInfo, ...this.userListForm.value};
    this._userService.addEditUser(resData,'update').subscribe({ 
      next : (data) => this.onFormSubmitComplete(data),
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
    this._restModalService.dismissAll('DeactivateUserModal');
  }

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));
    this.userListForm.reset();
    this._router.navigate(['/users']);
  }
}
