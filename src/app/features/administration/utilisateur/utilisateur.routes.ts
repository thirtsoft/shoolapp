
import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur.component';


export const UTILISATEURS_ROUTES: Routes = [
  {
    path: '',
    component: UtilisateurComponent,
    children: [

      {
        path: '',
        loadComponent: () =>
          import('./pages/list-utilisateur/list-utilisateur.component')
            .then(m => m.ListUtilisateurComponent),
        title: 'List — Utilisateur',
      },

    ],
  },
];

