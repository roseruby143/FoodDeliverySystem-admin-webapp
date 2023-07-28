import { Dish } from './dish';
import { Order } from './order';
export interface OrderItem {
    orderItemId : number,
    quantity : number,
    itemTotalPrice : number,
    order : Order,
    dish : Dish
}
