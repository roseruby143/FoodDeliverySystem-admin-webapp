import { DishEditComponent } from './../restaurant/dish-edit/dish-edit.component';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DishEditGuard implements CanDeactivate<DishEditComponent> {
  canDeactivate(
    component: DishEditComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      if(component.dishListForm!=null && component.dishListForm!.dirty){
        const dishName = component.dishListForm.get('name')?.value || 'New Dish';
        confirm(`${dishName} data has been changed. If you proceed, you will lose all the changes. Do you want to proceed?`);
      }
    
      return true;
  }
  
}
