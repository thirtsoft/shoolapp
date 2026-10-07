
import { Routes } from '@angular/router';
import { AddEditContratComponent } from './pages/contrat/add-edit-contrat-component/add-edit-contrat-component';
import { ContratsComponent } from './pages/contrat/contrats-component/contrats-component';
import { DetailsContratComponent } from './pages/contrat/details-contrat-component/details-contrat-component';
import { AddEditDemandeAvanceSalaireComponent } from './pages/demandeavancesalaire/add-edit-demande-avance-salaire-component/add-edit-demande-avance-salaire-component';
import { DemandeAvanceSalairesComponent } from './pages/demandeavancesalaire/demande-avance-salaires-component/demande-avance-salaires-component';
import { DetailsDemandeAvanceSalaireComponent } from './pages/demandeavancesalaire/details-demande-avance-salaire-component/details-demande-avance-salaire-component';
import { AddEditPaieComponent } from './pages/paie/add-edit-paie-component/add-edit-paie-component';
import { DetailsPaieComponent } from './pages/paie/details-paie-component/details-paie-component';
import { PaiesComponent } from './pages/paie/paies-component/paies-component';
import { CreationPersonnelComponent } from './pages/personnel/creation-personnel-component/creation-personnel-component';
import { ModificationInfoPersonnelComponent } from './pages/personnel/modification-info-personnel-component/modification-info-personnel-component';
import { PeronnelsComponent } from './pages/personnel/peronnels-component/peronnels-component';
import { SuccessCreationPersonnelComponent } from './pages/personnel/success-creation-personnel-component/success-creation-personnel-component';
import { RhComponent } from './rh.component';

export const RH_ROUTES: Routes = [
  {
    path: '',
    component: RhComponent,
    children: [
      {
        path: 'paies',
        component: PaiesComponent
      },
      {
        path: 'paie/create',
        component: AddEditPaieComponent
      },
      {
        path: 'paie/edit/:uuid',
        component: AddEditPaieComponent
      },
      {
        path: 'paie/details/:uuid',
        component: DetailsPaieComponent
      },
      {
        path: 'avances-salaires',
        component: DemandeAvanceSalairesComponent
      },
      {
        path: 'avance-salaire/create',
        component: AddEditDemandeAvanceSalaireComponent
      },
      {
        path: 'avance-salaire/edit/:uuid',
        component: AddEditDemandeAvanceSalaireComponent
      },
      {
        path: 'avance-salaire/details/:uuid',
        component: DetailsDemandeAvanceSalaireComponent
      },
      {
        path: 'contrats',
        component: ContratsComponent
      },
      {
        path: 'contrat/create',
        component: AddEditContratComponent
      },
      {
        path: 'contrat/edit/:uuid',
        component: AddEditContratComponent
      },
      {
        path: 'contrat/details/:uuid',
        component: DetailsContratComponent
      },
      {
        path: 'personnels',
        component: PeronnelsComponent
      },
      {
        path: 'personnel/create',
        component: CreationPersonnelComponent
      },
      {
        path: 'personnel/edit/:uuid',
        component: ModificationInfoPersonnelComponent
      },

      {
        path: 'personnel/success-creation',
        component: SuccessCreationPersonnelComponent
      },

    ],
  },
];

