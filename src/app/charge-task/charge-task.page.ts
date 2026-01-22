import { Component, inject } from '@angular/core';
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

import { Device, type BatteryInfo } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LeaderboardService } from '../leaderboard.service';


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
  constructor(private nav: TaskNavigationService, private router: Router) {}

  private leaderboardService = inject(LeaderboardService)

  title = 'Laden';
  subtitle = 'Device Status';
  taskTitle = 'Gerät laden';
  taskDesc = 'Verbinde dein Gerät mit Strom, um die Aufgabe zu erledigen.';

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

    try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {}
      this.state = 'completed';
      this.nav.next(this.currentPath());




  }

  cancelRun(): void {
    this.nav.abort();
  }

  skipTask(): void {
    this.nav.skip(this.currentPath());
  }

  nextTask(): void {
    this.nav.next(this.currentPath());
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
