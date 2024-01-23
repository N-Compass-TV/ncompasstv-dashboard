import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacerDataComponent } from './placer-data.component';

describe('PlacerDataComponent', () => {
  let component: PlacerDataComponent;
  let fixture: ComponentFixture<PlacerDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacerDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
