import { iHunter } from './ihunter';
import { HUNTERS } from './mock-leaderboard';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  #user = "";
  #potato = 0;
  #schnitzel = 0;

  public get user() : string {
    return this.#user
  }

  public get potato() : number {
    return this.#potato
  }

  public get schnitzel() : number {
    return this.#schnitzel
  }

  getHunters(): Observable<iHunter[]> {
    const hunters = of(HUNTERS);
    return hunters;
  }

  async setUser(newUser: string) {
    this.#user = newUser
  }

  increasePoints(gotPotato: boolean) {
    this.#schnitzel += 1;
    if (gotPotato == true) this.#potato += 1;
  }

  reset(){
    this.#schnitzel=0
    this.#potato=0
    this.#user=""
  }
}
