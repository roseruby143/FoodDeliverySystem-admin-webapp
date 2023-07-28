import { OrderItem } from './../model/order-item';
import { Order } from './../model/order';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Delivery } from '../model/delivery';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  constructor(private _httpClient : HttpClient) { }

  headers = new HttpHeaders({'Content-Type' : 'application/json'});

  /* Get All Order*/
  getAllOrders() {
    return this._httpClient.get<Order[]>(`${environment.baseUrl}/v1/orders`,{headers:this.headers});
  }

  /* Get Order by Id*/
  getOrderById(orderId:number):Observable<Order> {
    return this._httpClient.get<Order>(`${environment.baseUrl}/v1/orders/${orderId}`,{headers:this.headers});
  }

  /* Get Order by Id*/
  getOrdersByUserId(userId:number):Observable<Order[]> {
    return this._httpClient.get<Order[]>(`${environment.baseUrl}/v1/user/${userId}/orders`,{headers:this.headers});
  }

  /* Add new Order or Edit Order with Id */
  addEditOrder(orderData:Order,action:string):Observable<Order>{
    if(action === 'update')
      return this._httpClient.put<Order>(`${environment.baseUrl}/v1/orders/${orderData.orderId}`,orderData,{headers:this.headers});
    else
      return this._httpClient.post<Order>(`${environment.baseUrl}/v1/user/${orderData.user.id}/orders`,orderData,{headers:this.headers});
  }

  /* Get All Deliverys*/
  getAllDeliverys():Observable<Delivery[]> {
    return this._httpClient.get<Delivery[]>(`${environment.baseUrl}/v1/delivery`,{headers:this.headers});
  }

  /* Get Deliverys by Id*/
  getDeliveryData(deliveryId:number):Observable<Delivery> {
    return this._httpClient.get<Delivery>(`${environment.baseUrl}/v1/delivery/${deliveryId}`,{headers:this.headers});
  }

  /* Get Deliveries by Driver Id*/
  getDeliveriesByDriver(driverId:number):Observable<Delivery[]> {
    return this._httpClient.get<Delivery[]>(`${environment.baseUrl}/v1/driver/${driverId}/delivery`,{headers:this.headers});
  }

  /* Add new Delivery or Edit Deliverys with Id */
  addEditDelivery(deliveryData:Delivery,action:string):Observable<Delivery>{
    if(action === 'update')
      return this._httpClient.put<Delivery>(`${environment.baseUrl}/v1/delivery/${deliveryData.id}`,deliveryData,{headers:this.headers});
    else
      return this._httpClient.post<Delivery>(`${environment.baseUrl}/v1/delivery`,deliveryData,{headers:this.headers});
  }

  /* Delete Deliverys is not allowed*/

  /* Get All Deliverys*/
  getAllOrderItems():Observable<OrderItem[]> {
    return this._httpClient.get<OrderItem[]>(`${environment.baseUrl}/v1/orderitems`,{headers:this.headers});
  }

  /* Get Deliverys by Id*/
  getOrderItemsById(id:number):Observable<OrderItem> {
    return this._httpClient.get<OrderItem>(`${environment.baseUrl}/v1/orderitems/${id}`,{headers:this.headers});
  }

  /* Get All OrderItems by Order Id*/
  getOrderItemsByOrderId(orderId:number):Observable<OrderItem[]> {
    return this._httpClient.get<OrderItem[]>(`${environment.baseUrl}/v1/orders/${orderId}/orderitems`,{headers:this.headers});
  }

  /* Add new Delivery or Edit OrderItem with Id */
  addEditOrderItems(data:OrderItem,action:string):Observable<OrderItem>{
    if(action === 'update')
      return this._httpClient.put<OrderItem>(`${environment.baseUrl}/v1/orderitems/${data.orderItemId}`,data,{headers:this.headers});
    else
      return this._httpClient.post<OrderItem>(`${environment.baseUrl}/v1/orders/${data.order.orderId}/orderitems`,data,{headers:this.headers});
  }

  
}
