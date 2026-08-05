import { NgModule } from '@angular/core';
import { OnboardingComponent } from './onboarding-component';
import { RouterModule, Routes } from '@angular/router';
import { StartOnboardingComponent } from './pages/start-onboarding-component/start-onboarding-component';

const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent,
    children: [
      {
        path: 'start',
        component: StartOnboardingComponent
      },




    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModuleModule { }
