import { iHunter } from './ihunter';
import { HUNTERS } from './mock-leaderboard';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  public user = "";
  public potato = 0;
  public schnitzel = 0;

  getHunters(): Observable<iHunter[]> {
    const hunters = of(HUNTERS);
    return hunters;
  }

  async setUser(newUser: string) {
    this.user = newUser
  }

  increasePoints(gotPotato: boolean) {
    this.schnitzel += 1;
    if (gotPotato == true) this.potato += 1;
  }
}
