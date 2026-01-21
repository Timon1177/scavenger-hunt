import { Component, OnInit, input } from '@angular/core';
import { IHero } from '../ihero';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  imports: [RouterLink]
})
export class HeroComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  hero = input<IHero>()
}
