import { Routes } from '@angular/router';
import { CahierTexteComponent } from './cahier-texte.component';
import { CreationCahierTexteComponent } from './pages/cahiertexte/creation-cahier-texte/creation-cahier-texte.component';
import { DetailsCahierTexteComponent } from './pages/cahiertexte/details-cahier-texte-component/details-cahier-texte-component';
import { ListeCahierTexteComponent } from './pages/cahiertexte/liste-cahiertexte/liste-cahier-texte.component';
import { CreationEntreeCahierTexteComponent } from './pages/entreescahiertexte/creation-entreeschaiertexte/creation-entrees-cahier-texte.component';
import { ListeEntreesCahierTexteComponent } from './pages/entreescahiertexte/liste-entreescahiertexte/liste-entrees-cahier-texte.component';


export const CAHIER_TEXTE_ROUTES: Routes = [
  {
    path: '',
    component: CahierTexteComponent,
    children: [
      {
        path: '',
        component: ListeCahierTexteComponent
      },
      {
        path: 'create',
        component: CreationCahierTexteComponent
      },
      {
        path: 'edit/:uuid',
        component: CreationCahierTexteComponent
      },

      {
        path: 'details/:id',
        component: DetailsCahierTexteComponent
      },

      {
        path: 'entrees-cahiers-textes',
        component: ListeEntreesCahierTexteComponent
      },
      {
        path: 'cahier-texte',
        component: CreationEntreeCahierTexteComponent
      },
      {
        path: 'cahier-texte/edit/:uuid',
        component: CreationEntreeCahierTexteComponent
      },
    ],
  },
];

