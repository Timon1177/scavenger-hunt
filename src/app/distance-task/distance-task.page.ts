import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskNavigationService } from '../services/task-navigation.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonFooter
} from '@ionic/angular/standalone';

import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    IonFooter
  ],
  templateUrl: './distance-task.page.html',
  styleUrl: './distance-task.page.scss',
})
export class DistanceTaskPage implements OnDestroy {

  constructor(private nav: TaskNavigationService, private router: Router) {}

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

  async startTracking() {
    if (this.state === 'tracking' || this.state === 'completed') return;

    await this.ensurePermissions();

    this.state = 'tracking';
    this.distanceMeters = 0;

    const start = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    this.startPos = { lat: start.coords.latitude, lng: start.coords.longitude };
    this.lastPos = { ...this.startPos };

    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 },
      (pos) => {
        if (!pos?.coords) return;
        if (!this.startPos) return;

        const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (this.lastPos) {
          const step = this.haversineMeters(this.lastPos.lat, this.lastPos.lng, cur.lat, cur.lng);
          this.distanceMeters += step;
        }

        this.lastPos = cur;

        if (this.distanceMeters >= this.targetMeters) {
          void this.completeAutomatically();
        }
      }
    ) as unknown as string;
  }

  private async completeAutomatically(): Promise<void> {
    if (this.state !== 'tracking') return;

    this.state = 'completed';
    this.stopWatch();

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // web ignore
    }
  }

  async finishTask() {
    if (!this.canFinish) return;
    await this.completeAutomatically();
  }

  cancelRun() {
    this.stopWatch();
    this.nav.abort();
  }

  skipTask() {
    this.stopWatch();
    this.nav.skip(this.currentPath());
  }

  nextTask() {
    this.nav.next(this.currentPath());
  }

  get canFinish(): boolean {
    return this.state === 'tracking' && this.distanceMeters >= this.targetMeters;
  }

  get distanceLabel(): string {
    return `${Math.round(this.distanceMeters)} m`;
  }

  get buttonText(): string {
    return this.state === 'tracking' ? 'Tracking läuft…' : 'Tracking starten';
  }

  private stopWatch() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  private async ensurePermissions() {
    try {
      const perm = await Geolocation.checkPermissions();
      const ok = perm.location === 'granted' || perm.coarseLocation === 'granted';
      if (ok) return;

      const req = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation'],
      });

      const ok2 = req.location === 'granted' || req.coarseLocation === 'granted';
      if (!ok2) throw new Error('No permission');
    } catch {
      return;
    }
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  ngOnDestroy(): void {
    this.stopWatch();
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
