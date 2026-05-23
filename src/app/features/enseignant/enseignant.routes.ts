import { Routes } from '@angular/router';
import { MainLayoutProfesseurComponent } from './component/main-layout-professeur-component/main-layout-professeur-component';
import { CreateAbsenceComponent } from './pages/absence/create-absence-component/create-absence-component';
import { ClasseManagementComponent } from './pages/classe-management-component/classe-management-component';
import { CreationAbsenceComponent } from './pages/creation-absence/creation-absence.component';
import { CreationNoteComponent } from './pages/creation-note/creation-note.component';
import { DemandeAbsenceComponent } from './pages/demande-absence/demande-absence.component';
import { ListEleveEnseignantComponent } from './pages/eleve/list-eleve-enseignant/list-eleve-enseignant.component';
import { CreateEvaluationEnseignantComponent } from './pages/evaluation/create-evaluation-enseignant/create-evaluation-enseignant.component';
import { DetailEvaluationEnseignantComponent } from './pages/evaluation/detail-evaluation-enseignant/detail-evaluation-enseignant.component';
import { EditEvaluationEnseignantComponent } from './pages/evaluation/edit-evaluation-enseignant/edit-evaluation-enseignant.component';
import { ListEvaluationEnseignantComponent } from './pages/evaluation/list-evaluation-enseignant/list-evaluation-enseignant.component';
import { CreationExerciceComponent } from './pages/exercice/creation-exercice/creation-exercice.component';
import { DetailsExerciceComponent } from './pages/exercice/details-exercice/details-exercice.component';
import { ListExerciceComponent } from './pages/exercice/list-exercice/list-exercice.component';
import { ListAbsenceComponent } from './pages/list-absence/list-absence.component';
import { ListCoursComponent } from './pages/list-cours/list-cours.component';
import { ListNoteClasseComponent } from './pages/list-note-classe/list-note-classe.component';
import { ListReunionComponent } from './pages/list-reunion/list-reunion.component';
import { MesEnseignementComponent } from './pages/mes-enseignement-component/mes-enseignement-component';
import { MonAgendaComponent } from './pages/mon-agenda-component/mon-agenda-component';
import { MyAccountComponent } from './pages/my-account/my-account.component';


export const ENSEIGNANTS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutProfesseurComponent,
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard-enseignant-component/dashboard-enseignant-component')
            .then(m => m.DashboardEnseignantComponent),
        title: 'Dashboard - Professeur'
      },

      {
        path: 'agenda',
        component: MonAgendaComponent
      },

      {
        path: 'gestion-classe/:id',
        component: ClasseManagementComponent
      },

      {
        path: 'absences',
        component: ListAbsenceComponent
      },
      {
        path: 'absence/create',
        component: CreateAbsenceComponent
      },
      {
        path: 'absence/edit/:id',
        component: CreateAbsenceComponent
      },

      {
        path: 'exercices',
        component: ListExerciceComponent
      },
      {
        path: 'exercice/create',
        component: CreationExerciceComponent
      },
      {
        path: 'exercice/edit/:id',
        component: CreationExerciceComponent
      },

      {
        path: 'exercice/detail/:id',
        component: DetailsExerciceComponent
      },
      {
        path: 'demande-conge',
        component: CreationAbsenceComponent
      },
      {
        path: 'mes-conges',
        component: ListAbsenceComponent
      },
      {
        path: 'mes-eleves',
        component: ListEleveEnseignantComponent
      },
      {
        path: 'detailsdemandeconge',
        component: DemandeAbsenceComponent
      },

      {
        path: 'evaluations',
        component: ListEvaluationEnseignantComponent
      },
      {
        path: 'evaluation',
        component: CreateEvaluationEnseignantComponent
      },
      {
        path: 'evaluation/edit/:id',
        component: EditEvaluationEnseignantComponent
      },

      {
        path: 'evaluation/detail/:id',
        component: DetailEvaluationEnseignantComponent
      },

      {
        path: 'note',
        component: CreationNoteComponent
      },
      {
        path: 'notes',
        component: ListNoteClasseComponent
      },
      {
        path: 'mes-cours',
        component: ListCoursComponent
      },
      {
        path: 'mes-enseignements',
        component: MesEnseignementComponent
      },
      {
        path: 'mes-reunions',
        component: ListReunionComponent
      },
      {
        path: 'mon-compte',
        component: MyAccountComponent
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

];
