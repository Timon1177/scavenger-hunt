import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrScanTaskPage } from './qr-scan-task.page';

describe('QrScanTaskPage', () => {
  let component: QrScanTaskPage;
  let fixture: ComponentFixture<QrScanTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrScanTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
