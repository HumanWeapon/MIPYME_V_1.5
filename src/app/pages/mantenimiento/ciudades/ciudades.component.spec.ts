import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiudadesComponent } from './ciudades.component';

describe('CiudadesComponent', () => {
  let component: CiudadesComponent;
  let fixture: ComponentFixture<CiudadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CiudadesComponent]
    });
    fixture = TestBed.createComponent(CiudadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
