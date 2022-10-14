import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpSignupComponent } from './otp-signup.component';

describe('OtpSignupComponent', () => {
  let component: OtpSignupComponent;
  let fixture: ComponentFixture<OtpSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
