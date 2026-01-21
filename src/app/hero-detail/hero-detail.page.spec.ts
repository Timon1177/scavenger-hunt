import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroDetailPage } from './hero-detail.page';

describe('HeroDetailPage', () => {
  let component: HeroDetailPage;
  let fixture: ComponentFixture<HeroDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
