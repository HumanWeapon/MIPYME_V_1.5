import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasUsuarioComponent } from './preguntas-usuario.component';

describe('PreguntasUsuarioComponent', () => {
  let component: PreguntasUsuarioComponent;
  let fixture: ComponentFixture<PreguntasUsuarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreguntasUsuarioComponent]
    });
    fixture = TestBed.createComponent(PreguntasUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
