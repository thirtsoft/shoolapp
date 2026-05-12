import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnseignantComponent } from './enseignant.component';
import { CreationAbsenceComponent } from './pages/creation-absence/creation-absence.component';
import { CreationNoteComponent } from './pages/creation-note/creation-note.component';
import { DashboardEnseignantComponent } from './pages/dashboard-enseignant/dashboard-enseignant.component';
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
import { MyAccountComponent } from './pages/my-account/my-account.component';

const routes: Routes = [
  {
    path: '',
    component: EnseignantComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardEnseignantComponent
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
        path: 'mes-reunions',
        component: ListReunionComponent
      },
      {
        path: 'mon-compte',
        component: MyAccountComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnseignantRoutingModule { }
