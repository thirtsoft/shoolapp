
import { Routes } from '@angular/router';
import { ChangerPasswordUtilisateurComponent } from './pages/changer-password-utilisateur-component/changer-password-utilisateur-component';
import { CreateUtilisateurComponent } from './pages/create-utilisateur/create-utilisateur.component';
import { CreateEcoleAdminComponent } from './pages/ecole/create-ecole-admin/create-ecole-admin.component';
import { DetailsEcoleComponent } from './pages/ecole/details-ecole/details-ecole.component';
import { ListeEcoleComponent } from './pages/ecole/liste-ecole/liste-ecole.component';
import { ParametrageEcoleAdminComponent } from './pages/ecole/parametrage-ecole-admin/parametrage-ecole-admin.component';
import { AffecterEnseignantComponent } from './pages/enseignant/affecter-enseignant/affecter-enseignant.component';
import { CreateEnseignantComponent } from './pages/enseignant/create-enseignant/create-enseignant.component';
import { DetailsEnseignantComponent } from './pages/enseignant/details-enseignant/details-enseignant.component';
import { ListEnseignantComponent } from './pages/enseignant/list-enseignant/list-enseignant.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';
import { UtilisateurComponent } from './utilisateur.component';
import { ListUtilisateurComponent } from './pages/list-utilisateur/list-utilisateur.component';
import { SuccessUserCreateComponent } from './pages/success-user-create-component/success-user-create-component';


export const UTILISATEURS_ROUTES: Routes = [
  {
    path: '',
    component: UtilisateurComponent,
    children: [
      {
        path: '',
        component: ListUtilisateurComponent
      },
      {
        path: 'create',
        component: CreateUtilisateurComponent
      },
      {
        path: 'edit/:userUuid',
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
        path: 'profil',
        component: MonProfilComponent
      },

      {
        path: 'change-password',
        component: ChangerPasswordUtilisateurComponent
      },

      {
        path: 'success-creation',
        component: SuccessUserCreateComponent
      },


    ],
  },
];

