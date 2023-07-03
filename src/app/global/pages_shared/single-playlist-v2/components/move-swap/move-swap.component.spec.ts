import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveSwapComponent } from './move-swap.component';

describe('MoveSwapComponent', () => {
  let component: MoveSwapComponent;
  let fixture: ComponentFixture<MoveSwapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveSwapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
