
import { Routes } from '@angular/router';
import { ConfigOrganizationComponent } from './configorganization.component';
import { MonOrganizationComponent } from './pages/mon-organization-component/mon-organization-component';
import { ConfigNotificationOrganizationComponent } from './pages/config-notification-organization-component/config-notification-organization-component';


export const CONFIG_ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    component: ConfigOrganizationComponent,
    children: [
      {
        path: 'information',
        component: MonOrganizationComponent
      },
      {
        path: 'notification-configuration',
        component: ConfigNotificationOrganizationComponent
      },
    
    ],
  },
];

