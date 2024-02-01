import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerativeModalComponent } from './generative-modal.component';

describe('GenerativeModalComponent', () => {
  let component: GenerativeModalComponent;
  let fixture: ComponentFixture<GenerativeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerativeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerativeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
