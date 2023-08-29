import { Subscription } from 'rxjs';
import { GeneralService } from './../../services/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Delivery } from './../../model/delivery';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.css']
})
export class DeliveryViewComponent implements OnInit {

  allDeliveries! : Delivery[];
  filteredDeliveries : Delivery[] = [];
  errorMessage:string = '';
  deliveryInfo : Delivery | undefined;

  private _sub : Subscription | undefined;
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
    this.filteredDeliveries = this.listFilter ? this.performFilter(this.listFilter) : this.allDeliveries;
  }

  constructor(private _route : ActivatedRoute, private _OrderService:OrderService, private _router : Router, private _deliveryModalService : NgbModal, private _generalService : GeneralService) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchDeliverys();
  }

  ngOnDestroy() : void{
    this.errorMessage = '';
    this._sub!.unsubscribe();
  }

  fetchDeliverys():void{
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(id);
        const driverId:number = +param.get('driverId')!;
        if(id > 0){
          this._OrderService.getDeliveryData(id).subscribe({
            next: (data:Delivery) => {
              this.allDeliveries = [];
              this.allDeliveries.push(data);
              this.filteredDeliveries = this.allDeliveries;
            },
            error : err => this.errorMessage = err.error.message
          });
        }else if(driverId > 0){
          this._OrderService.getDeliveriesByDriver(driverId).subscribe({
            next: (data:Delivery[]) => {
              this.allDeliveries = data;
              this.filteredDeliveries = this.allDeliveries;
            },
            error : err => this.errorMessage = err.error.message
          });
        }else{
          this._OrderService.getAllDeliverys().subscribe({
            next: (data:Delivery[]) => {
              this.allDeliveries = data;
              this.filteredDeliveries = this.allDeliveries;
            },
            error : err => this.errorMessage = err.error.message
          });
        }
      }
    );
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchDeliverys();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchDeliverys();
  }

  openDeliveryAddEdit(id:number){
    const editDeliveryurl = `/deliveries/${id}/edit`;
    //console.log(`navigating to url : ${editDeliveryurl}`);
    this._router.navigateByUrl(editDeliveryurl);
  }

  viewDriver(deliveryData : Delivery){
    if(deliveryData){
      const driverId = deliveryData.driver.id;
      this._router.navigate([`/drivers/${deliveryData.driver.id}`]);
    }
  }

  performFilter(filterBy: string): Delivery[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allDeliveries)}`);
    return this.allDeliveries.filter((data:Delivery) => {
      return data.deliveryTitle?.toLocaleLowerCase().includes(filterBy)// !== -1
    });
  }

  sort(colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    this._generalService.sort(this.allDeliveries,colName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }
}
