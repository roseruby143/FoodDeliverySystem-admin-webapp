import { TestBed } from '@angular/core/testing';

import { RestaurantEditGuard } from './restaurant-edit.guard';

describe('RestaurantEditGuard', () => {
  let guard: RestaurantEditGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RestaurantEditGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
