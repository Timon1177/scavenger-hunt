import { Injectable } from '@angular/core';

export type TaskId = 'geolocation' | 'distance' | 'qr' | 'sensor' | 'charge' | 'wlan';

export interface RunResult {
  name: string;
  durationSeconds: number;
  schnitzel: number;
  kartoffeln: number;
  finishedAtIso: string;
}

const STORAGE_KEY = 'scavenger_hunt_history_v1';

@Injectable({ providedIn: 'root' })
export class RunService {
  private startedAtMs: number | null = null;
  private _name = 'Kay';
  private schnitzel = 0;
  private kartoffeln = 0;

  startRun(name: string): void {
    this._name = (name ?? '').trim() || 'Kay';
    this.startedAtMs = Date.now();
    this.schnitzel = 0;
    this.kartoffeln = 0;
  }

  awardFor(task: TaskId): void {
    switch (task) {
      case 'geolocation':
      case 'qr':
      case 'wlan':
        this.schnitzel += 1;
        break;
      case 'distance':
      case 'sensor':
      case 'charge':
        this.kartoffeln += 1;
        break;
    }
  }

  get durationSeconds(): number {
    if (!this.startedAtMs) return 0;
    return Math.max(0, Math.floor((Date.now() - this.startedAtMs) / 1000));
  }

  formatDuration(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    const pad = (v: number) => v.toString().padStart(2, '0');
    return `${pad(mm)}:${pad(ss)}`;
  }

  buildResult(): RunResult {
    return {
      name: this._name,
      durationSeconds: this.durationSeconds,
      schnitzel: this.schnitzel,
      kartoffeln: this.kartoffeln,
      finishedAtIso: new Date().toISOString(),
    };
  }

  saveToHistory(result: RunResult): void {
    const list = this.loadHistory();
    list.unshift(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  }

  loadHistory(): RunResult[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as RunResult[];
    } catch {
      return [];
    }
  }
}
