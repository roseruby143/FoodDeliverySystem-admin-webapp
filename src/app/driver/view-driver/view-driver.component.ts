import { Subscription } from 'rxjs';
import { GeneralService } from './../../services/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { DriverService } from './../../services/driver.service';
import { Driver } from './../../model/driver';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-view-driver',
  templateUrl: './view-driver.component.html',
  styleUrls: ['./view-driver.component.css']
})
export class ViewDriverComponent implements OnInit {

  allDrivers! : Driver[];
  filteredDrivers : Driver[] = [];
  errorMessage:string = '';
  driverInfo : Driver | undefined;

  private _sub:Subscription | undefined;
  
  /********** For image */
/*   showImage = false;
  imageWidth = 50;
  imageMargin = 2; */

  /* ******** For Pagination ******* */
  page: number = 1;
  count: number = 0;
  tableSize: number = 7;
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
    this.filteredDrivers = this.listFilter ? this.performFilter(this.listFilter) : this.allDrivers;
  }

  constructor(private _route:ActivatedRoute, private _driverService:DriverService, private _router : Router, private _driverModalService : NgbModal, private _generalService : GeneralService) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchDrivers();
  }

  fetchDrivers():void{
    this._driverService.getAllDrivers().subscribe({
      next: (data:Driver[]) => {
        this.allDrivers = data;
        this.filteredDrivers = this.allDrivers;
      },
      error : err => this.errorMessage = err.error.message
    });
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchDrivers();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchDrivers();
  }

  openDriverAddEdit(id:number){
    const editDriverurl = `/drivers/${id}/edit`;
    //console.log(`navigating to url : ${editDriverurl}`);
    this._router.navigateByUrl(editDriverurl);
  }

  openDeactivateDriverModal(content:any, data:Driver){
    this.driverInfo = data;
    this._driverModalService.open(content).result.then(
			(result) => {
				//this._closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				//this._closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
  }

  deactivateDriver(dataToBeDeleted:Driver){
    if(dataToBeDeleted){
      //console.log(JSON.stringify(resDataToBeDeleted));
      dataToBeDeleted.status = dataToBeDeleted.status?.toLocaleLowerCase() === 'active'?'inactive':'active';
      //console.log(dataToBeDeleted.status);

      const resData = {...this.driverInfo, ...dataToBeDeleted};
      this._driverService.addEditDriver(resData,'update').subscribe({ 
        next : (data) => this.fetchDrivers(),
        error : err => {
          this.errorMessage = err.error.message;
        }
      });
      this.closeModel('deactivateDriverModal');
    }
  }

  viewDeliveries(data : Driver){
    this._router.navigate(['/driver',data.id,'deliveries']);
  }

  /* toggleImage(): void {
    this.showImage = !this.showImage;
  } */

  closeModel(modelRef:any) {
    this._driverModalService.dismissAll(modelRef);
  }

  performFilter(filterBy: string): Driver[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allDrivers)}`);
    return this.allDrivers.filter((data:Driver) => {
      return data.email.toLocaleLowerCase().includes(filterBy)// !== -1
    });
  }

  sort(colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    if(colName === 'name')
      colName = 'first_name';
    this._generalService.sort(this.allDrivers,colName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }

}
