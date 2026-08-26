import { Routes } from '@angular/router';
import { ParametrageComponent } from './parametrage.component';
import { ListPaysComponent } from './pages/localisation/list-pays-component/list-pays-component';
import { ListRegionComponent } from './pages/localisation/list-region-component/list-region-component';
import { CreateRegionComponent } from './pages/localisation/create-region-component/create-region-component';
import { ListDepartementComponent } from './pages/localisation/list-departement-component/list-departement-component';
import { CreateDepartementComponent } from './pages/localisation/create-departement-component/create-departement-component';
import { ListLanguageComponent } from './pages/localisation/list-language-component/list-language-component';
import { CreateLanguageComponent } from './pages/localisation/create-language-component/create-language-component';
import { ListCurrencyComponent } from './pages/localisation/list-currency-component/list-currency-component';
import { ListPlanComponent } from './pages/plan/list-plan-component/list-plan-component';
import { CreatePlanComponent } from './pages/plan/create-plan-component/create-plan-component';
import { ListPlanTarifComponent } from './pages/plan/list-plan-tarif-component/list-plan-tarif-component';
import { CreatePlanTarifComponent } from './pages/plan/create-plan-tarif-component/create-plan-tarif-component';


export const SAAS_PARAMETERS_ROUTES: Routes = [
  {
    path: '',
    component: ParametrageComponent,
    children: [
      {
        path: 'plans',
        component: ListPlanComponent
      },
      {
        path: 'create-plan',
        component: CreatePlanComponent
      },
      {
        path: 'tarifs',
        component: ListPlanTarifComponent
      },
      {
        path: 'create-tarif',
        component: CreatePlanTarifComponent
      },
      //
      {
        path: 'pays',
        component: ListPaysComponent
      },
      {
        path: 'regions',
        component: ListRegionComponent
      },
      {
        path: 'create-region',
        component: CreateRegionComponent
      },

      {
        path: 'departments',
        component: ListDepartementComponent
      },
      {
        path: 'create-department',
        component: CreateDepartementComponent
      },
      {
        path: 'languages',
        component: ListLanguageComponent
      },
      {
        path: 'create-language',
        component: CreateLanguageComponent
      },

      {
        path: 'currencies',
        component: ListCurrencyComponent
      }
    ],
  },
];

