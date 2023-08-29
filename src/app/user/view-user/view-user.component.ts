import { GeneralService } from './../../services/general.service';
import { UserService } from './../../services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { User } from './../../model/user';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit {

  allUsers! : User[];
  filteredUsers : User[] = [];
  errorMessage:string = '';
  userInfo : User | undefined;

  /* ******** For Pagination ******* */
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  //tableSizes: any = [3, 6, 9, 12];

  /* ********* For Sorting Table ********** */
  booleanValue: boolean = true;
  modifiedBy : string = 'id';

  private _listFilter = '';
  private _closeResult = '';

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredUsers = this.listFilter ? this.performFilter(this.listFilter) : this.allUsers;
  }

  constructor(private _userService:UserService, private _router : Router, private _userModalService : NgbModal, private _generalService : GeneralService) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchUsers();
  }

  fetchUsers():void{
    this._userService.getAllUsers().subscribe({
      next: (data:User[]) => {
        this.allUsers = data;
        this.filteredUsers = this.allUsers;
      },
      error : err => this.errorMessage = err.error.message
    });
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchUsers();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchUsers();
  }

  openUserAddEdit(id:number){
    const editUserurl = `/users/${id}/edit`;
    //console.log(`navigating to url : ${editUserurl}`);
    this._router.navigateByUrl(editUserurl);
  }

  openDeactivateUserModal(content:any, data:User){
    this.userInfo = data;
    this._userModalService.open(content).result.then(
			(result) => {
				//this._closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				//this._closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
  }

  deactivateUser(dataToBeDeleted:User){
    if(dataToBeDeleted){
      //console.log(JSON.stringify(resDataToBeDeleted));
      dataToBeDeleted.status = dataToBeDeleted.status.toLocaleLowerCase() === 'active'?'inactive':'active';
      //console.log(dataToBeDeleted.status);

      const resData = {...this.userInfo, ...dataToBeDeleted};
      this._userService.addEditUser(resData,'update').subscribe({ 
        next : (data) => this.fetchUsers(),
        error : err => {
          this.errorMessage = err.error.message;
        }
      });
      this.closeModel('deactivateUserModal');
    }
  }

  /* toggleImage(): void {
    this.showImage = !this.showImage;
  } */

  closeModel(modelRef:any) {
    this._userModalService.dismissAll(modelRef);
  }

  performFilter(filterBy: string): User[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allUsers)}`);
    return this.allUsers.filter((data:User) => {
      return data.email.toLocaleLowerCase().includes(filterBy) || data.first_name.toLocaleLowerCase().includes(filterBy) || data.last_name!.toLocaleLowerCase().includes(filterBy)// !== -1
    });
  }

  sort(colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    if(colName === 'name')
      colName = 'first_name';
    this._generalService.sort(this.allUsers,colName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }

}
