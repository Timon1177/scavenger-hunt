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
  styleUrl: './permissions.page.scss',
})
export class PermissionsPage implements OnInit {

  constructor(private nav: TaskNavigationService, private router: Router) {}

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
    await this.requestLocation();
    await this.requestCamera();
    await this.refreshPermissions();
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
      if (p.location === 'granted') return 'granted';
      if (p.location === 'denied') return 'denied';
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async requestLocation(): Promise<void> {
    try {
      await Geolocation.requestPermissions({ permissions: ['location'] });
    } catch {}
  }

  private async checkCamera(): Promise<PermState> {
    try {
      const p = await Camera.checkPermissions();
      if (p.camera === 'granted') return 'granted';
      if (p.camera === 'denied') return 'denied';
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async requestCamera(): Promise<void> {
    try {
      await Camera.requestPermissions({ permissions: ['camera'] });
    } catch {}
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
