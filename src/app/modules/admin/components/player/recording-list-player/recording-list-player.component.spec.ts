import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingListPlayerComponent } from './recording-list-player.component';

describe('RecordingListPlayerComponent', () => {
  let component: RecordingListPlayerComponent;
  let fixture: ComponentFixture<RecordingListPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordingListPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingListPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
