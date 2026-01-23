import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TaskNavigationService {

  private order = [
    '/geolocation-task',
    '/distance-task',
    '/qr-scan-task',
    '/sensor-task',
    '/charge-task',
    '/wlan-task',
  ];

  constructor(private router: Router) {}

  start(): void {
    this.router.navigateByUrl('/permissions');
  }

  next(current: string): void {
    const i = this.order.indexOf(current);
    if (i === -1 || i === this.order.length - 1) {
      this.router.navigateByUrl('/result');
    } else {
      this.router.navigateByUrl(this.order[i + 1]);
    }
  }

  skip(current: string): void {
    this.next(current);
  }

  abort(): void {
    this.router.navigateByUrl('/leaderboard');
  }

  leaderboard(): void {
    this.router.navigateByUrl('/leaderboard');
  }
}
