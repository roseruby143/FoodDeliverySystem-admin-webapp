import { GeneralService } from './../../services/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from './../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Order } from './../../model/order';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.css']
})
export class OrderViewComponent implements OnInit {

  allOrder! : Order[];
  filteredOrder : Order[] = [];
  errorMessage:string = '';
  orderInfo : Order | undefined;

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
    this.filteredOrder = this.listFilter ? this.performFilter(this.listFilter) : this.allOrder;
  }

  constructor(private _route : ActivatedRoute, private _orderService:OrderService, private _router : Router, private _orderModalService : NgbModal, private _generalService : GeneralService) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchOrders();
  }

  ngOnDestroy() : void{
    this.errorMessage = '';
    this._sub!.unsubscribe();
  }

  fetchOrders():void{
    this._sub = this._route.paramMap.subscribe(
      param => {
        let isUserinUrl : boolean = this._router.url.includes('user');
        if(isUserinUrl){
          const id:number = +param.get('id')!;
          this._orderService.getOrdersByUserId(id).subscribe({
            next: (data:Order[]) => {
              this.allOrder = data;
              this.filteredOrder = this.allOrder;
            },
            error : err => this.errorMessage = err.error.message
          });
        }else{
          this._orderService.getAllOrders().subscribe({
            next: (data:Order[]) => {
              this.allOrder = data;
              this.filteredOrder = this.allOrder;
            },
            error : err => this.errorMessage = err.error.message
          });
        }
      }
    );
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchOrders();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchOrders();
  }

  openOrderAddEdit(id:number){
    const editOrderurl = `/orders/${id}/edit`;
    //console.log(`navigating to url : ${editOrderurl}`);
    this._router.navigateByUrl(editOrderurl);
  }

  /* viewDriver(OrderData : Order){
    if(OrderData){
      const driverId = OrderData.driver.id;
      this._router.navigate([`/drivers/${OrderData.driver.id}`]);
    }
  } */

  performFilter(filterBy: string): Order[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allOrder)}`);
    return this.allOrder.filter((data:Order) => {
      return data.user!.first_name?.toLocaleLowerCase().includes(filterBy) || data.user!.last_name?.toLocaleLowerCase().includes(filterBy) || data.orderId?.toLocaleString().includes(filterBy)// !== -1
    });
  }

  sort(colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    this._generalService.sort(this.allOrder,colName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }
}
