import { Routes } from '@angular/router';
import { ChoisirEleveComponent } from './components/choisir-eleve/choisir-eleve.component';
import { MainLayoutParentComponent } from './components/main-layout-parent-component/main-layout-parent-component';
import { AjoutAbsenceEleveComponent } from './pages/absence/ajout-absence-eleve/ajout-absence-eleve.component';
import { ListAbsenceEleveComponent } from './pages/absence/list-absence-eleve/list-absence-eleve.component';
import { ListCourseEleveComponent } from './pages/emploidutemps/list-course-eleve/list-course-eleve.component';
import { EvaluationClasseComponent } from './pages/evaluation/evaluation-classe-component/evaluation-classe-component';
import { ExerciceAFaireComponent } from './pages/exercice/exercice-a-faire/exercice-a-faire.component';
import { DetailsFactureParentComponent } from './pages/facture/details-facture-parent/details-facture-parent.component';
import { ListInvoiceEleveComponent } from './pages/facture/list-invoice-eleve/list-invoice-eleve.component';
import { InscriptionServiceEleveComponent } from './pages/inscriptionservice/inscription-service-eleve-component/inscription-service-eleve-component';
import { ListServiceOffertComponent } from './pages/inscriptionservice/list-service-offert-component/list-service-offert-component';
import { ListNoteEleveComponent } from './pages/list-note-eleve/list-note-eleve.component';
import { ListeEvenementComponent } from './pages/liste-evenement/liste-evenement.component';
import { NoteInformationComponent } from './pages/noteinformation/note-information/note-information.component';
import { ScolariteEleveComponent } from './pages/scolarite-eleve-component/scolarite-eleve-component';
import { ChangerPasswordParentComponent } from './pages/settings/changer-password-parent/changer-password-parent.component';
import { ParentProfileComponent } from './pages/settings/parent-profile/parent-profile.component';
import { DetailsExerciceComponent } from './pages/exercice/details-exercice/details-exercice.component';

export const PARENT_ROUTES: Routes = [

  { path: '', redirectTo: 'choisir', pathMatch: 'full' },
  {
    path: 'choisir',
    component: ChoisirEleveComponent
  },

  {
    path: '',
    component: MainLayoutParentComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-parent-component/dashboard-parent-component').then(m => m.DashboardParentComponent),
        title: 'Tableau de bord'
      },
      {
        path: 'factures',
        component: ListInvoiceEleveComponent
      },
      {
        path: 'facture/details/:id',
        component: DetailsFactureParentComponent
      },
      {
        path: 'evaluations',
        component: EvaluationClasseComponent
      },
      {
        path: 'services',
        component: InscriptionServiceEleveComponent
      },
      {
        path: 'cours',
        component: ListCourseEleveComponent
      },
      {
        path: 'notes',
        component: ListNoteEleveComponent
      },
      {
        path: 'scolarite',
        component: ScolariteEleveComponent
      },
      {
        path: 'exercices',
        component: ExerciceAFaireComponent
      },
      {
        path: 'exercice/details/:id',
        component: DetailsExerciceComponent
      },
      {
        path: 'tarifs-services',
        component: ListServiceOffertComponent
      },

      {
        path: 'activites',
        component: ListeEvenementComponent
      },
      {
        path: 'absences',
        component: ListAbsenceEleveComponent
      },
      {
        path: 'absence/create',
        component: AjoutAbsenceEleveComponent
      },
      {
        path: 'informations',
        component: NoteInformationComponent
      },
      {
        path: 'monprofil',
        component: ParentProfileComponent
      },
      {
        path: 'changer-mot-passe',
        component: ChangerPasswordParentComponent
      }

    ]
  },
];