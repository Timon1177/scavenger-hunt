import { Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
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

import { Camera } from '@capacitor/camera';
import { Html5Qrcode } from 'html5-qrcode';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LeaderboardService } from '../leaderboard.service';
import { Subscription, timer } from 'rxjs';

type TaskState = 'idle' | 'scanning' | 'matched' | 'completed';

@Component({
  selector: 'app-qr-scan-task',
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
  templateUrl: './qr-scan-task.page.html',
  styleUrl: './qr-scan-task.page.scss',
})
export class QrScanTaskPage implements OnInit, OnDestroy {
  constructor(
    private nav: TaskNavigationService,
    private router: Router,
    private zone: NgZone
  ) {}

  private leaderboardService = inject(LeaderboardService);
  private subscription: Subscription | null = null;
  private getsPotato: boolean = false;

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer() {
    if (!this.subscription) {
      this.subscription = timer(600000, -1).subscribe(
        (n) => (this.getsPotato = true),
      );
    }
  }

  title = 'QR Scan';
  subtitle = 'Pflichtaufgabe (!)';

  taskTitle = 'Kamera QR';
  taskDesc = 'Scanne den QR-Code und vergleiche den Inhalt mit dem erwarteten Text.';

  expectedText = 'Hurrah! Du hast es geschaft';

  state: TaskState = 'idle';
  lastResult: string | null = null;

  private qr: Html5Qrcode | null = null;
  private readonly regionId = 'qr-region';

  async ionViewWillEnter(): Promise<void> {
    try {
      const p = await Camera.checkPermissions();
      const ok = p.camera === 'granted';
      if (!ok) this.router.navigateByUrl('/permissions');
    } catch {}
  }

  get canFinish(): boolean {
    return this.state === 'matched';
  }

  async openCamera(): Promise<void> {
    if (this.state === 'scanning') return;

    this.state = 'scanning';
    this.lastResult = null;

    try {
      this.qr = new Html5Qrcode(this.regionId);

      await this.qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        async (decodedText: string) => {
          this.zone.run(() => {
            this.lastResult = decodedText;
          });

          const ok = decodedText.trim() === this.expectedText.trim();
          if (!ok) return;

          this.zone.run(() => {
            this.state = 'matched';
          });

          await this.stopCamera();
          this.leaderboardService.increasePoints(this.getsPotato);
          try {
            await Haptics.impact({ style: ImpactStyle.Medium });
          } catch {}
        },
        () => {},
      );
    } catch {
      this.state = 'idle';
      await this.stopCamera();
    }
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;
    this.state = 'completed';
    this.nav.next(this.currentPath());
  }

  async cancelRun(): Promise<void> {
    await this.stopCamera();
    this.nav.abort();
  }

  async skipTask(): Promise<void> {
    await this.stopCamera();
    this.nav.skip(this.currentPath());
  }

  nextTask(): void {
    this.nav.next(this.currentPath());
  }

  private async stopCamera(): Promise<void> {
    if (!this.qr) return;

    try {
      const isScanning = (this.qr as any).isScanning === true;
      if (isScanning) await this.qr.stop();
    } catch {}

    try {
      await this.qr.clear();
    } catch {}

    this.qr = null;
  }

  ngOnDestroy(): void {
    void this.stopCamera();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }
}
