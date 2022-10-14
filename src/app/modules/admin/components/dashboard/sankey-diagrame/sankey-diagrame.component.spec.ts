import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SankeyDiagrameComponent } from './sankey-diagrame.component';

describe('SankeyDiagrameComponent', () => {
  let component: SankeyDiagrameComponent;
  let fixture: ComponentFixture<SankeyDiagrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SankeyDiagrameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SankeyDiagrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
