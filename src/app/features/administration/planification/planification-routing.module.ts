import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCoursComponent } from './pages/cours/list-cours/list-cours.component';
import { PlanifierCoursComponent } from './pages/cours/planifier-cours/planifier-cours.component';
import { CreateEmploieDuTempsComponent } from './pages/emploietemps/create-emploie-du-temps/create-emploie-du-temps.component';
import { DetailsEmploiDuTempsAdminComponent } from './pages/emploietemps/details-emploi-du-temps-admin/details-emploi-du-temps-admin.component';
import { EmploieDuTempsComponent } from './pages/emploietemps/emploie-du-temps/emploie-du-temps.component';
import { ListEnseignementComponent } from './pages/enseignement/list-enseignement/list-enseignement.component';
import { PlanifierEnseignementComponent } from './pages/enseignement/planifier-enseignement/planifier-enseignement.component';
import { CreateEvenementComponent } from './pages/evenement/create-evenement/create-evenement.component';
import { DetailEvenementComponent } from './pages/evenement/detail-evenement/detail-evenement.component';
import { EvenementComponent } from './pages/evenement/evenement.component';
import { CreateExerciceComponent } from './pages/exercice/create-exercice/create-exercice.component';
import { ListExerciceComponent } from './pages/exercice/list-exercice/list-exercice.component';
import { CreateLeconComponent } from './pages/lecon/create-lecon/create-lecon.component';
import { LeconsComponent } from './pages/lecon/lecons/lecons.component';
import { CreateLivreComponent } from './pages/livre/create-livre/create-livre.component';
import { LivresComponent } from './pages/livre/livres/livres.component';
import { CreateMeetingComponent } from './pages/meeting/create-meeting/create-meeting.component';
import { MeetingComponent } from './pages/meeting/meeting.component';
import { PlanificationComponent } from './planification.component';
import { ListNoteInformationComponent } from './pages/noteinformation/list-note-information/list-note-information.component';
import { CreateEditNoteInformationComponent } from './pages/noteinformation/create-edit-note-information/create-edit-note-information.component';

const routes: Routes = [
  {
    path: '',
    component: PlanificationComponent,
    children: [
      {
        path: 'emploi-du-temps',
        component: EmploieDuTempsComponent
      },
      {
        path: 'emploi-du-temps/create',
        component: CreateEmploieDuTempsComponent
      },
      {
        path: 'emploi-du-temps/edit/:id',
        component: CreateEmploieDuTempsComponent
      },
      {
        path: 'emploi-du-temps/details/:id',
        component: DetailsEmploiDuTempsAdminComponent
      },
      {
        path: 'cours',
        component: ListCoursComponent,
      },
      {
        path: 'planifier-cours',
        component: PlanifierCoursComponent
      },
      {
        path: 'planifier/:id',
        component: PlanifierCoursComponent
      },

      {
        path: 'livre',
        component: LivresComponent
      },
      {
        path: 'livre/create',
        component: CreateLivreComponent
      },
      {
        path: 'livre/edit/:id',
        component: CreateLivreComponent
      },
      {
        path: 'lecon',
        component: LeconsComponent
      },
      {
        path: 'lecon/create',
        component: CreateLeconComponent
      },
      {
        path: 'lecon/edit/:id',
        component: CreateLeconComponent
      },
      {
        path: 'exercice',
        component: ListExerciceComponent
      },
      {
        path: 'exercice/create',
        component: CreateExerciceComponent
      },
      {
        path: 'exercice/edit/:id',
        component: CreateExerciceComponent
      },
      {
        path: 'enseignement',
        component: ListEnseignementComponent
      },
      {
        path: 'enseignement/create',
        component: PlanifierEnseignementComponent
      },
      {
        path: 'enseignement/edit/:id',
        component: PlanifierEnseignementComponent
      },
      {
        path: 'evenement',
        component: EvenementComponent
      },
      {
        path: 'evenement/create',
        component: CreateEvenementComponent
      },
      {
        path: 'evenement/edit/:id',
        component: CreateEvenementComponent
      },
      {
        path: 'evenement/details/:id',
        component: DetailEvenementComponent
      },
      {
        path: 'reunion',
        component: MeetingComponent
      },
      {
        path: 'reunion/create',
        component: CreateMeetingComponent
      },
      {
        path: 'reunion/edit/:id',
        component: CreateMeetingComponent
      },

      {
        path: 'noteinformations',
        component: ListNoteInformationComponent
      },
      {
        path: 'noteinformation/create',
        component: CreateEditNoteInformationComponent
      },
      {
        path: 'noteinformation/edit/:id',
        component: CreateEditNoteInformationComponent
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanificationRoutingModule { }
