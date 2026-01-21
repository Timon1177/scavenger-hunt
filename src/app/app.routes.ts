import { Routes } from '@angular/router';
import { Heroes } from './heroes/heroes.page';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'heroes',
    pathMatch: 'full',
  },
  {
    path: 'heroes',
    loadComponent: () => import('./heroes/heroes.page').then( m => m.Heroes)
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./hero-detail/hero-detail.page').then(
        (m) => m.HeroDetailPage,
      ),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
];
