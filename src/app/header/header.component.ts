import { Subscription } from 'rxjs';
import { Admin } from './../model/admin';
import { ProfileService } from './../services/profile.service';
import { LoginService } from './../services/login.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private _companyName : string = 'Eat Out';
  //private _subscribeObject;
  errorMessage:string = '';

  navBarList! : any;
  adminId! : number;

  private _sub! : Subscription | null;
   
  constructor(public loginServiceObj:LoginService, private _router:Router, private _adminService : ProfileService) { 
    this.navBarList = [
      {
        'navLis' : 'User Management',
        'navListDropdown' : [
            {'listName':'View User','listValue':'/users'},
            {'listName':'Add User','listValue':'/users/0/edit'}
        ]
      }, 
      {
        'navLis':'Order Management',
        'navListDropdown':[
            {'listName':'View Orders','listValue':'/orders'},
            {'listName':'Add Orders','listValue':'/orders/0/edit'},
            {'listName':'View OrderItems','listValue':'/orderitems'},
            {'listName':'Add OrderItems','listValue':'/orderitems/0/edit'},
            {'listName':'View Deliveries','listValue':'/deliveries'},
            {'listName':'Add Deliveries','listValue':'/deliveries/0/edit'}
        ]
      },
      {
        'navLis' : 'Restaurant Management',
        'navListDropdown' : [
            {'listName':'View Restaurants','listValue':'/restaurants'},
            {'listName':'Add Restaurants','listValue':'/restaurants/0/edit'},
            {'listName':'View Dishes','listValue':'/dishes'},
            {'listName':'Add Dishes','listValue':'/dishes/0/edit'}
        ]
      },
      {
        'navLis':'Driver Management',
        'navListDropdown':[
            {'listName':'View Drivers','listValue':'/drivers'},
            {'listName':'Add Drivers','listValue':'/drivers/0/edit'}
        ]
      }
    ];
  }

  //userNameDisplayed:string = this.loginServiceObj.loginUser;
  //baseUrl:string = window.location.pathname;
  isUserLoggedIn = false;

  get status(): boolean {
    return localStorage.getItem('status') ? true : false;
}

  ngOnInit(): void {
    this.isUserLoggedIn = localStorage.getItem('status')==='loggedIn'?true:false;
    //console.log(JSON.parse(localStorage.getItem('loggedInAdminData')!));
    this.adminId = 7;
  }

  ngOnDestroy() : void{
    this._sub!.unsubscribe();
  }

  get companyName():string{
    return this._companyName;
  }

  onLogout(){
    localStorage.clear();
    this.isUserLoggedIn = false;
    this._router.navigate(['/login']);
  }

}
