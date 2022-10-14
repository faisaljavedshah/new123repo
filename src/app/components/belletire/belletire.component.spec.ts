import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BelletireComponent } from './belletire.component';

describe('BelletireComponent', () => {
  let component: BelletireComponent;
  let fixture: ComponentFixture<BelletireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BelletireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BelletireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
