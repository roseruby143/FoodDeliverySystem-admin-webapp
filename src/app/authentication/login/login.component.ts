import { ProfileService } from './../../services/profile.service';
import { GenericValidator } from './../../shared/generic-validator';
import { Admin } from './../../model/admin';
import { LoginService } from './../../services/login.service';
import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormControl, FormControlName, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { debounceTime, Subscription, Observable, fromEvent, merge } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

function emailMatcher(c : AbstractControl) : ValidationErrors | null {
  const emailControl = c.get('regEmail');
  const confirmEmailControl = c.get('confirmEmail');

  if(emailControl?.pristine || confirmEmailControl?.pristine){
    return null;
  }
  if(emailControl?.value === confirmEmailControl?.value)
    return null;
  
  return {'match':true};
}

@Component({
  selector: 'fds-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  activeId = 'login';

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  validationErrMessage:string ="";
  cEmailvalidationErrMessage = "";

  adminData:Admin| null = null;

  /***** post login and register ***/
  errLoginMessage = '';
  errRegisterMessage = '';
  registerSuccess : boolean = false;
  
  private _validationMessages : { [key: string]: { [key: string]: string } };
  displayMessage: { [key: string]: string } = {};
  private genericValidator: GenericValidator;

  constructor(private _forgotPasswordModal : NgbModal, private _router: Router , private _authService : LoginService, private _formBuilder : FormBuilder, private _adminService : ProfileService) {
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
      regEmail : {
        required : 'Please enter your email',
        email : 'Please enter a valid email'
      },
      regPassword : {
        required : 'Please enter your password'
      }
    };

    this.genericValidator = new GenericValidator(this._validationMessages);
   }

  active = 'login';

  ngOnInit(): void {
    this.errLoginMessage = '';
    this.errRegisterMessage = '';
    this.loginForm = this._formBuilder.group({
      email : ['',[Validators.required, Validators.email]],
      password : ['',Validators.required],
      rememberCheck : false
    });

    this.registerForm = this._formBuilder.group({
      fullName : ['',[Validators.required/* , Validators.pattern('^[a-zA-Z ]*$') */]],
      email: this._formBuilder.group({
        regEmail : ['',[Validators.required, Validators.email]],
        confirmEmail : ['',[Validators.required]]
      },{ validators : emailMatcher}),
      password : ['',Validators.required]
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements!
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.loginForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.loginForm);
    });

    merge(this.registerForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.registerForm);
    });
  }

  onLogin(){
    //console.log(`---- validateInput() : nav active id is : ${onLoginInputData.loginName}`);
    //console.log(`---- onLogin() : formData is : ${this.loginForm}`);

    const adminDataLogin = {
      "email" : this.loginForm.value.email,
      "password" : this.loginForm.value.password
    };

    this._authService.adminLogin(adminDataLogin).subscribe({ 
        next : (response:Admin) => { 
          if(response.adminId != null) {
            localStorage.setItem('adminId', response.adminId.toLocaleString());
            //localStorage.setItem('user', response.email);
            localStorage.setItem('status', 'loggedIn');
            this._router.navigateByUrl('/welcome');
          }
       }, 
       error : err => {
        this.errLoginMessage = err.error.message;
       }
      });
  }

  onRegister(){
    if (this.registerForm.valid) {
      if (this.registerForm.dirty) {
        let admin:Admin = { ...this.adminData, ...this.registerForm.value };
        admin.email = this.registerForm.value.email.regEmail;
        admin.status = 'active';
        //console.log(`admin to be added is : ${JSON.stringify(admin)}`);
        this._authService.adminRegister(admin)
          .subscribe({
            next: () => {
              this.registerSuccess = true;
              this.onSaveComplete()
            },
            error: err => {
              /* this.getRegisterEmailGroupControl()!.controls['regEmail'].setErrors({'exists': true});
              document.getElementById('regEmail')?.classList.add('is-invalid'); */
              this.errRegisterMessage = err.error.message;
            }
          });
      } else {
        this.onSaveComplete();
      }
    } else {
      this.errRegisterMessage = 'Please correct the validation errors.';
    }
  }

  /* getRegisterEmailGroupControl():FormGroup{
    return this.registerForm.get('email') as FormGroup;
  } */

  onSaveComplete(): void {
    // Reset the form to clear the flags
    this.registerForm.reset();
  }

  forgotPassword(modalRef:any){
    //console.log(`----------- ${clientObject}`);    
    this._forgotPasswordModal.open(modalRef);
  }

  closeModel(modelRef:any) {
    this._forgotPasswordModal.dismissAll(modelRef);
  }

  /* getAdminByEmail(email:string){
    this._adminService.getAdminByEmail(email).subscribe({
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


