
import { Routes } from '@angular/router';
import { MainLayoutSaasManagementComponent } from './components/main-layout-saas-management-component/main-layout-saas-management-component';
import { ListSetupProcessComponent } from './pages/setup/list-setup-process-component/list-setup-process-component';
import { DetailsSetupProcessComponent } from './pages/setup/details-setup-process-component/details-setup-process-component';
import { ListOnboardingComponent } from './pages/onboarding/list-onboarding-component/list-onboarding-component';
import { DetailsOnboardingComponent } from './pages/onboarding/details-onboarding-component/details-onboarding-component';
import { ListTenantComponent } from './pages/tenant/list-tenant-component/list-tenant-component';
import { DetailsTenantComponent } from './pages/tenant/details-tenant-component/details-tenant-component';
import { ListOrganizationComponent } from './pages/organization/list-organization-component/list-organization-component';
import { DetailsOrganizationComponent } from './pages/organization/details-organization-component/details-organization-component';
import { ListUserManagementComponent } from './pages/user/list-user-management-component/list-user-management-component';
import { CreateUserComponent } from './pages/user/create-user-component/create-user-component';

export const SAAS_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutSaasManagementComponent,
    children: [

      {
        path: 'onboarding',
        loadChildren: () =>
          import('../onboarding/onboarding.routes')
            .then(m => m.ONBOARDING_TENANT_ROUTES),
        title: 'SaaS — Onboarding',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/sass-dashboard-component/sass-dashboard-component')
            .then(m => m.SassDashboardComponent),
        title: 'SaaS — Administration',
      },

      {
        path: 'onboardings',
        component: ListOnboardingComponent
      },

      {
        path: 'onboarding/details/:uuid',
        component: DetailsOnboardingComponent
      },

      {
        path: 'tenants',
        component: ListTenantComponent
      },

      {
        path: 'tenant/details/:uuid',
        component: DetailsTenantComponent
      },

      {
        path: 'organizations',
        component: ListOrganizationComponent
      },

      {
        path: 'organization/details/:uuid',
        component: DetailsOrganizationComponent
      },

      {
        path: 'setup',
        component: ListSetupProcessComponent
      },

      {
        path: 'setup/details/:uuid',
        component: DetailsSetupProcessComponent
      },

      {
        path: 'users-management',
        component: ListUserManagementComponent
      },

      {
        path: 'create-users',
        component: CreateUserComponent
      },

      {
        path: 'parametrage',
        loadChildren: () =>
          import('./parametrages/parametrage.routes')
            .then(m => m.SAAS_PARAMETERS_ROUTES),
        title: 'SaaS — Paramétrage',

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

