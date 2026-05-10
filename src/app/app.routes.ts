import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'vendeur',
    loadChildren: () =>
      import('./features/vendeur/vendeur.routes').then(m => m.VENDEUR_ROUTES)
  },

  {
    path: 'gerant',
    loadChildren: () =>
      import('./features/gerant/gerant.routes')
        .then(m => m.GERANT_ROUTES)
  },

  {
    path: 'proprietaire',
    loadChildren: () =>
      import('./features/proprietaire/proprietaire.routes')
        .then(m => m.PROPRIETAIRE_ROUTES)
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/administration/administration.routes')
        .then(m => m.ADMIN_ROUTES)
  },

    {
    path: 'comptabilite',
    loadChildren: () =>
      import('./features/comptabilite/comptabilite.routes')
        .then(m => m.COMPTA_ROUTES)
  },

  {
    path: 'professeur',
    loadChildren: () =>
      import('./features/professeur/professeur.routes')
        .then(m => m.PROFESSEUR_ROUTES)
  },

  {
    path: 'parent',
    loadChildren: () =>
      import('./features/parent/parent.routes')
        .then(m => m.PARENT_ROUTES)
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

];

export default routes;
