import { iHunter } from './ihunter';
import { HUNTERS } from './mock-leaderboard';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  getHunters(): Observable<iHunter[]> {
    const hunters = of(HUNTERS);
    return hunters;
  }
}
