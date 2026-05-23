
import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur.component';
import { ListEnseignantComponent } from './pages/enseignant/list-enseignant/list-enseignant.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';
import { CreateUtilisateurComponent } from './pages/create-utilisateur/create-utilisateur.component';
import { ListeEcoleComponent } from './pages/ecole/liste-ecole/liste-ecole.component';
import { CreateEcoleAdminComponent } from './pages/ecole/create-ecole-admin/create-ecole-admin.component';
import { ParametrageEcoleAdminComponent } from './pages/ecole/parametrage-ecole-admin/parametrage-ecole-admin.component';
import { DetailsEcoleComponent } from './pages/ecole/details-ecole/details-ecole.component';
import { CreateEnseignantComponent } from './pages/enseignant/create-enseignant/create-enseignant.component';
import { AffecterEnseignantComponent } from './pages/enseignant/affecter-enseignant/affecter-enseignant.component';
import { DetailsEnseignantComponent } from './pages/enseignant/details-enseignant/details-enseignant.component';


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
        path: 'create',
        component: CreateUtilisateurComponent
      },
      {
        path: 'edit/:id',
        component: CreateUtilisateurComponent
      },

      {
        path: 'monprofil/:id',
        component: MonProfilComponent
      },
      {
        path: 'ecole',
        component: ListeEcoleComponent
      },
      {
        path: 'ecole/create',
        component: CreateEcoleAdminComponent
      },
      {
        path: 'ecole/edit/:id',
        component: CreateEcoleAdminComponent
      },

      {
        path: 'ecole/parametrage',
        component: ParametrageEcoleAdminComponent
      },

      {
        path: 'ecole/detail/:id',
        component: DetailsEcoleComponent
      },

      {
        path: 'enseignants',
        component: ListEnseignantComponent
      },

      {
        path: 'enseignant/create',
        component: CreateEnseignantComponent
      },
      {
        path: 'enseignant/edit/:id',
        component: CreateEnseignantComponent
      },
      {
        path: 'enseignant/affecter/:id',
        component: AffecterEnseignantComponent
      },
      {
        path: 'enseignant/details/:id',
        component: DetailsEnseignantComponent
      },

      {
        path: 'profiles',
        component: MonProfilComponent
      },


    ],
  },
];

