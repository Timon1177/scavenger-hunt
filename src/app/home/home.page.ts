import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  IonAlert,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { radioButtonOn } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
    IonAlert,
  ],
})
export class HomePage {
  @ViewChild('nameAlert') nameAlert!: IonAlert;
  @ViewChild('errorAlert') errorAlert!: IonAlert;

  // wird gesetzt, wenn user "Los gehts" druckt
  pendingName: string | null = null;

  constructor(private router: Router) {
    addIcons({ radioButtonOn });
  }

  pendingName: string | null = null;

  public alertButtons = [
    { text: 'Abbrechen', role: 'cancel' },

    {
      text: 'Los gehts',
      role: 'confirm',
      handler: (data: { playerName?: string }) => {
        const name = (data?.playerName ?? '').trim();

        if (!name) {
          this.errorAlert.present();
          return false; // Alert bliibt offe
        }

        this.pendingName = name; // nur merke
        return true; // Alert darf schliesse
      },
    },
  ];

  afterNameAlertClosed() {
    if (!this.pendingName) return;

    const name = this.pendingName;
    this.pendingName = null;

    this.router.navigate(['/geolocation-task'], { queryParams: { name } });
  }

}
