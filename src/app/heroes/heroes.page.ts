import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSegmentButton, IonFooter, IonSegment, IonAlert, IonContent,IonButton, IonHeader, IonTitle, IonToolbar,IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { IHero } from '../ihero';
import { HeroService } from '../hero-service';
import { HeroComponent } from '../hero/hero.component';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.page.html',
  styleUrls: ['./heroes.page.scss'],
  standalone: true,
  imports: [IonFooter, IonAlert,IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule, HeroComponent, IonItem, IonList]
})
export class Heroes implements OnInit{

  constructor () {}
  
  private heroService = inject(HeroService);

  ngOnInit(): void {
    this.getHeroes();
  }

  heroes: IHero[] = [];

  getHeroes(): void {
    this.heroService.getHeroes()
        .subscribe(heroes => this.heroes = heroes);
  }

  newHero(id: number,name: string,power?: string): void {
    const newHero: IHero = {
      id: id,
      name: name,
      power: power,
    };
    // this.heroService.addHero(newHero)
    this.heroes.push(newHero) // this is a temp for this specific exercise
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

