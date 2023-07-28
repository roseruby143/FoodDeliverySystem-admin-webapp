import { AuthenticationGuard } from './../services/authentication.guard';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditDriverComponent } from './edit-driver/edit-driver.component';
import { ViewDriverComponent } from './view-driver/view-driver.component';



@NgModule({
  declarations: [
    EditDriverComponent,
    ViewDriverComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {path:'drivers', component:ViewDriverComponent, canActivate:[AuthenticationGuard]},
      {path:'drivers/:id', component:EditDriverComponent, canActivate:[AuthenticationGuard]},
      {path:'drivers/:id/edit', component:EditDriverComponent, canActivate:[AuthenticationGuard]}
    ])
  ]
})
export class DriverModule { }
