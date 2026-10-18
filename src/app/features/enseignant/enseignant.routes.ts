import { Routes } from '@angular/router';
import { MainLayoutProfesseurComponent } from './component/main-layout-professeur-component/main-layout-professeur-component';
import { EditAbsenceComponent } from './pages/absence/edit-absence-component/edit-absence-component';
import { FaireAppelComponent } from './pages/absence/faire-appel-component/faire-appel-component';
import { ListAbsenceComponent } from './pages/absence/list-absence-component/list-absence-component';
import { ClasseManagementComponent } from './pages/classe-management-component/classe-management-component';
import { DemanderUnCongeComponent } from './pages/conge/demander-un-conge-component/demander-un-conge-component';
import { DetailsCongeComponent } from './pages/conge/details-conge-component/details-conge-component';
import { MesCongesComponent } from './pages/conge/mes-conges-component/mes-conges-component';
import { CreateEvaluationEnseignantComponent } from './pages/evaluation/create-evaluation-enseignant/create-evaluation-enseignant.component';
import { DetailEvaluationEnseignantComponent } from './pages/evaluation/detail-evaluation-enseignant/detail-evaluation-enseignant.component';
import { ListEvaluationEnseignantComponent } from './pages/evaluation/list-evaluation-enseignant/list-evaluation-enseignant.component';
import { CreationExerciceComponent } from './pages/exercice/creation-exercice/creation-exercice.component';
import { DetailsExerciceComponent } from './pages/exercice/details-exercice/details-exercice.component';
import { ListExerciceComponent } from './pages/exercice/list-exercice/list-exercice.component';
import { AjoutEditBonSalaireComponent } from './pages/finance/ajout-edit-bon-salaire-component/ajout-edit-bon-salaire-component';
import { BonSalairesComponent } from './pages/finance/bon-salaires-component/bon-salaires-component';
import { DetailsBonSalaireComponent } from './pages/finance/details-bon-salaire-component/details-bon-salaire-component';
import { MesContratsComponent } from './pages/finance/mes-contrats-component/mes-contrats-component';
import { MesPaiesComponent } from './pages/finance/mes-paies-component/mes-paies-component';
import { ListCoursComponent } from './pages/list-cours/list-cours.component';
import { ListReunionComponent } from './pages/list-reunion/list-reunion.component';
import { MesEnseignementComponent } from './pages/mes-enseignement-component/mes-enseignement-component';
import { MonAgendaComponent } from './pages/mon-agenda-component/mon-agenda-component';
import { EditPasswordEnseignantComponent } from './pages/mon-compte/edit-password-enseignant-component/edit-password-enseignant-component';
import { MyAccountComponent } from './pages/mon-compte/my-account/my-account.component';
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
        path: 'evaluations',
        component: ListEvaluationEnseignantComponent
      },
      {
        path: 'evaluation',
        component: CreateEvaluationEnseignantComponent
      },
      {
        path: 'evaluation/edit/:id',
        component: CreateEvaluationEnseignantComponent
      },

      {
        path: 'evaluation/details/:id',
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
        path: 'activites',
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
        path: 'contrats',
        component: MesContratsComponent
      },
      {
        path: 'paies',
        component: MesPaiesComponent
      },
      {
        path: 'bon-salaires',
        component: BonSalairesComponent
      },

      {
        path: 'bon-salaire/create',
        component: AjoutEditBonSalaireComponent
      },
      {
        path: 'bon-salaire/edit/:uuid',
        component: AjoutEditBonSalaireComponent
      },

      {
        path: 'bon-salaire/detail/:id',
        component: DetailsBonSalaireComponent
      },

      {
        path: 'change-password',
        component: EditPasswordEnseignantComponent
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
