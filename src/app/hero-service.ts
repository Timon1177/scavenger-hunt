import { Injectable,inject } from '@angular/core';
import { IHero } from './ihero';
import { HEROES } from './mock-heroes';
import { Observable, of } from 'rxjs';
import { MessageService } from './message-service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private messageService = inject(MessageService);

  getHeroes(): Observable<IHero[]> {
    const heroes = of(HEROES);
    this.messageService.add('HeroService: fetched heroes');
    return heroes;
  }

  getHero(id: number): Observable<IHero> {
  // For now, assume that a hero with the specified `id` always exists.
  // Error handling will be added in the next step of the tutorial.
  const hero = HEROES.find(h => h.id === id)!;
  this.messageService.add(`HeroService: fetched hero id=${id}`);
  return of(hero);
  }
  addHero(hero: IHero){
    HEROES.push(hero);
    this.messageService.add(`HeroService: created new hero`);
  }
}