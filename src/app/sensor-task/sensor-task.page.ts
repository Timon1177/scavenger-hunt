import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskNavigationService } from '../services/task-navigation.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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
  IonLabel
} from '@ionic/angular/standalone';

type TaskState = 'idle' | 'running' | 'completed';

@Component({
  selector: 'app-sensor-task',
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
    IonLabel
  ],
  templateUrl: './sensor-task.page.html',
  styleUrl: './sensor-task.page.scss',
})
export class SensorTaskPage implements OnDestroy {

  constructor(private nav: TaskNavigationService, private router: Router) {}

  title = 'Sensor';
  subtitle = 'Bewegung / Lage';
  taskTitle = 'Sensor-Aufgabe';
  taskDesc = 'Stelle das Gerät kurz auf den Kopf und warte, bis die Aufgabe abgeschlossen ist.';

  state: TaskState = 'idle';

  progress = 0; // 0..100
  private tickTimer: any = null;

  private requiredHoldMs = 5000;
  private holdMs = 0;

  private lastTs = 0;

  private upsideDown = false;
  private orientationHandler?: (e: DeviceOrientationEvent) => void;

  get statusLabel(): string {
    if (this.state === 'completed') return 'Erkennung: abgeschlossen';
    if (this.state === 'running') return 'Erkennung: läuft';
    return 'Erkennung: wartet';
  }

  get statusMode(): 'wait' | 'run' | 'done' {
    if (this.state === 'completed') return 'done';
    if (this.state === 'running') return 'run';
    return 'wait';
  }

  get canFinish(): boolean {
    return this.state === 'completed';
  }

  async startTask(): Promise<void> {
    if (this.state === 'running' || this.state === 'completed') return;

    this.state = 'running';
    this.progress = 0;
    this.holdMs = 0;
    this.lastTs = performance.now();

    await this.requestMotionPermissionIfNeeded();
    this.attachOrientationListener();

    this.tickTimer = setInterval(() => this.tick(), 80);
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
    this.state = 'completed';
  }

  cancelRun(): void {
    this.reset();
    this.nav.abort();
  }

  skipTask(): void {
    this.cleanup();
    this.nav.skip(this.currentPath());
  }

  nextTask(): void {
    this.nav.next(this.currentPath());
  }

  private tick(): void {
    if (this.state !== 'running') return;

    const now = performance.now();
    const dt = Math.max(0, now - this.lastTs);
    this.lastTs = now;

    if (this.upsideDown) {
      this.holdMs = Math.min(this.requiredHoldMs, this.holdMs + dt);
    } else {
      this.holdMs = Math.max(0, this.holdMs - dt * 1.5);
    }

    const ratio = this.requiredHoldMs === 0 ? 1 : this.holdMs / this.requiredHoldMs;
    this.progress = Math.round(Math.max(0, Math.min(100, ratio * 100)));

    if (this.progress >= 100) {
      this.state = 'completed';
      this.cleanup();
      void (async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {}
      })();
    }
  }

  private reset(): void {
    this.cleanup();
    this.state = 'idle';
    this.progress = 0;
    this.holdMs = 0;
  }

  private cleanup(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.detachOrientationListener();
  }

  private attachOrientationListener(): void {
    if (this.orientationHandler) return;

    this.orientationHandler = (e: DeviceOrientationEvent) => {
      const beta = e.beta;
      if (beta === null || beta === undefined) {
        this.upsideDown = false;
        return;
      }

      const abs = Math.abs(beta);
      this.upsideDown = abs > 150;
    };

    window.addEventListener('deviceorientation', this.orientationHandler, true);
  }

  private detachOrientationListener(): void {
    if (!this.orientationHandler) return;
    window.removeEventListener('deviceorientation', this.orientationHandler, true);
    this.orientationHandler = undefined;
    this.upsideDown = false;
  }

  private async requestMotionPermissionIfNeeded(): Promise<void> {
    const anyDeviceOrientation = DeviceOrientationEvent as any;
    if (typeof anyDeviceOrientation?.requestPermission === 'function') {
      try {
        const res = await anyDeviceOrientation.requestPermission();
        if (res !== 'granted') {
        }
      } catch {
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
