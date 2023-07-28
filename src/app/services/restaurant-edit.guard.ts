import { RestaurantEditComponent } from './../restaurant/restaurant-edit/restaurant-edit.component';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantEditGuard implements CanDeactivate<RestaurantEditComponent> {
  canDeactivate(
    component: RestaurantEditComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
      if(component.restaurantListForm!=null && component.restaurantListForm!.dirty){
        const restName = component.restaurantListForm.get('name')?.value || 'New Restaurant';
        confirm(`${restName} data has been changed. If you proceed, you will lose all the changes. Do you want to proceed?`);
      }
    
      return true;
  }
  
}
