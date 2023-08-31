import { AuthenticationGuard } from './services/authentication.guard';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { RequestInterceptor } from './interceptor/request.interceptor';
import { AdminModule } from './admin/admin.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './authentication/login/login.component';
import { SharedModule } from './shared/shared.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RestaurantModule } from './restaurant/restaurant.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { OrderModule } from './order/order.module';
import { ProfileModule } from './profile/profile.module';
import { DatePipe } from '@angular/common';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {path: 'login' , component: LoginComponent},
      {path: 'welcome' , component: WelcomeComponent, canActivate:[AuthenticationGuard]},
      {path: '' , redirectTo: 'login', pathMatch:'full'},
      {path: '**' , redirectTo: 'login', pathMatch:'full'}
    ]),
    AuthenticationModule,
    SharedModule,
    NgbModule,
    RestaurantModule,
    UserModule,
    DriverModule,
    OrderModule,
    ProfileModule,
    AdminModule
    //,NgModule
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
