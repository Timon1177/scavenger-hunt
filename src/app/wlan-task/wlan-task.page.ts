import { Component, OnDestroy } from '@angular/core';
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

import { Network, type ConnectionStatus } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    IonFooter
  ],
  templateUrl: './wlan-task.page.html',
  styleUrl: './wlan-task.page.scss',
})
export class WlanTaskPage implements OnDestroy {
  title = 'WLAN';
  subtitle = 'WLAN';
  taskTitle = 'WLAN an / aus';
  taskDesc = 'Verbinde dich mit WLAN und trenne es wieder.';

  state: UiState = 'idle';

  step1Connected = false;
  step2Disconnected = false;

  private removeListener: (() => Promise<void>) | null = null;

  get canFinish(): boolean {
    return this.step1Connected && this.step2Disconnected;
  }

  get step1Dot(): 'off' | 'on' {
    return this.step1Connected ? 'on' : 'off';
  }

  get step2Dot(): 'off' | 'on' {
    return this.step2Disconnected ? 'on' : 'off';
  }

  async startTask(): Promise<void> {
    if (this.state === 'running') return;

    this.state = 'running';
    this.step1Connected = false;
    this.step2Disconnected = false;

    await this.syncOnce();

const handler = async (status: ConnectionStatus) => {
  this.applyStatus(status);

  if (this.canFinish) {
    this.state = 'completed';
    await this.cleanup();
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  }
};


    const handle = await Network.addListener('networkStatusChange', handler);
    this.removeListener = async () => {
      await handle.remove();
    };
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;
    this.state = 'completed';
    await this.cleanup();
  }

  async cancelRun(): Promise<void> {
    await this.cleanup();
    this.state = 'idle';
    this.step1Connected = false;
    this.step2Disconnected = false;
  }

  async skipTask(): Promise<void> {
    await this.cleanup();
    this.state = 'completed';
    this.step1Connected = false;
    this.step2Disconnected = false;
  }

  private async syncOnce(): Promise<void> {
    try {
      const s = await Network.getStatus();
      this.applyStatus(s);
    } catch {}
  }

  private applyStatus(status: ConnectionStatus): void {
    const isWifi = status.connected === true && status.connectionType === 'wifi';

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
}
