import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
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
    path: 'enseignant',
    loadChildren: () =>
      import('./features/enseignant/enseignant.routes')
        .then(m => m.ENSEIGNANTS_ROUTES)
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
