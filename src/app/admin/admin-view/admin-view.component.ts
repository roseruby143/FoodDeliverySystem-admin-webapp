import { ProfileService } from './../../services/profile.service';
import { GeneralService } from './../../services/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Admin } from './../../model/admin';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {

  allAdmins! : Admin[];
  filteredAdmins : Admin[] = [];
  errorMessage:string = '';
  adminInfo : Admin | undefined;

  /* ******** For Pagination ******* */
  page: number = 1;
  count: number = 0;
  tableSize: number = 3;
  //tableSizes: any = [3, 6, 9, 12];

  /* ********* For Sorting Table ********** */
  booleanValue: boolean = true;
  modifiedBy : string = 'id';

  private _listFilter = '';

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredAdmins = this.listFilter ? this.performFilter(this.listFilter) : this.allAdmins;
  }

  constructor(private _adminService:ProfileService, private _router : Router, private _modal : NgbModal, private _generalService : GeneralService) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchAdmins();
  }

  fetchAdmins():void{
    this._adminService.getAllAdmins().subscribe({
      next: (data:Admin[]) => {
        this.allAdmins = data;
        this.filteredAdmins = this.allAdmins;
      },
      error : err => this.errorMessage = err.error.message
    });
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchAdmins();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchAdmins();
  }

  openAdminAddEdit(id:number){
    const editAdminurl = `/edit/admin/${id}`;
    //console.log(`navigating to url : ${editAdminurl}`);
    this._router.navigateByUrl(editAdminurl);
  }

  openAdminAdd(){
    this._router.navigateByUrl('/add/admin');
  }

  openDeactivateAdminModal(content:any, data:Admin){
    this.adminInfo = data;
    this._modal.open(content);
  }

  deactivateAdmin(dataToBeDeleted:Admin){
    if(dataToBeDeleted){
      //console.log(JSON.stringify(resDataToBeDeleted));
      dataToBeDeleted.status = dataToBeDeleted.status.toLocaleLowerCase() === 'active'?'inactive':'active';
      //console.log(dataToBeDeleted.status);

      const resData : Admin = {...this.adminInfo, ...dataToBeDeleted};
      this._adminService.editAdmin(resData).subscribe({ 
        next : (data) => this.fetchAdmins(),
        error : err => {
          this.errorMessage = err.error.message;
        }
      });
      this.closeModel('deactivateAdminModal');
    }
  }

  /* toggleImage(): void {
    this.showImage = !this.showImage;
  } */

  closeModel(modelRef:any) {
    this._modal.dismissAll(modelRef);
  }

  performFilter(filterBy: string): Admin[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allAdmins)}`);
    return this.allAdmins.filter((data:Admin) => {
      return data.email.toLocaleLowerCase().includes(filterBy) || data.fullName.toLocaleLowerCase().includes(filterBy)// !== -1
    });
  }

  sort(colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    if(colName === 'name')
      colName = 'first_name';
    this._generalService.sort(this.allAdmins,colName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }

}