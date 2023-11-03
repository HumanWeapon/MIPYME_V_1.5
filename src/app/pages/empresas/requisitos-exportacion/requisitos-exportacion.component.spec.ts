import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitosExportacionComponent } from './requisitos-exportacion.component';

describe('RequisitosExportacionComponent', () => {
  let component: RequisitosExportacionComponent;
  let fixture: ComponentFixture<RequisitosExportacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequisitosExportacionComponent]
    });
    fixture = TestBed.createComponent(RequisitosExportacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
