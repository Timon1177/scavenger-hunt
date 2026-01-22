import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
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
  title = 'Sensor';
  subtitle = 'Bewegung / Lage';
  taskTitle = 'Sensor-Aufgabe';
  taskDesc = 'Stelle das Gerät kurz auf den Kopf und warte, bis die Aufgabe abgeschlossen ist.';

  state: TaskState = 'idle';

  progress = 0; // 0..100
  private tickTimer: any = null;

  // Detection tuning
  private requiredHoldMs = 5000;
  private holdMs = 0;

  private lastTs = 0;

  // We consider "upside down" if beta is near +/-180 (DeviceOrientationEvent)
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

  finishTask(): void {
    if (!this.canFinish) return;
    // hier könnt ihr später Navigation/State speichern
  }

  cancelRun(): void {
    this.reset();
  }

  skipTask(): void {
    this.cleanup();
    this.state = 'completed';
    this.progress = 100;
  }

  private tick(): void {
    if (this.state !== 'running') return;

    const now = performance.now();
    const dt = Math.max(0, now - this.lastTs);
    this.lastTs = now;

    if (this.upsideDown) {
      this.holdMs = Math.min(this.requiredHoldMs, this.holdMs + dt);
    } else {
      // falloff, wenn wieder normal gehalten
      this.holdMs = Math.max(0, this.holdMs - dt * 1.5);
    }

    const ratio = this.requiredHoldMs === 0 ? 1 : this.holdMs / this.requiredHoldMs;
    this.progress = Math.round(Math.max(0, Math.min(100, ratio * 100)));

    if (this.progress >= 100) {
      this.state = 'completed';
      this.cleanup();
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
      const beta = e.beta; // -180..180 (front/back tilt)
      if (beta === null || beta === undefined) {
        this.upsideDown = false;
        return;
      }

      // upside-down if near 180 or -180 (allow some tolerance)
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
          // wenn nicht granted -> bleibt progress einfach stehen auf handy
        }
      } catch {
        // ignore
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
