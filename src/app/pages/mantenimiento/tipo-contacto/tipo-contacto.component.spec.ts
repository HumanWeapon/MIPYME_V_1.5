import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoContactoComponent } from './tipo-contacto.component';

describe('TipoContactoComponent', () => {
  let component: TipoContactoComponent;
  let fixture: ComponentFixture<TipoContactoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipoContactoComponent]
    });
    fixture = TestBed.createComponent(TipoContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
