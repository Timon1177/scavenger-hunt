import { Component, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonChip,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonAlert,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { radioButtonOn } from 'ionicons/icons';
import { LeaderboardService } from '../leaderboard.service';
import { HuntTimerService } from '../services/hunt-timer.service';

@Component({
  selector: 'app-home',
  standalone: true,
  host: { class: 'ion-page' },
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonCardTitle,
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
    IonAlert,
  ],
})
export class HomePage {
  @ViewChild('nameAlert') nameAlert!: IonAlert;
  @ViewChild('errorAlert') errorAlert!: IonAlert;

  private leaderboardService = inject(LeaderboardService);
  private huntTimer = inject(HuntTimerService);
  private router = inject(Router);

  constructor() {
    addIcons({ radioButtonOn });
  }

  public alertInputs = [
    {
      name: 'playerName',
      placeholder: 'Name eingeben...',
      type: 'text',
    },
  ];

  public alertButtons = [
    {
      text: 'Abbrechen',
      role: 'cancel',
    },
    {
      text: 'Los gehts',
      role: 'confirm',
      handler: async (data: { playerName?: string }) => {
        this.leaderboardService.reset()
        const name = (data?.playerName ?? '').trim();

        if (!name) {
          await this.errorAlert.present();
          return false;
        }
        await this.nameAlert.dismiss();

        this.leaderboardService.setUser(name);

        await this.huntTimer.start();

        this.router.navigate(['/permissions']);
        return true;
      },
    },
  ];

  goToLeaderboard(): void {
    this.router.navigateByUrl('/leaderboard');
  }
}
