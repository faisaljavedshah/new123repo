import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministraterComponent } from './administrater.component';

describe('AdministraterComponent', () => {
  let component: AdministraterComponent;
  let fixture: ComponentFixture<AdministraterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministraterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministraterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
