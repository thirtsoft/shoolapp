import { Routes } from "@angular/router";
import { ExamenComponent } from "./examen.component";
import { ExamenDetailsComponent } from "./pages/examen-details/examen-details.component";
import { ListExamenComponent } from "./pages/list-examen/list-examen.component";


export const EXAMEN_ROUTES: Routes = [
  {
    path: '',
    component: ExamenComponent,
    children: [

      {
        path: '',
        component: ListExamenComponent
      },
      {
        path: 'details/:uuid',
        component: ExamenDetailsComponent
      },

    ]
  }

];

