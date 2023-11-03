import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitosComponent } from './requisitos.component';

describe('RequisitosComponent', () => {
  let component: RequisitosComponent;
  let fixture: ComponentFixture<RequisitosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequisitosComponent]
    });
    fixture = TestBed.createComponent(RequisitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
