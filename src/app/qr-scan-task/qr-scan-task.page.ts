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
  IonFooter,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';

import { Html5Qrcode } from 'html5-qrcode';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    IonChip,
    IonLabel
  ],
  templateUrl: './qr-scan-task.page.html',
  styleUrl: './qr-scan-task.page.scss',
})
export class QrScanTaskPage implements OnDestroy {
  title = 'QR Scan';
  subtitle = 'Pflichtaufgabe (!)';
  taskTitle = 'Kamera QR';
  taskDesc = 'Scanne den QR-Code und vergleiche den Inhalt mit dem erwarteten Text.';

  expectedText = 'POSTEN-03';

  state: TaskState = 'idle';
  lastResult: string | null = null;

  private qr: Html5Qrcode | null = null;
  private readonly regionId = 'qr-region';

  get statusText(): string {
    return this.state === 'matched' || this.state === 'completed' ? 'ok' : 'wartet';
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
          this.lastResult = decodedText;

          const ok = decodedText.trim() === this.expectedText.trim();
          if (!ok) return;

          this.state = 'matched';
          await this.stopCamera();

          try {
            await Haptics.impact({ style: ImpactStyle.Medium });
          } catch {}
        },
        () => {}
      );
    } catch {
      this.state = 'idle';
      await this.stopCamera();
    }
  }

  async finishTask(): Promise<void> {
    if (!this.canFinish) return;
    this.state = 'completed';
  }

  async cancelRun(): Promise<void> {
    await this.stopCamera();
    this.state = 'idle';
    this.lastResult = null;
  }

  async skipTask(): Promise<void> {
    await this.stopCamera();
    this.state = 'completed';
    this.lastResult = null;
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
  }
}
