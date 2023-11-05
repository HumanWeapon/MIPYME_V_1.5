import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPymeComponent } from './login-pyme.component';

describe('LoginPymeComponent', () => {
  let component: LoginPymeComponent;
  let fixture: ComponentFixture<LoginPymeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPymeComponent]
    });
    fixture = TestBed.createComponent(LoginPymeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
