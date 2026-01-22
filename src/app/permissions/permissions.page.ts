import { Component, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
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
  constructor(private router: Router) {}

  ngOnInit(): void {}

  title = 'Berechtigungen';
  subtitle = "Einmal erlauben, dann läuft's.";

  headline = 'Wir brauchen kurz Zugriff.';
  description =
    'Standort für Geolocation-Aufgaben und Kamera für QR-Scan. Ohne das kann die Schnitzeljagd nicht starten.';

  locationPerm: PermState = 'unknown';
  cameraPerm: PermState = 'unknown';

  ionViewWillEnter(): void {
    void this.refreshPermissions();
  }

  get canContinue(): boolean {
    return this.locationPerm === 'granted' && this.cameraPerm === 'granted';
  }

  async refreshPermissions(): Promise<void> {
    this.locationPerm = await this.checkLocation();
    this.cameraPerm = await this.checkCamera();
  }

  async requestAll(): Promise<void> {
    await this.requestLocationPrompt();

    await this.requestCameraPrompt();

    await this.refreshPermissions();
  }

  back(): void {
    this.router.navigateByUrl('/');
  }

  next(): void {
    if (!this.canContinue) return;
    this.router.navigateByUrl('/geolocation-task');
  }

  private async checkLocation(): Promise<PermState> {
    try {
      const p = await Geolocation.checkPermissions();
      const coarse = (p as any).coarseLocation as string | undefined;

      if (p.location === 'granted' || coarse === 'granted') return 'granted';
      if (p.location === 'denied' || coarse === 'denied') return 'denied';
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
          if (!('geolocation' in navigator)) return reject('no geolocation api');
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
      if (p.camera === 'granted') return 'granted';
      if (p.camera === 'denied') return 'denied';
      return 'unknown';
    } catch (e) {
      console.error('checkCamera failed', e);
      return 'unknown';
    }
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

  labelFor(state: PermState): string {
    if (state === 'granted') return 'erlaubt';
    if (state === 'denied') return 'nicht erlaubt';
    return 'unbekannt';
  }

  dotClass(state: PermState): 'ok' | 'bad' {
    return state === 'granted' ? 'ok' : 'bad';
  }
}
