import { AuthenticationGuard } from './../services/authentication.guard';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';



@NgModule({
  declarations: [
    ViewUserComponent,
    EditUserComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {path:'users', component:ViewUserComponent, canActivate:[AuthenticationGuard]},
      {path:'users/:id', component:EditUserComponent, canActivate:[AuthenticationGuard]},
      {path:'users/:id/edit', component:EditUserComponent, canActivate:[AuthenticationGuard]}
    ])
  ]
})
export class UserModule { }
