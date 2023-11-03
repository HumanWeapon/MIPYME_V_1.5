import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresasProductosComponent } from './empresas-productos.component';

describe('EmpresasProductosComponent', () => {
  let component: EmpresasProductosComponent;
  let fixture: ComponentFixture<EmpresasProductosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpresasProductosComponent]
    });
    fixture = TestBed.createComponent(EmpresasProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
