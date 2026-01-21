import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonChip,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonFooter,
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
    IonCardTitle,
    IonCardSubtitle,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonIcon,
    IonChip,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    CommonModule,
    FormsModule,
    IonFooter,
  ],
})
export class LeaderboardPage implements OnInit {
  hunters: iHunter[] = [];

  constructor() {
    addIcons({ radioButtonOn });
  }

  private leaderboardService = inject(LeaderboardService)

  title = 'Top Läufe';
  intro = 'Ergebnisse aus dem Online-Leaderboard. Darunter deine gespeicherten Durchführungen.';

  getHunters(): void {
  this.leaderboardService.getHunters()
      .subscribe(hunters => this.hunters = hunters);
  }

  formatTime(minutes: number): string {
  const totalSeconds = Math.floor(minutes * 60);

  const hours = Math.floor(totalSeconds / 3600);
  const remaining = totalSeconds % 3600;
  const mins = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(mins)}:${pad(seconds)}`;
  }

  formatDate(huntDay: Date){
    const today = Date.now();

    if(today- huntDay.getTime() <= 0 ){
      return "The fucking future"
    }
    if(today- huntDay.getTime() <= 86400000 ){
      return "Heute"
    }
    else if(today- huntDay.getTime() <= 172800000 ){
      return "Gestern"
    }
    else{
      return (huntDay.getDate().toString() + " " + (huntDay.getMonth()+1).toString())
    }

  }

  ngOnInit() {
    this.getHunters()
  }
}
