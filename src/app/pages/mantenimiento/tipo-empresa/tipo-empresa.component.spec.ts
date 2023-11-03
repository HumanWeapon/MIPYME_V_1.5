import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoEmpresaComponent } from './tipo-empresa.component';

describe('TipoEmpresaComponent', () => {
  let component: TipoEmpresaComponent;
  let fixture: ComponentFixture<TipoEmpresaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipoEmpresaComponent]
    });
    fixture = TestBed.createComponent(TipoEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
