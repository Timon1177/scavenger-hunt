import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonAlert, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Location, UpperCasePipe } from '@angular/common';
import { HeroService } from '../hero-service';
import { IHero } from '../ihero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.page.html',
  styleUrls: ['./hero-detail.page.scss'],
  standalone: true,
  imports: [IonButton, IonAlert, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,UpperCasePipe]
})
export class HeroDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private heroService = inject(HeroService);
  private location = inject(Location);
  
  constructor() { }

  hero: IHero | undefined;

  ngOnInit(): void {
    this.getHero();
  }

  getHero(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.heroService.getHero(id)
      .subscribe(hero => this.hero = hero);
  }

  goBack(): void {
    this.location.back();
  }

  newHero(id: number,name: string,power?: string): void {
    const newHero: IHero = {
      id: id,
      name: name,
      power: power,
    };
    // this.heroService.addHero(newHero)
    this.hero = newHero// this is a temp for this specific exercise
  }
  alertInputs = [
    {
      name: "id",
      placeholder: 'id',
    },
    {
      name: "name",
      placeholder: 'name',
    },
    {
      name: "power",
      placeholder: 'power',
      attributes:{
        optional: true
      }
    },
  ];
  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Create',
      role: 'create',
      handler: (data: any) =>  {
        this.newHero(data.id,data.name,data.power);
      },
    },
  ];
}
