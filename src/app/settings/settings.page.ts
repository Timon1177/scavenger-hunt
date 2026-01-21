import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonFooter, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Observable, of } from 'rxjs';
import { IContact } from '../IContact';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  contactData$: Observable<IContact> = of({
    company: "[DEINE FIRMA]",
    name: "[DEIN NAME]",
    email: "[DEINE EMAIL ADRESSE]",
})

}
