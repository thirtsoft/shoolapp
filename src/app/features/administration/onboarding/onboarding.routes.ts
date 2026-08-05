import { Routes } from '@angular/router';
import { OnboardingComponent } from './onboarding-component';
import { StartOnboardingComponent } from './pages/start-onboarding-component/start-onboarding-component';
import { ListTenantComponent } from './pages/tenant/list-tenant-component/list-tenant-component';
import { ListOnboardingPrecessComponent } from './pages/process/list-onboarding-precess-component/list-onboarding-precess-component';


export const ONBOARDING_TENANT_ROUTES: Routes = [
  {
    path: '',
    component: OnboardingComponent,
    children: [
      {
        path: 'start',
        component: StartOnboardingComponent
      },
      {
        path: 'tenant',
        component: ListTenantComponent
      },
      {
        path: 'process',
        component: ListOnboardingPrecessComponent
      }
    ],
  },
];

