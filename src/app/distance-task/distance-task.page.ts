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
    if (this.state === 'tracking') return;

    try {
      await this.ensurePermissions();

      this.distanceMeters = 0;
      this.startPos = null;
      this.lastPos = null;

      this.state = 'tracking';

      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
        (pos, err) => {
          if (err || !pos?.coords) return;

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const current = { lat, lng };

          if (!this.startPos) {
            this.startPos = current;
            this.lastPos = current;
            return;
          }

          if (!this.lastPos) {
            this.lastPos = current;
            return;
          }

          const step = this.haversineMeters(this.lastPos.lat, this.lastPos.lng, current.lat, current.lng);

          // GPS-Jitter filtern: Mini-Sprünge ignorieren
          if (step >= 0.7 && step <= 25) {
            this.distanceMeters = Math.min(this.targetMeters, this.distanceMeters + step);
          }

          this.lastPos = current;

          if (this.distanceMeters >= this.targetMeters) {
            this.distanceMeters = this.targetMeters;
            this.completeAutomatically();
          }
        }
      );
    } catch {
      this.state = 'idle';
    }
  }

  async completeAutomatically() {
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
    this.state = 'idle';
    this.distanceMeters = 0;
    this.startPos = null;
    this.lastPos = null;
  }

  skipTask() {
    this.stopWatch();
    this.state = 'completed';
    this.distanceMeters = 0;
    this.startPos = null;
    this.lastPos = null;
  }

  get canFinish(): boolean {
    return this.state === 'tracking' && this.distanceMeters >= this.targetMeters;
  }

  get progressRatio(): number {
    return Math.max(0, Math.min(1, this.distanceMeters / this.targetMeters));
  }

  get distanceLabel(): string {
    return `${Math.round(this.distanceMeters)} / ${this.targetMeters} m`;
  }

  get startButtonText(): string {
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
}
