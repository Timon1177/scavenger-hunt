import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'geolocation-task',
    loadComponent: () =>
      import('./geolocation-task/geolocation-task.page').then(m => m.GeolocationTaskPage),
  },
  {
    path: 'distance-task',
    loadComponent: () =>
      import('./distance-task/distance-task.page').then(m => m.DistanceTaskPage),
  },
  {
    path: 'permisions',
    loadComponent: () =>
      import('./permisions/permisions.page').then(m => m.PermisionsPage),
  },

  { path: '**', redirectTo: 'home' },
];
