import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription, timer } from 'rxjs';

import { TaskNavigationService } from '../services/task-navigation.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonFooter,
} from '@ionic/angular/standalone';

import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LeaderboardService } from '../services/leaderboard.service';

type TaskState = 'idle' | 'tracking' | 'completed';

@Component({
  selector: 'app-distance-task',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonFooter,
  ],
  templateUrl: './distance-task.page.html',
  styleUrls: ['./distance-task.page.scss'],
})
export class DistanceTaskPage implements OnInit, OnDestroy {
  constructor(
    private nav: TaskNavigationService,
    private router: Router,
  ) {
    this.currentPathValue = this.router.url.split('?')[0];
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.currentPathValue = this.router.url.split('?')[0];
      });
  }

  private leaderboardService = inject(LeaderboardService);

  state: TaskState = 'idle';

  title = 'Laufen';
  subtitle = 'Bewegung';
  taskTitle = 'Laufe 20 Meter';
  taskDesc = 'Die App misst deine Bewegung über GPS.';

  targetMeters = 20;

  distanceMeters = 0;

  startPos: { lat: number; lng: number } | null = null;
  lastPos: { lat: number; lng: number } | null = null;

  private watchId: string | null = null;
  private updateTimer: any = null;
  private pointsGiven = false;

  private currentPathValue = '';
  private routerSub: Subscription;

  private subscription: Subscription | null = null;
  private getsPotato: boolean = false;

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer() {
    if (!this.subscription) {
      this.subscription = timer(600000, -1).subscribe(
        (n) => (this.getsPotato = true),
      );
    }
  }

  get progress(): number {
    if (this.targetMeters <= 0) return 0;
    const pct = (this.distanceMeters / this.targetMeters) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  get canFinish(): boolean {
    return this.state === 'completed';
  }

  get distanceLabel(): string {
    return `${Math.round(this.distanceMeters)} m`;
  }

  get buttonText(): string {
    return this.state === 'tracking' ? 'Tracking läuft…' : 'Tracking starten';
  }

  async startTracking(): Promise<void> {
    if (this.state === 'tracking' || this.state === 'completed') return;

    this.stopWatch();

    try {
      await this.ensurePermissionsOrThrow();

      this.pointsGiven = false;
      this.distanceMeters = 0;
      this.startPos = null;
      this.lastPos = null;

      this.state = 'tracking';

      const start = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      this.startPos = {
        lat: start.coords.latitude,
        lng: start.coords.longitude,
      };
      this.lastPos = { ...this.startPos };

      this.watchId = (await Geolocation.watchPosition(
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
        (pos, err) => {
          if (err) {
            console.error('watchPosition error', err);
            return;
          }
          if (!pos?.coords) return;
          if (!this.startPos) return;

          const acc = pos.coords.accuracy ?? 9999;
          if (acc > 50) return;

          const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.lastPos = cur;

          const total = this.haversineMeters(
            this.startPos.lat,
            this.startPos.lng,
            cur.lat,
            cur.lng,
          );

          this.distanceMeters = Math.max(this.distanceMeters, total);

          if (this.distanceMeters >= this.targetMeters) {
            void this.completeAutomatically();
          }
        },
      )) as unknown as string;

      this.updateTimer = setInterval(() => {
        void this.updateDistanceNow();
      }, 2000);
    } catch (e) {
      console.error('startTracking failed', e);
      this.stopWatch();
      this.state = 'idle';
      this.distanceMeters = 0;
      this.startPos = null;
      this.lastPos = null;
    }
  }

  private async updateDistanceNow(): Promise<void> {
    if (this.state !== 'tracking') return;
    if (!this.startPos) return;

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      });

      const acc = pos.coords.accuracy ?? 9999;
      if (acc > 50) return;

      const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      this.lastPos = cur;

      const total = this.haversineMeters(
        this.startPos.lat,
        this.startPos.lng,
        cur.lat,
        cur.lng,
      );

      this.distanceMeters = Math.max(this.distanceMeters, total);

      if (this.distanceMeters >= this.targetMeters) {
        await this.completeAutomatically();
      }
    } catch (e) {
      console.error('updateDistanceNow failed', e);
    }
  }

  private async completeAutomatically(): Promise<void> {
    if (this.state !== 'tracking') return;

    this.state = 'completed';
    this.stopWatch();

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    this.nav.next(this.currentPath());

    if (!this.pointsGiven) {
      this.pointsGiven = true;
      queueMicrotask(() => this.leaderboardService.increasePoints(this.getsPotato));
    }
  }

  cancelRun(): void {
    this.stopWatch();
    this.state = 'idle';
    this.distanceMeters = 0;
    this.startPos = null;
    this.lastPos = null;
    this.nav.abort();
  }

  skipTask(): void {
    this.stopWatch();
    this.nav.skip(this.currentPath());
  }

  nextTask(): void {
    this.nav.next(this.currentPath());
  }

  private stopWatch(): void {
    if (this.watchId) {
      try {
        Geolocation.clearWatch({ id: this.watchId });
      } catch {}
      this.watchId = null;
    }

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private async ensurePermissionsOrThrow(): Promise<void> {
    const perm = await Geolocation.checkPermissions();
    const ok = perm.location === 'granted' || perm.coarseLocation === 'granted';
    if (ok) return;

    const req = await Geolocation.requestPermissions();
    const ok2 = req.location === 'granted' || req.coarseLocation === 'granted';
    if (!ok2) throw new Error('No location permission');
  }

  private haversineMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private currentPath(): string {
    return this.currentPathValue || this.router.url.split('?')[0];
  }

  ngOnDestroy(): void {
    this.stopWatch();
    this.routerSub?.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
