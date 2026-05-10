import { Routes } from '@angular/router';
import { MainLayoutParentComponent } from './components/main-layout-parent-component/main-layout-parent-component';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutParentComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-parent-component/dashboard-parent-component').then(m => m.DashboardParentComponent),
        title: 'Tableau de bord'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
];