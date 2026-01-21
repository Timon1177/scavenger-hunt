import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorTaskPage } from './sensor-task.page';

describe('SensorTaskPage', () => {
  let component: SensorTaskPage;
  let fixture: ComponentFixture<SensorTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
