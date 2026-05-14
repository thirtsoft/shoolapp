
import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur.component';
import { ListEnseignantComponent } from './pages/enseignant/list-enseignant/list-enseignant.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';


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
      {
        path: 'enseignants',
        component: ListEnseignantComponent
      },
       {
        path: 'profiles',
        component: MonProfilComponent
      }
      

    ],
  },
];

