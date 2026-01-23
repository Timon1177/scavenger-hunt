import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { radioButtonOn } from 'ionicons/icons';
import { LeaderboardService } from '../services/leaderboard.service';
import { iHunter } from '../ihunter';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    CommonModule,
    FormsModule,
  ],
})
export class LeaderboardPage implements OnInit {
  hunters: iHunter[] = [];
  private router = inject(Router);
  constructor() {
    addIcons({ radioButtonOn });
  }

  public leaderboardService = inject(LeaderboardService);

  title = 'Top Läufe';
  intro =
    'Ergebnisse aus dem Leaderboard. Darunter deine gespeicherten Durchführungen.';

  getHunters(): void {
    this.leaderboardService
      .getHunters()
      .subscribe((hunters) => (this.hunters = hunters));
  }

  async getRuns(){
    this.hunters = await this.leaderboardService.getRuns()
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.round(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  }

  formatDate(huntDate: Date) {
    const today = Date.now();
    const formatedHuntDate = new Date(huntDate);
    const timeDiff = today - formatedHuntDate.getTime();

    if (timeDiff < 0) {
      return 'Bald';
    }
    if (timeDiff <= 86400000) {
      return 'Heute';
    } else if (timeDiff <= 172800000) {
      return 'Gestern';
    } else {
      const day = formatedHuntDate.getDate().toString().padStart(2, '0');
      const month = (formatedHuntDate.getMonth() + 1).toString().padStart(2, '0');
      return `${day}.${month}`;
    }
  }

  toHome(){
    this.router.navigateByUrl('/home')
    }

  ngOnInit() {
    this.getRuns()
  }
}
