import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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

import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LeaderboardService } from '../services/leaderboard.service';
import { Subscription, timer } from 'rxjs';

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
    IonFooter,
  ],
  templateUrl: './charge-task.page.html',
  styleUrl: './charge-task.page.scss',
})
export class ChargeTaskPage implements OnInit, OnDestroy {
  constructor(
    private nav: TaskNavigationService,
    private router: Router,
  ) {}

  private leaderboardService = inject(LeaderboardService);
  taskTitle = 'Gerät laden';
  taskDesc = 'Verbinde dein Gerät mit Strom, um die Aufgabe zu erledigen.';

  state: UiState = 'idle';
  statusText = 'Nicht geladen';
  isCharging: boolean | null = null;

  private subscription: Subscription | null = null;
  private getsPotato: boolean = false;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  startTimer() {
    if (!this.subscription) {
      this.subscription = timer(600000, -1).subscribe(
        (n) => (this.getsPotato = true),
      );
    }
  }

  get canFinish(): boolean {
    return this.isCharging === true && this.state !== 'completed';
  }

  async checkStatus(): Promise<void> {
    try {
      const info = await Device.getBatteryInfo();
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

    this.leaderboardService.increasePoints(this.getsPotato);
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
