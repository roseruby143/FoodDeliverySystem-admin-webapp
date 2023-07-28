import { DishEditGuard } from './../services/dish-edit.guard';
//import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from './../shared/shared.module';
//import { StarComponent } from './../shared/shared.module';
import { RestaurantEditGuard } from './../services/restaurant-edit.guard';
import { AuthenticationGuard } from './../services/authentication.guard';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { RestaurantEditComponent } from './restaurant-edit/restaurant-edit.component';
import { DishEditComponent } from './dish-edit/dish-edit.component';
import { DishListComponent } from './dish-list/dish-list.component';



@NgModule({
  declarations: [
    RestaurantListComponent,
    RestaurantEditComponent,
    DishEditComponent,
    DishListComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path:'restaurants', component:RestaurantListComponent, canActivate:[AuthenticationGuard]},
      {path:'restaurants/:id', component:RestaurantEditComponent, canActivate:[AuthenticationGuard]},
      {path:'restaurants/:id/edit', component:RestaurantEditComponent, canActivate:[AuthenticationGuard]/* , canDeactivate:[RestaurantEditGuard] */},
      {path:'restaurants/:id/dishes', component:DishListComponent, canActivate:[AuthenticationGuard]},
      {path:'dishes', component:DishListComponent, canActivate:[AuthenticationGuard]},
      {path:'dishes/:id', component:DishEditComponent, canActivate:[AuthenticationGuard]},
      {path:'dishes/:id/edit', component:DishEditComponent, canActivate:[AuthenticationGuard], canDeactivate:[DishEditGuard]}
      //{path:'welcome', component:WelcomeComponent, canActivate:[ComponentAccessGuard]}
    ])
  ]
})
export class RestaurantModule { }
