import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherSideNavComponent } from './other-side-nav.component';

describe('OtherSideNavComponent', () => {
  let component: OtherSideNavComponent;
  let fixture: ComponentFixture<OtherSideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherSideNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
