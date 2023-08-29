import { AuthenticationGuard } from './../services/authentication.guard';
import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderViewComponent } from './order-view/order-view.component';
import { OrderEditComponent } from './order-edit/order-edit.component';
import { OrderItemViewComponent } from './order-item-view/order-item-view.component';
import { OrderItemEditComponent } from './order-item-edit/order-item-edit.component';
import { DeliveryEditComponent } from './delivery-edit/delivery-edit.component';
import { DeliveryViewComponent } from './delivery-view/delivery-view.component';



@NgModule({
  declarations: [
    OrderViewComponent,
    OrderEditComponent,
    OrderItemViewComponent,
    OrderItemEditComponent,
    DeliveryEditComponent,
    DeliveryViewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {path:'orders', component:OrderViewComponent, canActivate:[AuthenticationGuard]},
      {path:'user/:id/orders', component:OrderViewComponent, canActivate:[AuthenticationGuard]},
      {path:'orders/:id', component:OrderEditComponent, canActivate:[AuthenticationGuard]},
      {path:'orders/:id/edit', component:OrderEditComponent, canActivate:[AuthenticationGuard]},
      {path:'orderitems', component:OrderItemViewComponent, canActivate:[AuthenticationGuard]},
      {path:'orders/:id/orderitems', component:OrderItemViewComponent, canActivate:[AuthenticationGuard]},
      {path:'orderitems/:id', component:OrderItemEditComponent, canActivate:[AuthenticationGuard]},
      {path:'orderitems/:id/edit', component:OrderItemEditComponent, canActivate:[AuthenticationGuard]},
      {path:'deliveries', component:DeliveryViewComponent, canActivate:[AuthenticationGuard]},
      {path:'driver/:driverId/deliveries', component:DeliveryViewComponent, canActivate:[AuthenticationGuard]},
      {path:'deliveries/:id', component:DeliveryViewComponent, canActivate:[AuthenticationGuard]},
      {path:'deliveries/:id/edit', component:DeliveryEditComponent, canActivate:[AuthenticationGuard]}
    ])
  ]
})
export class OrderModule { }
