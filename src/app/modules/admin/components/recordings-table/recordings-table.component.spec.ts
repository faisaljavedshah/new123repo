import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingsTableComponent } from './recordings-table.component';

describe('RecordingsTableComponent', () => {
  let component: RecordingsTableComponent;
  let fixture: ComponentFixture<RecordingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordingsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
