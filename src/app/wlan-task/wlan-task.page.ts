import { Component, OnDestroy } from '@angular/core';
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

import { Network } from '@capacitor/network';

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
  styleUrl: './wlan-task.page.scss',
})
export class WlanTaskPage implements OnDestroy {

  constructor(private nav: TaskNavigationService, private router: Router) {}

  taskTitle = 'WLAN an / aus';
  taskDesc = 'Verbinde dich mit WLAN und trenne es danach wieder.';

  state: TaskState = 'idle';

  wasConnected = false;
  wasDisconnected = false;

  private listener: any;

  get canFinish(): boolean {
    return this.wasConnected && this.wasDisconnected && this.state !== 'completed';
  }

  async startTask(): Promise<void> {
    if (this.state !== 'idle') return;

    this.state = 'running';
    this.wasConnected = false;
    this.wasDisconnected = false;

    const status = await Network.getStatus();
    this.handleStatus(status);

    this.listener = Network.addListener(
      'networkStatusChange',
      status => this.handleStatus(status)
    );
  }

  handleStatus(status: any): void {
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

    this.nav.next(this.currentPath());
  }

  async skipTask(): Promise<void> {
    await this.cleanup();
    this.nav.skip(this.currentPath());
  }

  cancelRun(): void {
    this.cleanup();
    this.nav.abort();
  }

  private async cleanup(): Promise<void> {
    if (this.listener) {
      await this.listener.remove();
      this.listener = null;
    }
  }

  ngOnDestroy(): void {
    void this.cleanup();
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
