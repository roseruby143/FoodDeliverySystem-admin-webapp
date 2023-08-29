import { Subscription, Subject, takeUntil } from 'rxjs';
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

  private _destroy$ = new Subject<void>();

  private _sub! : Subscription | null;
   
  constructor(private _loginService:LoginService, private _router:Router) { 
    //this.adminId = 0;
    this.navBarList = [
      {
        'navLis' : 'Users',
        'navListDropdown' : [
            {'listName':'View User','listValue':'/users'},
            {'listName':'Add User','listValue':'/users/0/edit'}
        ]
      },
      {
        'navLis' : 'Admins',
        'navListDropdown' : [
            {'listName':'View Admin','listValue':'/view/admins'},
            {'listName':'Add Admin','listValue':'/add/admin'}
        ]
      }, 
      {
        'navLis':'Orders',
        'navListDropdown':[
            {'listName':'View Orders','listValue':'/orders'},
            {'listName':'Add Orders','listValue':'/orders/0/edit'},
            {'listName':'View OrderItems','listValue':'/orderitems'},
            {'listName':'View Deliveries','listValue':'/deliveries'},
            {'listName':'Add Deliveries','listValue':'/deliveries/0/edit'}
        ]
      },
      {
        'navLis' : 'Restaurants',
        'navListDropdown' : [
            {'listName':'View Restaurants','listValue':'/restaurants'},
            {'listName':'Add Restaurants','listValue':'/restaurants/0/edit'},
            {'listName':'View Dishes','listValue':'/dishes'},
            {'listName':'Add Dishes','listValue':'/dishes/0/edit'}
        ]
      },
      {
        'navLis':'Drivers',
        'navListDropdown':[
            {'listName':'View Drivers','listValue':'/drivers'},
            {'listName':'Add Drivers','listValue':'/drivers/0/edit'}
        ]
      }
    ];
  }

  get status(): boolean {
    return localStorage.getItem('status') ? true : false;
}

  ngOnInit(): void {
  }

  ngOnDestroy() : void{
    this._sub!.unsubscribe();
    this._destroy$.next();
    this._destroy$.complete();
  }

  get companyName():string{
    return this._companyName;
  }

  onLogout(){

    this._sub = this._loginService.onLogOut(+localStorage.getItem('adminId')!).subscribe({
      next : () => {
      },
      error : err => {
        console.log(`Error while logging out : ${err}`);
      }
    });

    localStorage.clear();
    //this.isUserLoggedIn = false;
    this._router.navigate(['/login']);
  }

  editProfile(){
    //console.log('/admin',this.adminId,'profile');
    this._router.navigate(['/admin',localStorage.getItem('adminId'),'profile']);
  }

  addAdmin(){
    this._router.navigate(['/admin','add','admin']);
  }


}
