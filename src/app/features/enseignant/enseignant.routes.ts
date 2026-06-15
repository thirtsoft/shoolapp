import { Routes } from '@angular/router';
import { MainLayoutProfesseurComponent } from './component/main-layout-professeur-component/main-layout-professeur-component';
import { EditAbsenceComponent } from './pages/absence/edit-absence-component/edit-absence-component';
import { FaireAppelComponent } from './pages/absence/faire-appel-component/faire-appel-component';
import { ListAbsenceComponent } from './pages/absence/list-absence-component/list-absence-component';
import { ClasseManagementComponent } from './pages/classe-management-component/classe-management-component';
import { DemanderUnCongeComponent } from './pages/conge/demander-un-conge-component/demander-un-conge-component';
import { DetailsCongeComponent } from './pages/conge/details-conge-component/details-conge-component';
import { MesCongesComponent } from './pages/conge/mes-conges-component/mes-conges-component';
import { ListEleveEnseignantComponent } from './pages/eleve/list-eleve-enseignant/list-eleve-enseignant.component';
import { CreateEvaluationEnseignantComponent } from './pages/evaluation/create-evaluation-enseignant/create-evaluation-enseignant.component';
import { DetailEvaluationEnseignantComponent } from './pages/evaluation/detail-evaluation-enseignant/detail-evaluation-enseignant.component';
import { EditEvaluationEnseignantComponent } from './pages/evaluation/edit-evaluation-enseignant/edit-evaluation-enseignant.component';
import { ListEvaluationEnseignantComponent } from './pages/evaluation/list-evaluation-enseignant/list-evaluation-enseignant.component';
import { CreationExerciceComponent } from './pages/exercice/creation-exercice/creation-exercice.component';
import { DetailsExerciceComponent } from './pages/exercice/details-exercice/details-exercice.component';
import { ListExerciceComponent } from './pages/exercice/list-exercice/list-exercice.component';
import { ListCoursComponent } from './pages/list-cours/list-cours.component';
import { ListReunionComponent } from './pages/list-reunion/list-reunion.component';
import { MesEnseignementComponent } from './pages/mes-enseignement-component/mes-enseignement-component';
import { MonAgendaComponent } from './pages/mon-agenda-component/mon-agenda-component';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { EditerUneNoteComponent } from './pages/note/editer-une-note-component/editer-une-note-component';
import { ListNotesElevesComponent } from './pages/note/list-notes-eleves-component/list-notes-eleves-component';
import { SaisirNotesEleveComponent } from './pages/note/saisir-notes-eleve-component/saisir-notes-eleve-component';


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
        path: 'appel',
        component: FaireAppelComponent
      },
      {
        path: 'absences',
        component: ListAbsenceComponent
      },
      {
        path: 'absence/edit/:id',
        component: EditAbsenceComponent
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
        path: 'mes-eleves',
        component: ListEleveEnseignantComponent
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
        path: 'notes',
        component: ListNotesElevesComponent
      },
      {
        path: 'saisir-notes',
        component: SaisirNotesEleveComponent
      },
      {
        path: 'note/edit/:id',
        component: EditerUneNoteComponent
      },

      {
        path: 'mes-cours',
        component: ListCoursComponent
      },
      {
        path: 'mes-classes',
        component: MesEnseignementComponent
      },
      {
        path: 'mes-reunions',
        component: ListReunionComponent
      },
      {
        path: 'mes-conges',
        component: MesCongesComponent
      },
      {
        path: 'demandeconge',
        component: DemanderUnCongeComponent
      },
      {
        path: 'demandeconge/edit/:id',
        component: DemanderUnCongeComponent
      },
      {
        path: 'detailsdemandeconge/detail/:id',
        component: DetailsCongeComponent
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
