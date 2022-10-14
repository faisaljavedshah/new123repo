import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfaIntegrationsComponent } from './cfa-integrations.component';

describe('CfaIntegrationsComponent', () => {
  let component: CfaIntegrationsComponent;
  let fixture: ComponentFixture<CfaIntegrationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CfaIntegrationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CfaIntegrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
