import { Routes } from '@angular/router';
import { CreateRoleTenantComponent } from './pages/create-role-tenant-component/create-role-tenant-component';
import { ListRoleTenantComponent } from './pages/list-role-tenant-component/list-role-tenant-component';
import { RoleTenantComponent } from './role-tenant.component';

export const ROLES_TENANT_ROUTES: Routes = [
  {
    path: '',
    component: RoleTenantComponent,
    children: [
      {
        path: '',
        component: ListRoleTenantComponent
      },
      {
        path: 'create',
        component: CreateRoleTenantComponent
      },
      {
        path: 'edit/:uuid',
        component: CreateRoleTenantComponent
      },

    ],
  },
];