import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'geolocation-task',
    loadComponent: () => import('./geolocation-task/geolocation-task.page').then( m => m.GeolocationTaskPage)
  },
  {
    path: 'distance-task',
    loadComponent: () => import('./distance-task/distance-task.page').then( m => m.DistanceTaskPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'permisions',
    loadComponent: () => import('./permisions/permisions.page').then( m => m.PermisionsPage)
  },
];
