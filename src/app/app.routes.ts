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
  },  {
    path: 'geolocation-task',
    loadComponent: () => import('./geolocation-task/geolocation-task.page').then( m => m.GeolocationTaskPage)
  },
  {
    path: 'distance-task',
    loadComponent: () => import('./distance-task/distance-task.page').then( m => m.DistanceTaskPage)
  },
  {
    path: 'qr-scan-task',
    loadComponent: () => import('./qr-scan-task/qr-scan-task.page').then( m => m.QrScanTaskPage)
  },

];
