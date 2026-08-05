import { Routes } from '@angular/router';
import { OnboardingComponent } from './onboarding-component';
import { StartOnboardingComponent } from './pages/start-onboarding-component/start-onboarding-component';


export const ONBOARDING_TENANT_ROUTES: Routes = [
  {
    path: '',
    component: OnboardingComponent,
    children: [
      {
        path: 'start',
        component: StartOnboardingComponent
      },
    ],
  },
];

