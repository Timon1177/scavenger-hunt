import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermisionsPage } from './permisions.page';

describe('PermisionsPage', () => {
  let component: PermisionsPage;
  let fixture: ComponentFixture<PermisionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
