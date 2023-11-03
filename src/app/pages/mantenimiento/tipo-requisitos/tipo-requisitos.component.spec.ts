import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoRequisitosComponent } from './tipo-requisitos.component';

describe('TipoRequisitosComponent', () => {
  let component: TipoRequisitosComponent;
  let fixture: ComponentFixture<TipoRequisitosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipoRequisitosComponent]
    });
    fixture = TestBed.createComponent(TipoRequisitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
