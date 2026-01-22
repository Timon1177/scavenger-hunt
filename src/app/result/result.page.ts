import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { LeaderboardService } from '../leaderboard.service';

@Component({
  selector: 'app-result',
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
  templateUrl: './result.page.html',
  styleUrl: './result.page.scss',
})
export class ResultPage {

  constructor(private router: Router) {
    }
  headerTitle = 'Ergebnis';
  headerSubtitle = 'Alles auf einen Blick';

  headline = 'Du hast es geschafft.';
  description =
    'Die Durchführung wird gespeichert und das Resultat kann ans Online-Leaderboard gesendet werden.';

  private leaderboardService = inject(LeaderboardService);

  name = this.leaderboardService.user;
  duration = '12:43';
  schnitzel = this.leaderboardService.schnitzel;
  kartoffeln = this.leaderboardService.potato;

  save(): void {
    // placeholder: später API/Storage
  }

  goStart(): void {
        this.router.navigate(['/home']);
  }

  goLeaderboard(): void {
    // placeholder: später routing
  }
}
