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

export class PermissionsPage implements OnInit{

  ngOnInit(): void {
    
  }
  
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

  back(): void {}

  next(): void {
    if (!this.canContinue) return;
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

  labelFor(state: PermState): string {
    if (state === 'granted') return 'erlaubt';
    if (state === 'denied') return 'nicht erlaubt';
    return 'unbekannt';
  }

  dotClass(state: PermState): 'ok' | 'bad' {
    return state === 'granted' ? 'ok' : 'bad';
  }
}
