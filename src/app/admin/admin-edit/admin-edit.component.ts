import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from './../../services/profile.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from './../../services/login.service';
import { AbstractControl, ValidationErrors, FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { Admin } from 'src/app/model/admin';
import { GenericValidator } from 'src/app/shared/generic-validator';
import { debounceTime, fromEvent, merge, Observable, Subscription } from 'rxjs';

function emailMatcher(c : AbstractControl) : ValidationErrors | null {
  const emailControl = c.get('email');
  const confirmEmailControl = c.get('confirmEmail');

  if(emailControl?.pristine || confirmEmailControl?.pristine){
    return null;
  }
  if(emailControl?.value === confirmEmailControl?.value)
    return null;
  
  return {'match':true};
}

@Component({
  selector: 'fds-admin-edit',
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.css']
})
export class AdminEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub! : Subscription;
  
  adminStatus = [
    {id:'active',status:'active'},
    {id:'inactive',status:'inactive'}
  ];

  registerForm!: FormGroup;
  validationErrMessage:string ="";
  cEmailvalidationErrMessage = "";

  adminData! :Admin|null;
  addAdminImage! : string;
  title:string = '';
  editAdmin:boolean = false;
  errorMessage:string='';

  /***** post login and register ***/
  errRegisterMessage = '';
  registerSuccess : boolean = false;
  
  private _validationMessages : { [key: string]: { [key: string]: string } };
  displayMessage: { [key: string]: string } = {};
  private genericValidator: GenericValidator;

  constructor(private _route : ActivatedRoute, private _formBuilder : FormBuilder, private _loginService : LoginService, private _modal : NgbModal, private _profileService : ProfileService, private _dataPipe : DatePipe, private _router : Router) {
    this._validationMessages = {
    email : {
      required : 'Please enter your email',
      email : 'Please enter a valid email'
    },
    password : {
      required : 'Please enter your password'
    },
    confirmEmail : {
      match : 'Confirmation email does not match'
    },
    fullName : {
      required : 'Please enter your full name'
    },
    /* regEmail : {
      required : 'Please enter your email',
      email : 'Please enter a valid email'
    }, */
    status : {
      required : 'Please select a status'
    }
  };

  this.genericValidator = new GenericValidator(this._validationMessages); }

  ngOnInit(): void {
    
    this.errRegisterMessage = '';
    this.initializeNewForm();
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getAdminData(id);
        else{
          this.addAdminImage = '../../../assets/img/profile-new-user.png';
          this.adminData = null;
          this.registerForm!.reset();
          this.title = 'Add New Admin';
        }
      }
    );
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements!
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    merge(this.registerForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.registerForm);
    });
  }

  ngOnDestroy() : void{
    this._sub!.unsubscribe();
  }

  initializeNewForm(){
    this.registerForm = this._formBuilder.group({
      adminId : [0],
      fullName : ['',[Validators.required/* , Validators.pattern('^[a-zA-Z ]*$') */]],
      regEmail: this._formBuilder.group({
        email : ['',[Validators.required, Validators.email]],
        confirmEmail : ['',[Validators.required]]
      },{ validators : emailMatcher}),
      password : ['',Validators.required],
      status : ['', Validators.required],
      imgUrl : [''],
      addedOn : ['']
    });
  }

  onRegister(){
    if (this.registerForm.valid) {
      if (this.registerForm.dirty) {
        //console.log(this.registerForm.value.adminId);
        if(!this.registerForm.value.adminId || this.registerForm.value.adminId < 1){
          let admin:Admin = { ...this.adminData, ...this.registerForm.value };
          admin.email = this.registerForm.value.regEmail.email;
          //admin.status = 'active';
          //console.log(`admin to be added is : ${JSON.stringify(admin)}`);
          this._profileService.addAdmin(admin)
          .subscribe({
            next: () => {
              //this.registerSuccess = true;
              this.onSaveComplete()
            },
            error: err => {
              this.errRegisterMessage = err.error.message;
            }
          });
        }
        else{
          const email = this.registerForm.value.regEmail.email;
          delete this.registerForm.value.regEmail.email;
          let resData : Admin = {...this.adminData, ...this.registerForm.value};
          resData.addedOn = this.adminData?.addedOn;
          resData.email = email;
          //]]delete resData.regEmail;
          this._profileService.editAdmin(resData)
          .subscribe({ 
            next : () => this.onSaveComplete(),
            error : err => {
              //console.log(err.error.message);
              this.errorMessage = err.error.message;
            }
          });
        }
      } else {
        this.onSaveComplete();
      }
    } else {
      this.errRegisterMessage = 'Please correct the validation errors.';
    }
  }

  onSaveComplete(): void {
    // Reset the form to clear the flags
    this.registerForm.reset();
    this._router.navigate(['/view/admins']);
  }

  closeModel(modelRef:any) {
    this._modal.dismissAll(modelRef);
  }

  getAdminData(id:number){
    this._profileService.getAdminById(id).subscribe({
      next : data => {
        //console.log(`********* Admin data is : ${JSON.stringify(data)}`);
        this.adminData = data
        this.displayAdminData(data)
      },
      error : err => {
        this.addAdminImage = '../../../assets/img/profile-new-user.png';
        this.errorMessage = err.error.message;
      }
    });
  }

  displayAdminData(data:Admin){
    if(this.registerForm){
      this.registerForm.reset();
    }
    //this.title = `Admin Information : ${data.first_name} ${data.last_name}`;
    this.title = `${data.fullName}`;
    //console.log(data.imgUrl);
    this.registerForm.patchValue({
      adminId : data.adminId,
      fullName : data.fullName,
      regEmail :{
        email: data.email,
        confirmEmail : data.email
      },
      password : data.password,
      status : data.status,
      imgUrl : data.imgUrl,
      addedOn : this._dataPipe.transform(data.addedOn, 'MMM d,y')
    });
  }


  /* onFormSubmit():void{
    if(this.registerForm.valid){
      if(this.registerForm.dirty){
        

        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        if(this.registerForm.value.id < 1){
          this.registerForm.value.addedOn = this.adminData?.addedOn;
          delete this.registerForm.value.id;
          if(!this.registerForm.value.status)
            this.registerForm.value.status = 'active';
          this._profileService.addAdmin(this.registerForm.value).subscribe({ 
            next : (data) => this.onFormSubmitComplete(data),
            error : err => {
              this.errorMessage = err.error.message;
            }
          });

          this.onFormSubmitComplete('data');

          
        }
        else{
          const resData = {...this.adminData, ...this.registerForm.value};
          resData.addedOn = this.adminData?.addedOn;
          this._profileService.editAdmin(resData).subscribe({ 
          next : (data) => this.onFormSubmitComplete(data),
          error : err => {
            this.errorMessage = err.error.message;
          }
        });
      }
      }else{
        this.onFormSubmitComplete('nothing changed');
      }
    }else{
      this.errorMessage = 'Please correct the validation errors';
    }
  } */

  openDeactivateAdminModal(modalToOpen:any){
    //this.restInfo = data;
    this._modal.open(modalToOpen);
  }

  changeAdminStatus():void{
    this.registerForm.value.status = this.registerForm.value.status.toLocaleLowerCase() === 'active'?'inactive':'active';
    
    const resData = {...this.adminData, ...this.registerForm.value};
    delete resData.regEmail;
    resData.email = this.registerForm.value.regEmail.email;
    resData.addedOn = this.adminData?.addedOn;
    //console.log(resData);
    this._profileService.editAdmin(resData).subscribe({ 
      next : (data) => {
        this.onFormSubmitComplete(data)
      },
      error : err => {
        this.errorMessage = err.error.message;
      }
    });
    this._modal.dismissAll('deactivateAdminModal');
  }

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));
    this.registerForm.reset();
    this._router.navigate(['/view/admins']);
  }

  /* getAdminByEmail(email:string){
    this._profileService.getAdminByEmail(email).subscribe({
      next : data => {
        //console.log(`********* Admin data is : ${JSON.stringify(data)}`);
        localStorage.setItem('adminId',data.adminId.toString());
      },
      error : err => {
        this.errLoginMessage = err.error.message;
      }
    });
  } */

}
