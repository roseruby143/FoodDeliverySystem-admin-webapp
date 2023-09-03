import { Router } from '@angular/router';
import { merge, Observable, debounceTime, fromEvent } from 'rxjs';
import { GenericValidator } from './../../shared/generic-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, FormControlName } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';

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
  selector: 'fds-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];
  
  sendButtonDisabled:boolean = true;
  forgotPasswordForm! : FormGroup;
  forgotButtonClicked:boolean = false;
  
  private _validationMessages : { [key: string]: { [key: string]: string } };
  private _loginErrMessage ="";
  displayMessage: { [key: string]: string } = {};
  private genericValidator: GenericValidator;

  constructor(private _ngModalObj : NgbModal, private _formBuilder : FormBuilder, private _router : Router) {
    this._validationMessages = {
      email : {
        required : 'Please enter your email',
        email : 'Please enter a valid email'
      },
      confirmEmail : {
        match : 'Confirmation email does not match'
      }
    };

    this.genericValidator = new GenericValidator(this._validationMessages);
   }

  ngOnInit(): void {
    this.forgotButtonClicked = false;
    this.forgotPasswordForm = this._formBuilder.group({
      emailGroup: this._formBuilder.group({
        email : ['',[Validators.required, Validators.email]],
        confirmEmail : ['',[Validators.required]]
      },{ validators : emailMatcher})
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements!
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.forgotPasswordForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.forgotPasswordForm);
    });

    merge(this.forgotPasswordForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.forgotPasswordForm);
    });
  }

  onForgotPassword(){
    this.forgotButtonClicked = true;
    //console.log(`--- forgotPasswordFormDate is: ${modalInput.forgotPasswordEmail}`);
  }

  checkModalInput(emailInput:any){
    //console.log(`--- forgotPasswordFormDate is: ${emailInput.forgotPasswordEmail} and its length is : ${(<string>emailInput.forgotPasswordEmail).trim().length}`);
    let emailInputElement = document.getElementById('forgotPasswordEmail');
    
  }

  close(){
    this._ngModalObj.dismissAll();
  }

}
