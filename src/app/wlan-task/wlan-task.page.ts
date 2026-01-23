import { Component, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskNavigationService } from '../services/task-navigation.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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

import { Network, ConnectionStatus } from '@capacitor/network';
import { Subscription, timer } from 'rxjs';

type TaskState = 'idle' | 'running' | 'completed';

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
  styleUrls: ['./wlan-task.page.scss'],
})
export class WlanTaskPage implements OnDestroy {
  constructor(
    private nav: TaskNavigationService,
    private router: Router,
    private zone: NgZone,
  ) {}

  taskTitle = 'WLAN an / aus';
  taskDesc = 'Verbinde dich mit WLAN und trenne es danach wieder.';

  state: TaskState = 'idle';

  wasConnected = false;
  wasDisconnected = false;

  private listener: any;

  private subscription: Subscription | null = null;
  private getsPotato: boolean = false;

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer() {
    if (!this.subscription) {
      this.subscription = timer(60000, -1).subscribe(
        (n) => (this.getsPotato = true),
      );
    }
  }

  get canFinish(): boolean {
    return (
      this.wasConnected && this.wasDisconnected && this.state !== 'completed'
    );
  }

  async startTask(): Promise<void> {
    if (this.state !== 'idle') return;

    this.state = 'running';
    this.wasConnected = false;
    this.wasDisconnected = false;

    const status = await Network.getStatus();
    this.handleStatus(status);

    this.listener = await Network.addListener(
      'networkStatusChange',
      (status) => {
        this.zone.run(() => {
          this.handleStatus(status);
        });
      },
    );
  }

  private handleStatus(status: ConnectionStatus): void {
    if (status.connected && status.connectionType === 'wifi') {
      this.wasConnected = true;
    }

    if (!status.connected && this.wasConnected) {
      this.wasDisconnected = true;
    }
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;

    this.state = 'completed';
    await this.cleanup();

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    this.nav.next(this.currentPath());
  }

  async skipTask(): Promise<void> {
    await this.cleanup();
    this.nav.skip(this.currentPath());
  }

  cancelRun(): void {
    void this.cleanup();
    this.nav.abort();
  }

  private async cleanup(): Promise<void> {
    if (this.listener) {
      try {
        await this.listener.remove();
      } catch {}
      this.listener = null;
    }
  }

  ngOnDestroy(): void {
    void this.cleanup();
    this.cleanup();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
