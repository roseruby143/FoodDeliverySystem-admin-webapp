import { User } from './user';
import { Delivery } from './delivery';
export interface Order {
    orderId : number,
    orderDate : Date,
    orderStatus : string,
    totalItems : number,
    itemsSubTotal : number,
    taxCharges : number,
    deliveryCharges : number,
    driverTip : number,
    totalAmount : number,
    paymentStatus : number,
    paymentStatusTitle? : string,
    paymentMethod : number,
    paymentMethodTitle? : string,
    user : User,
    delivery? : Delivery
}
