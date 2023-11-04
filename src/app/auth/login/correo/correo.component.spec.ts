import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorreoComponent } from './correo.component';

describe('CorreoComponent', () => {
  let component: CorreoComponent;
  let fixture: ComponentFixture<CorreoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CorreoComponent]
    });
    fixture = TestBed.createComponent(CorreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
