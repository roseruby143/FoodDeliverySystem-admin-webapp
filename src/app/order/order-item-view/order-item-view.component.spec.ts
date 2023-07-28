import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemViewComponent } from './order-item-view.component';

describe('OrderItemViewComponent', () => {
  let component: OrderItemViewComponent;
  let fixture: ComponentFixture<OrderItemViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderItemViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
