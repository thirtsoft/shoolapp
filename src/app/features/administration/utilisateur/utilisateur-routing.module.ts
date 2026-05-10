import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUtilisateurComponent } from './pages/create-utilisateur/create-utilisateur.component';
import { CreateEcoleAdminComponent } from './pages/ecole/create-ecole-admin/create-ecole-admin.component';
import { DetailsEcoleComponent } from './pages/ecole/details-ecole/details-ecole.component';
import { ListeEcoleComponent } from './pages/ecole/liste-ecole/liste-ecole.component';
import { ParametrageEcoleAdminComponent } from './pages/ecole/parametrage-ecole-admin/parametrage-ecole-admin.component';
import { AffecterEnseignantComponent } from './pages/enseignant/affecter-enseignant/affecter-enseignant.component';
import { CreateEnseignantComponent } from './pages/enseignant/create-enseignant/create-enseignant.component';
import { DetailsEnseignantComponent } from './pages/enseignant/details-enseignant/details-enseignant.component';
import { ListUtilisateurComponent } from './pages/list-utilisateur/list-utilisateur.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';
import { UtilisateurComponent } from './utilisateur.component';

const routes: Routes = [
  {
    path: '',
    component: UtilisateurComponent,
    children: [
      {
        path: 'list',
        component: ListUtilisateurComponent
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
        path: 'enseignant',
        children: [
          {
            path: 'create',
            component: CreateEnseignantComponent
          },
          {
            path: 'edit/:id',
            component: CreateEnseignantComponent
          },
          {
            path: 'affecter/:id',
            component: AffecterEnseignantComponent
          },
          {
            path: 'details/:id',
            component: DetailsEnseignantComponent
          },
        ]

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

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilisateurRoutingModule { }
