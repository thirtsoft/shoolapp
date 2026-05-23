import { Routes } from '@angular/router';
import { CreateProfilComponent } from './pages/create-profil/create-profil.component';
import { ProfilsComponent } from './profils.component';


export const PROFILES_ROUTES: Routes = [
  {
    path: '',
    component: ProfilsComponent,
    children: [

      {
        path: '',
        loadComponent: () =>
          import('./pages/list-profil/list-profil.component')
            .then(m => m.ListProfilComponent),
        title: 'List — Profils',
      },
      {
        path: 'create',
        component: CreateProfilComponent
      },
      {
        path: 'edit/:id',
        component: CreateProfilComponent
      },

    ],
  },
];