import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { AdminEditComponent } from './admin-edit/admin-edit.component';
import { AuthenticationGuard } from '../services/authentication.guard';



@NgModule({
  declarations: [
    AdminViewComponent,
    AdminEditComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path:'view/admins', component:AdminViewComponent, canActivate:[AuthenticationGuard]},
      {path:'add/admin', component:AdminEditComponent, canActivate:[AuthenticationGuard]},
      {path:'edit/admin/:id', component:AdminEditComponent, canActivate:[AuthenticationGuard]}
      //{path:'welcome', component:WelcomeComponent, canActivate:[ComponentAccessGuard]}
    ]),
    //FormsModule,//don't need this if using ReactiveFormsModule. Delete later after ReactiveFormsModule is implemented.
    //ReactiveFormsModule,
    NgbNavModule
  ]
})
export class AdminModule { }
