import { Component, inject, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { LeaderboardService } from '../leaderboard.service';
import { Router } from '@angular/router';
import { HuntTimerService } from '../services/hunt-timer.service';
import { TaskNavigationService } from '../services/task-navigation.service';

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
export class ResultPage implements OnInit{
  headerTitle = 'Ergebnis';
  headerSubtitle = 'Alles auf einen Blick';

  headline = 'Du hast es geschafft.';
  description =
    'Die Durchführung wird gespeichert und das Resultat kann ans Online-Leaderboard gesendet werden.';

  private leaderboardService = inject(LeaderboardService);
  private router = inject(Router);
  private timer = inject(HuntTimerService);
  private nav = inject(TaskNavigationService);

  name = this.leaderboardService.name;
  duration = '--:--';
  schnitzel = this.leaderboardService.schnitzel;
  kartoffeln = this.leaderboardService.potato;

  async ionViewWillEnter(): Promise<void> {
    const ms = await this.timer.stop();
    this.duration = this.timer.formatMs(ms ?? 0);
  }

  save(): void {
    this.leaderboardService.sendToLeaderboard()
  }

  async goStart(): Promise<void> {
    await this.timer.reset();
    this.router.navigateByUrl('/home');
  }

  goLeaderboard(): void {
    this.nav.leaderboard();
  }

  ngOnInit(): void {
    this.leaderboardService.saveRun()
  }
}
