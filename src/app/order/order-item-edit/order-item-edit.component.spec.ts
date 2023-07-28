import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemEditComponent } from './order-item-edit.component';

describe('OrderItemEditComponent', () => {
  let component: OrderItemEditComponent;
  let fixture: ComponentFixture<OrderItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderItemEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
