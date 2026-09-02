
import { Routes } from '@angular/router';
import { WebsiteComponent } from './website-component';
import { HomeComponent } from './home-component/home-component';
import { DemoComponent } from './demo-component/demo-component';

export const WEBSITE_ROUTES: Routes = [

  {
    path: '',
    component: WebsiteComponent,
    title: 'Accueil visiteur',
    children: [

      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'demo',
        component: DemoComponent
      },
    ]

  }
];

