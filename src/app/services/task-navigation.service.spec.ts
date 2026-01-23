import { TestBed } from '@angular/core/testing';
import { TaskNavigationService } from './task-navigation.service';
describe('TaskNavigationService', () => {
  let service: TaskNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
