import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PymesComponent } from './pymes.component';

describe('PymesComponent', () => {
  let component: PymesComponent;
  let fixture: ComponentFixture<PymesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PymesComponent]
    });
    fixture = TestBed.createComponent(PymesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
