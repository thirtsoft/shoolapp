
import { Routes } from '@angular/router';
import { MainLayoutAdminComponent } from './components/main-layout-admin-component/main-layout-admin-component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutAdminComponent,
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard-administration-component/dashboard-administration-component')
            .then(m => m.DashboardAdministrationComponent),
        title: 'Aperçu — Administration',
      },

      {
        path: 'dossier-eleve',
        loadChildren: () =>
          import('./dossier-eleve/dossier-eleves.routes')
            .then(m => m.DOSSIERS_ELEVES_ROUTES)
      },

      {
        path: 'planification',
        loadChildren: () =>
          import('./planification/planification.routes')
            .then(m => m.PLANIFICATION_ROUTES)
      },


      {
        path: 'referentiel',
        loadChildren: () =>
          import('./referentiel/referentiel.routes')
            .then(m => m.REFERENTIELS_ROUTES)
      },

      {
        path: 'utilisateur',
        loadChildren: () =>
          import('./utilisateur/utilisateur.routes')
            .then(m => m.UTILISATEURS_ROUTES)
      },


      // ── Redirection par défaut ────────────────────────
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

