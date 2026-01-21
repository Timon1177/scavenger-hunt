import { Component } from '@angular/core';
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

import { Device, type BatteryInfo } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

type UiState = 'idle' | 'checked' | 'completed';

@Component({
  selector: 'app-charge-task',
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
  templateUrl: './charge-task.page.html',
  styleUrl: './charge-task.page.scss',
})
export class ChargeTaskPage {
  title = 'Laden';
  subtitle = 'Device Status';
  taskTitle = 'Gerät laden';
  taskDesc = 'Verbinde schnell dein Gerät mit Strom, um die Aufgabe zu erledigen.';

  state: UiState = 'idle';

  statusText = 'Nicht geladen';
  isCharging: boolean | null = null;

  private lastBattery: BatteryInfo | null = null;

  get canFinish(): boolean {
    return this.isCharging === true && this.state !== 'completed';
  }

  async checkStatus(): Promise<void> {
    try {
      const info = await Device.getBatteryInfo();
      this.lastBattery = info;

      this.isCharging = info.isCharging ?? null;
      this.statusText = this.isCharging ? 'Geladen' : 'Nicht geladen';

      this.state = 'checked';
    } catch {
      this.isCharging = null;
      this.statusText = 'Nicht verfügbar';
      this.state = 'checked';
    }
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;

    this.state = 'completed';

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  }

  cancelRun(): void {
    this.state = 'idle';
    this.statusText = 'Nicht geladen';
    this.isCharging = null;
    this.lastBattery = null;
  }

  skipTask(): void {
    this.state = 'completed';
    this.statusText = 'Übersprungen';
    this.isCharging = null;
    this.lastBattery = null;
  }
}
