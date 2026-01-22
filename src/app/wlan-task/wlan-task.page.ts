import { Component, OnDestroy, inject } from '@angular/core';
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

import { Network, type ConnectionStatus } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LeaderboardService } from '../leaderboard.service';

type UiState = 'idle' | 'running' | 'completed';

@Component({
  selector: 'app-wlan-task',
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
  templateUrl: './wlan-task.page.html',
  styleUrl: './wlan-task.page.scss',
})
export class WlanTaskPage implements OnDestroy {
  constructor(private nav: TaskNavigationService, private router: Router) {}

  taskTitle = 'WLAN an / aus';
  taskDesc = 'Verbinde dich mit WLAN und trenne es wieder.';

  state: UiState = 'idle';

  step1Connected = false;
  step2Disconnected = false;

  private removeListener: (() => Promise<void>) | null = null;

  get canFinish(): boolean {
    return this.step1Connected && this.step2Disconnected;
  }

  async startTask(): Promise<void> {
    if (this.state !== 'idle') return;

    this.state = 'running';
    this.step1Connected = false;
    this.step2Disconnected = false;

    await this.syncOnce();

    const listener = await Network.addListener('networkStatusChange', async (status) => {
      this.applyStatus(status);

      if (this.canFinish && this.state !== 'completed') {
        await this.markCompleted();
      }
    });

    this.removeListener = async () => {
      listener.remove();
    };
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;
    await this.markCompleted();
  }

  private async markCompleted(): Promise<void> {
    this.state = 'completed';
    await this.cleanup();

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  }

  async cancelRun(): Promise<void> {
    await this.cleanup();
    this.nav.abort();
  }

  async skipTask(): Promise<void> {
    await this.cleanup();
    this.nav.skip(this.currentPath());
  }

  nextTask(): void {
    this.nav.next(this.currentPath());
  }

  private async syncOnce(): Promise<void> {
    try {
      const s = await Network.getStatus();
      this.applyStatus(s);
      if (this.canFinish && this.state !== 'completed') {
        await this.markCompleted();
      }
    } catch {}
  }

  private applyStatus(status: ConnectionStatus): void {
    const isWifi =
      status.connected === true && status.connectionType === 'wifi';

    if (!this.step1Connected) {
      if (isWifi) this.step1Connected = true;
      return;
    }

    if (!this.step2Disconnected) {
      if (!isWifi) this.step2Disconnected = true;
    }
  }

  private async cleanup(): Promise<void> {
    if (this.removeListener) {
      try {
        await this.removeListener();
      } catch {}
      this.removeListener = null;
    }
  }

  ngOnDestroy(): void {
    void this.cleanup();
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
