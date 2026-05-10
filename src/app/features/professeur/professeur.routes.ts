import { Routes } from '@angular/router';
import { MainLayoutProfesseurComponent } from './components/main-layout-professeur-component/main-layout-professeur-component';


export const PROFESSEUR_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutProfesseurComponent,
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard-professeur-component/dashboard-professeur-component')
            .then(m => m.DashboardProfesseurComponent),
        title: 'Dashboard - Professeur'
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

];
