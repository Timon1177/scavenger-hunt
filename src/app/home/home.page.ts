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
  IonItem,
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
  host: { class: 'ion-page' },
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
    IonItem,
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


  constructor(private router: Router) {
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
        const name = (data?.playerName ?? '').trim();

        if (!name) {
          await this.errorAlert.present();
          return false;
        }
        await this.nameAlert.dismiss();

        this.router.navigate(['/permisions']);
        return true;
      },
    },
  ];
}
