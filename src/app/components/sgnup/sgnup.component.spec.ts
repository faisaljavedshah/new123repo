import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SgnupComponent } from './sgnup.component';

describe('SgnupComponent', () => {
  let component: SgnupComponent;
  let fixture: ComponentFixture<SgnupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SgnupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SgnupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
