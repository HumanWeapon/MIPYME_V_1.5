import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PymeComponent } from './pyme.component';

describe('PymeComponent', () => {
  let component: PymeComponent;
  let fixture: ComponentFixture<PymeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PymeComponent]
    });
    fixture = TestBed.createComponent(PymeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
