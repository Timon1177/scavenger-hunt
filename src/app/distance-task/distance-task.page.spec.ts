import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistanceTaskPage } from './distance-task.page';

describe('DistanceTaskPage', () => {
  let component: DistanceTaskPage;
  let fixture: ComponentFixture<DistanceTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DistanceTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
