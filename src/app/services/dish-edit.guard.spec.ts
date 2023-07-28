import { TestBed } from '@angular/core/testing';

import { DishEditGuard } from './dish-edit.guard';

describe('DishEditGuard', () => {
  let guard: DishEditGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DishEditGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
