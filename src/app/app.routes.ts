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
    path: 'permisions',
    loadComponent: () => import('./permissions/permissions.page').then( m => m.PermissionsPage)
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
    path: 'qr-scan-task',
    loadComponent: () => import('./qr-scan-task/qr-scan-task.page').then( m => m.QrScanTaskPage)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./leaderboard/leaderboard.page').then( m => m.LeaderboardPage)
  },
  {
    path: 'sensor-task',
    loadComponent: () => import('./sensor-task/sensor-task.page').then( m => m.SensorTaskPage)
  },
  {
    path: 'charge-task',
    loadComponent: () => import('./charge-task/charge-task.page').then( m => m.ChargeTaskPage)
  },
  {
    path: 'wlan-task',
    loadComponent: () => import('./wlan-task/wlan-task.page').then( m => m.WlanTaskPage)
  },
  {
    path: 'result',
    loadComponent: () => import('./result/result.page').then( m => m.ResultPage)
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions/permissions.page').then( m => m.PermissionsPage)
  },


];
