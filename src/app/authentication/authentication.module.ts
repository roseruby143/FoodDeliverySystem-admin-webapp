import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path:'login', component:LoginComponent}
      //{path:'welcome', component:WelcomeComponent, canActivate:[ComponentAccessGuard]}
    ]),
    //FormsModule,//don't need this if using ReactiveFormsModule. Delete later after ReactiveFormsModule is implemented.
    //ReactiveFormsModule,
    NgbNavModule
    
  ]
})
export class AuthenticationModule { }
