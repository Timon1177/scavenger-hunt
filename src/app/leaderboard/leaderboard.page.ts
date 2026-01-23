import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { LeaderboardService } from '../leaderboard.service';
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

  onlineHunters: iHunter[] = [];

  constructor() {
    addIcons({ radioButtonOn });
  }

  public leaderboardService = inject(LeaderboardService);

  title = 'Top Läufe';
  intro =
    'Ergebnisse aus dem Online-Leaderboard. Darunter deine gespeicherten Durchführungen.';

  getHunters(): void {
    this.leaderboardService
      .getHunters()
      .subscribe((hunters) => (this.hunters = hunters));
      //this is for testing with the mock hunters
  }
  
  async getRuns(){
    this.hunters = await this.leaderboardService.getRuns()
  }

  formatTime(minutes: number): string {
    const totalMiliseconds = Math.floor(minutes * 60);

    const hours = Math.floor(totalMiliseconds / 3600000);
    const remaining = totalMiliseconds % 3600000;
    const mins = Math.floor(remaining / 60000);
    const seconds = remaining % 60000;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(mins)}:${pad(seconds)}`;
  }

  formatDate(huntDate: Date) {
    const today = Date.now();
    const formatedHuntDate = new Date(huntDate)

    if (today - formatedHuntDate.getTime() <= 0) {
      return 'The fucking future';
    }
    if (today - formatedHuntDate.getTime() <= 86400000) {
      return 'Heute';
    } else if (today - formatedHuntDate.getTime() <= 172800000) {
      return 'Gestern';
    } else {
      return (
        formatedHuntDate.getDate().toString() + ' ' + (formatedHuntDate.getMonth() + 1).toString()
      );
    }
  }

  ngOnInit() {
    // this.getHunters(); for testing
    this.getRuns()
    this.leaderboardService.sendToLeaderboard()
  }
  
}
