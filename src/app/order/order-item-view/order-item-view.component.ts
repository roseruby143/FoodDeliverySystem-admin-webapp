import { GeneralService } from './../../services/general.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from './../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderItem } from './../../model/order-item';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fds-order-item-view',
  templateUrl: './order-item-view.component.html',
  styleUrls: ['./order-item-view.component.css']
})
export class OrderItemViewComponent implements OnInit {

  allOrderItem! : OrderItem[];
  filteredOrderItem : OrderItem[] = [];
  errorMessage:string = '';
  orderItemInfo : OrderItem | undefined;

  private _sub : Subscription | undefined;
  /* ******** For Pagination ******* */
  page: number = 1;
  count: number = 0;
  tableSize: number = 7;
  //tableSizes: any = [3, 6, 9, 12];

  /* ********* For Sorting Table ********** */
  booleanValue: boolean = true;
  modifiedBy : string = 'orderItemId';

  private _listFilter = '';

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredOrderItem = this.listFilter ? this.performFilter(this.listFilter) : this.allOrderItem;
  }

  constructor(private _route : ActivatedRoute, private _orderService:OrderService, private _router : Router, private _orderItemModalService : NgbModal, private _generalService : GeneralService) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.fetchOrderItems();
  }

  ngOnDestroy() : void{
    this.errorMessage = '';
    this._sub!.unsubscribe();
  }

  fetchOrderItems():void{
    this._sub = this._route.paramMap.subscribe(
      param => {
        let isOrderinUrl : boolean = this._router.url.includes('orders');
        if(isOrderinUrl){
          const id:number = +param.get('id')!;
          this._orderService.getOrderItemsByOrderId(id).subscribe({
            next: (data:OrderItem[]) => {
              this.allOrderItem = data;
              this.filteredOrderItem = this.allOrderItem;
            },
            error : err => this.errorMessage = err.error.message
          });
        }else{
          this._orderService.getAllOrderItems().subscribe({
            next: (data:OrderItem[]) => {
              this.allOrderItem = data;
              this.filteredOrderItem = this.allOrderItem;
            },
            error : err => this.errorMessage = err.error.message
          });
        }
      }
    );
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchOrderItems();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchOrderItems();
  }

  openOrderItemAddEdit(id:number){
    const editOrderItemurl = `/orderitems/${id}/edit`;
    //console.log(`navigating to url : ${editOrderItemurl}`);
    this._router.navigateByUrl(editOrderItemurl);
  }
  
  performFilter(filterBy: string): OrderItem[] {
    filterBy = filterBy.toLocaleLowerCase();
    //console.log(`filterBy : ${JSON.stringify(this.allOrderItem)}`);
    return this.allOrderItem.filter((data:OrderItem) => {
      return data.order.orderId == Number(filterBy)// !== -1
    });
  }

  sort(colName:any, boolean:boolean) {
    this.modifiedBy = colName;
    this._generalService.sort(this.allOrderItem,colName,this.booleanValue);
    this.booleanValue = !this.booleanValue;
  }
}
