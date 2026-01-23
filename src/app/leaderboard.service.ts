import { iHunter } from './ihunter';
import { HUNTERS } from './mock-leaderboard';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  #name = '';
  #potato = 0;
  #schnitzel = 0;
  #duration: number | null = 0;

  public get name(): string {
    return this.#name;
  }

  public get potato(): number {
    return this.#potato;
  }

  public get schnitzel(): number {
    return this.#schnitzel;
  }

  getHunters(): Observable<iHunter[]> {
    const hunters = of(HUNTERS);
    return hunters;
  }

  setName(newname: string) {
    this.#name = newname;
  }

  increasePoints(gotPotato: boolean) {
    this.#schnitzel += 1;
    if (gotPotato == true) this.#potato += 1;
  }

  setDuration(duration: number | null) {
    this.#duration = duration;
  }

  reset() {
    this.#schnitzel = 0;
    this.#potato = 0;
    this.#name = '';
    this.#duration = 0;
  }

  async saveRun() {
    let runs = '1';
    const ret = await Preferences.get({ key: 'runs' });
    if (ret.value) {
      runs = JSON.parse(ret.value);
    }

    await Preferences.set({
      key: 'run' + runs,
      value: JSON.stringify({
        name: this.#name,
        schnitzel: this.#schnitzel,
        potato: this.#potato,
        duration: this.#duration,
        date: new Date(),
      }),
    });

    await Preferences.set({
      key: 'runs',
      value: (Number(runs) + 1).toString(),
    });
  }

  async getRuns(): Promise<iHunter[]> {
    let keys = await Preferences.keys();
    let hunters: iHunter[] = [];
    for (let key of keys.keys) {
      if (!(key == 'hunt_duration_ms' || key == 'runs')) {
        const ret = await Preferences.get({ key: key });
        if (ret.value) {
          let hunter: iHunter = JSON.parse(ret.value);
          hunters.push(hunter);
        }
      }
    }
    return hunters;
  }
}
