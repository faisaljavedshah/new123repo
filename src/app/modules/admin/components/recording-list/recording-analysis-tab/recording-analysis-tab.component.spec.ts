import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingAnalysisTabComponent } from './recording-analysis-tab.component';

describe('RecordingAnalysisTabComponent', () => {
  let component: RecordingAnalysisTabComponent;
  let fixture: ComponentFixture<RecordingAnalysisTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordingAnalysisTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingAnalysisTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
