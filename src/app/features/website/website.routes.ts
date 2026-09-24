
import { Routes } from '@angular/router';
import { DemoComponent } from './demo-component/demo-component';
import { HomeComponent } from './home-component/home-component';
import { WebsiteComponent } from './website-component';
import { DemandeDemoComponent } from './demande-demo/demande-demo-component';

export const WEBSITE_ROUTES: Routes = [

  {
    path: '',
    component: WebsiteComponent,
    title: 'Accueil Scoolli',
    children: [

      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'demo',
        component: DemoComponent
      },
      {
        path: 'demande-demo',
        component: DemandeDemoComponent
      }
    ]

  }
];

