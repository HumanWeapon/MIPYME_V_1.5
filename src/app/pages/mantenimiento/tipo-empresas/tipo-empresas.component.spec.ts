import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoEmpresasComponent } from './tipo-empresas.component';

describe('TipoEmpresasComponent', () => {
  let component: TipoEmpresasComponent;
  let fixture: ComponentFixture<TipoEmpresasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipoEmpresasComponent]
    });
    fixture = TestBed.createComponent(TipoEmpresasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
