import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Permisos2Component } from './permisos2.component';

describe('Permisos2Component', () => {
  let component: Permisos2Component;
  let fixture: ComponentFixture<Permisos2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Permisos2Component]
    });
    fixture = TestBed.createComponent(Permisos2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
