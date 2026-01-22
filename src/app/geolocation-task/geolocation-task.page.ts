import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonFooter,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

type TaskState = 'idle' | 'tracking' | 'completed';

@Component({
  selector: 'app-geolocation-task',
  host: { class: 'ion-page' },
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
    IonChip,
    IonLabel,
  ],
  templateUrl: './geolocation-task.page.html',
  styleUrls: ['./geolocation-task.page.scss'],
})
export class GeolocationTaskPage implements OnDestroy {
  constructor(private router: Router) {}

  state: TaskState = 'idle';
  title = 'Geolocation';
  intro =
    'Beweg dich in den Zielbereich. Sobald du nah genug bist, kannst du bestätigen.';

  target = { lat: 47.0502, lng: 8.3093 };
  targetRadiusMeters = 10;

  lastDistanceMeters: number | null = null;
  statusMode: 'too-far' | 'in-range' | 'unknown' = 'unknown';

  private timer: any = null;

  async ionViewWillEnter(): Promise<void> {
    // Nur checken/redirecten (keine Requests hier!)
    try {
      const p = await Geolocation.checkPermissions();
      const ok =
        p.location === 'granted' || (p as any).coarseLocation === 'granted';
      if (!ok) this.router.navigateByUrl('/permissions');
    } catch {
      // im Web kann checkPermissions anders sein; spätestens getCurrentPosition promptet
    }
  }

  async startTask(): Promise<void> {
    try {
      this.state = 'tracking';
      await this.updateDistanceOnce();

      this.timer = setInterval(() => {
        void this.updateDistanceOnce();
      }, 3000);
    } catch {
      this.state = 'idle';
      this.lastDistanceMeters = null;
      this.statusMode = 'unknown';
    }
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;

    this.state = 'completed';
    this.stopTracking();

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  }

  cancelRun(): void {
    this.stopTracking();
    this.state = 'idle';
    this.lastDistanceMeters = null;
    this.statusMode = 'unknown';
  }

  skipTask(): void {
    this.stopTracking();
    this.state = 'completed';
    this.lastDistanceMeters = null;
    this.statusMode = 'unknown';
  }

  get canFinish(): boolean {
    return (
      this.state === 'tracking' &&
      this.lastDistanceMeters !== null &&
      this.lastDistanceMeters <= this.targetRadiusMeters
    );
  }

  get distanceLabel(): string {
    if (this.lastDistanceMeters === null) return '—';
    return `${Math.round(this.lastDistanceMeters)} m`;
  }

  get statusLabel(): string {
    if (this.lastDistanceMeters === null) return 'Unbekannt';
    return this.lastDistanceMeters <= this.targetRadiusMeters
      ? 'In Reichweite'
      : 'Zu weit';
  }

  private stopTracking(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async updateDistanceOnce(): Promise<void> {
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 1000,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const d = this.haversineMeters(lat, lng, this.target.lat, this.target.lng);
      this.lastDistanceMeters = d;

      this.statusMode = d <= this.targetRadiusMeters ? 'in-range' : 'too-far';
    } catch {
      this.lastDistanceMeters = null;
      this.statusMode = 'unknown';
    }
  }

  private haversineMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }
}
