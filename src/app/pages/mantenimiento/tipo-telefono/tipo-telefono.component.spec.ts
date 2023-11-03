import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoTelefonoComponent } from './tipo-telefono.component';

describe('TipoTelefonoComponent', () => {
  let component: TipoTelefonoComponent;
  let fixture: ComponentFixture<TipoTelefonoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipoTelefonoComponent]
    });
    fixture = TestBed.createComponent(TipoTelefonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
