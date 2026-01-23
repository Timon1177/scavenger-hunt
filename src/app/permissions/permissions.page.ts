import { Component, OnInit } from '@angular/core';
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
  IonFooter,
} from '@ionic/angular/standalone';

import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

type PermState = 'unknown' | 'granted' | 'denied';

@Component({
  selector: 'app-permissions',
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
  templateUrl: './permissions.page.html',
  styleUrls: ['./permissions.page.scss'],
})
export class PermissionsPage implements OnInit {
  constructor(
    private nav: TaskNavigationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.ionViewWillEnter();
  }

  title = 'Berechtigungen';
  subtitle = "Einmal erlauben, dann läuft's.";

  headline = 'Wir brauchen kurz Zugriff.';
  description =
    'Standort für Geolocation-Aufgaben und Kamera für QR-Scan. Ohne das kann die Schnitzeljagd nicht starten.';

  locationPerm: PermState = 'unknown';
  cameraPerm: PermState = 'unknown';

  ionViewWillEnter(): void {
    void this.refreshPermissionsWithRetries();
  }

  get canContinue(): boolean {
    return this.locationPerm === 'granted' && this.cameraPerm === 'granted';
  }

  async refreshPermissions(): Promise<void> {
    this.locationPerm = await this.checkLocation();
    this.cameraPerm = await this.checkCamera();
  }

  private async refreshPermissionsWithRetries(tries = 6, delayMs = 350): Promise<void> {
    for (let i = 0; i < tries; i++) {
      await this.refreshPermissions();
      if (this.canContinue) return;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  async requestAll(): Promise<void> {
    await this.requestLocationPrompt();
    await this.requestCameraPrompt();
    await this.refreshPermissionsWithRetries();
  }

  back(): void {
    this.router.navigateByUrl('/home');
  }

  next(): void {
    if (!this.canContinue) return;
    this.router.navigateByUrl('/geolocation-task');
  }

  private async checkLocation(): Promise<PermState> {
    try {
      const p = await Geolocation.checkPermissions();
      const coarse = (p as any).coarseLocation as string | undefined;

      const loc = this.normalizePerm(p.location);
      const crs = this.normalizePerm(coarse);

      if (loc === 'granted' || crs === 'granted') return 'granted';
      if (loc === 'denied' || crs === 'denied') return 'denied';

      try {
        const navPerm = await (navigator as any).permissions?.query?.({ name: 'geolocation' });
        const st = this.normalizePerm(navPerm?.state);
        if (st !== 'unknown') return st;
      } catch {}

      return 'unknown';
    } catch (e) {
      console.error('checkLocation failed', e);
      return 'unknown';
    }
  }

  private async requestLocationPrompt(): Promise<void> {
    try {
      try {
        await Geolocation.requestPermissions();
      } catch {}

      await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    } catch (e) {
      console.error('Location prompt failed', e);

      try {
        await new Promise<void>((resolve, reject) => {
          if (!('geolocation' in navigator))
            return reject('no geolocation api');
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        });
      } catch (e2) {
        console.error('Browser geolocation fallback failed', e2);
      }
    }
  }

  private async checkCamera(): Promise<PermState> {
    try {
      const p = await Camera.checkPermissions();
      const cam = this.normalizePerm(p.camera as any);
      if (cam !== 'unknown') return cam;

      try {
        const navPerm = await (navigator as any).permissions?.query?.({ name: 'camera' });
        const st = this.normalizePerm(navPerm?.state);
        if (st !== 'unknown') return st;
      } catch {}

      return 'unknown';
    } catch (e) {
      console.error('checkCamera failed', e);
      return 'unknown';
    }
  }

  private normalizePerm(v: any): PermState {
    if (!v) return 'unknown';
    const s = String(v);
    if (s === 'granted' || s === 'limited') return 'granted';
    if (s === 'denied') return 'denied';
    return 'unknown';
  }

  private async requestCameraPrompt(): Promise<void> {
    try {
      await Camera.requestPermissions();
    } catch {}

    try {
      if (!navigator.mediaDevices?.getUserMedia) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
    } catch (e) {
      console.error('Camera prompt failed', e);
    }
  }

  labelFor(s: PermState): string {
    if (s === 'granted') return 'Erlaubt';
    if (s === 'denied') return 'Abgelehnt';
    return 'Unbekannt';
  }

  dotClass(s: PermState): 'ok' | 'bad' | 'idle' {
    if (s === 'granted') return 'ok';
    if (s === 'denied') return 'bad';
    return 'idle';
  }
}
