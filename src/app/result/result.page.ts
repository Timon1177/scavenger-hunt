import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonFooter
} from '@ionic/angular/standalone';

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
    IonFooter
  ],
  templateUrl: './result.page.html',
  styleUrl: './result.page.scss',
})
export class ResultPage {
  headerTitle = 'Ergebnis';
  headerSubtitle = 'Alles auf einen Blick';

  headline = 'Du hast es geschafft.';
  description =
    'Die Durchführung wird gespeichert und das Resultat kann ans Online-Leaderboard gesendet werden.';

  name = 'Kay';
  duration = '12:43';
  schnitzel = 6;
  kartoffeln = 3;

  save(): void {
    // placeholder: später API/Storage
  }

  goStart(): void {
    // placeholder: später routing
  }

  goLeaderboard(): void {
    // placeholder: später routing
  }
}
