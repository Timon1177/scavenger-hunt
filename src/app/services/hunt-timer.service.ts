import { Injectable,inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LeaderboardService } from '../leaderboard.service';

@Injectable({ providedIn: 'root' })
export class HuntTimerService {
  private static readonly START_KEY = 'hunt_start_ts';
  private static readonly DURATION_KEY = 'hunt_duration_ms';
  private leaderboardService = inject(LeaderboardService)

  async start(): Promise<void> {
    const now = Date.now();
    await Preferences.set({ key: HuntTimerService.START_KEY, value: String(now) });
    await Preferences.remove({ key: HuntTimerService.DURATION_KEY });
  }

  async reset(): Promise<void> {
    await Preferences.remove({ key: HuntTimerService.START_KEY });
    await Preferences.remove({ key: HuntTimerService.DURATION_KEY });
  }

  async stop(): Promise<number | null> {
    const start = await this.getStartMs();
    if (start == null) {
      const prev = await this.getStoredDurationMs();
      return prev;
    }

    const duration = Math.max(0, Date.now() - start);
    await Preferences.set({ key: HuntTimerService.DURATION_KEY, value: String(duration) });
    await Preferences.remove({ key: HuntTimerService.START_KEY });
    this.leaderboardService.setDuration(duration)
    return duration;
  }

  async getElapsedMs(): Promise<number | null> {
    const start = await this.getStartMs();
    if (start == null) return this.getStoredDurationMs();
    return Math.max(0, Date.now() - start);
  }

  async getElapsedFormatted(): Promise<string> {
    const ms = await this.getElapsedMs();
    return this.formatMs(ms ?? 0);
  }

  formatMs(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    if (hours > 0) {
      const hh = String(hours).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }

  private async getStartMs(): Promise<number | null> {
    const res = await Preferences.get({ key: HuntTimerService.START_KEY });
    const v = (res.value ?? '').trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private async getStoredDurationMs(): Promise<number | null> {
    const res = await Preferences.get({ key: HuntTimerService.DURATION_KEY });
    const v = (res.value ?? '').trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
}
