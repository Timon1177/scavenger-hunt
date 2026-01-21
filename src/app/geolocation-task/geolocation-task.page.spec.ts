import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeolocationTaskPage } from './geolocation-task.page';

describe('GeolocationTaskPage', () => {
  let component: GeolocationTaskPage;
  let fixture: ComponentFixture<GeolocationTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GeolocationTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
