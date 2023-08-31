import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private _router : Router) { }

  ngOnInit(): void {
  }

  editProfile(){
    //console.log('/admin',this.adminId,'profile');
    this._router.navigate(['/admin',localStorage.getItem('adminId'),'profile']);
  }

}
