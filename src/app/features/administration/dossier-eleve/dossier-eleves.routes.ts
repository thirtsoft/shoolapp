
import { Routes } from '@angular/router';
import { DossierEleveComponent } from './dossier-eleve.component';
import { CreationAbsenceComponent } from './pages/absence/creation-absence/creation-absence.component';
import { ListeAbsenceComponent } from './pages/absence/liste-absence/liste-absence.component';
import { CreateBulletinComponent } from './pages/bulletin/create-bulletin/create-bulletin.component';
import { GenererBulletinClasseComponent } from './pages/bulletin/generer-bulletin-classe/generer-bulletin-classe.component';
import { GenererBulletinComponent } from './pages/bulletin/generer-bulletin/generer-bulletin.component';
import { ListeBulletinEleveComponent } from './pages/bulletin/liste-bulletin-eleve/liste-bulletin-eleve.component';
import { CreationEleveComponent } from './pages/creation-eleve/creation-eleve.component';
import { CreationInscriptionComponent } from './pages/creation-inscription/creation-inscription.component';
import { DetailsEleveComponent } from './pages/details-eleve/details-eleve.component';
import { CreateEvaluationComponent } from './pages/evaluation/create-evaluation/create-evaluation.component';
import { DetailsEvaluationComponent } from './pages/evaluation/details-evaluation/details-evaluation.component';
import { EditEvaluationComponent } from './pages/evaluation/edit-evaluation/edit-evaluation.component';
import { ListEvaluationComponent } from './pages/evaluation/list-evaluation/list-evaluation.component';
import { InscrireEleveComponent } from './pages/inscrire-eleve/inscrire-eleve.component';
import { ListeEleveComponent } from './pages/liste-eleve/liste-eleve.component';
import { ListeInscriptionComponent } from './pages/liste-inscription/liste-inscription.component';
import { AjoutNoteComponent } from './pages/note/ajout-note/ajout-note.component';
import { ListNotesComponent } from './pages/note/list-notes/list-notes.component';
import { EditParentComponent } from './pages/parent/edit-parent/edit-parent.component';
import { ParentDetailsComponent } from './pages/parent/parent-details/parent-details.component';
import { ParentListComponent } from './pages/parent/parent-list/parent-list.component';


export const DOSSIERS_ELEVES_ROUTES: Routes = [
  {
    path: '',
    component: DossierEleveComponent,
    children: [
      {
        path: 'eleves',
        component: ListeEleveComponent
      },
      {
        path: 'eleve',
        component: CreationEleveComponent
      },
      {
        path: 'eleve/edit/:id',
        component: CreationEleveComponent
      },
      {
        path: 'details/:id',
        component: DetailsEleveComponent
      },
      {
        path: 'inscrire-eleve',
        component: InscrireEleveComponent
      },
      {
        path: 'inscrire-eleve/:id',
        component: InscrireEleveComponent
      },
      {
        path: 'inscriptions',
        component: ListeInscriptionComponent
      },
      {
        path: 'inscription',
        component: CreationInscriptionComponent
      },
      {
        path: 'inscription/edit/:id',
        component: CreationInscriptionComponent
      },
      {
        path: 'reinscription/:id',
        component: CreationInscriptionComponent
      },

      /*
      {
        path: 'paiement',
        component: PaiementComponent
      },
      {
        path: 'paiement/create',
        component: CreationPaiementComponent
      },
      {
        path: 'paiement/edit/:id',
        component: CreationPaiementComponent
      },*/
      {
        path: 'parent',
        component: ParentListComponent
      },
      {
        path: 'parent/details/:id',
        component: ParentDetailsComponent
      },
      {
        path: 'parent/edit/:id',
        component: EditParentComponent
      },

      {
        path: 'evaluations',
        component: ListEvaluationComponent
      },
      {
        path: 'evaluation',
        component: CreateEvaluationComponent
      },
      {
        path: 'evaluation/edit/:id',
        component: EditEvaluationComponent
      },
      {
        path: 'evaluation/details/:id',
        component: DetailsEvaluationComponent
      },

      {
        path: 'notes',
        component: ListNotesComponent
      },
      {
        path: 'ajout-note',
        component: AjoutNoteComponent
      },
      {
        path: 'edit-note/:id',
        component: AjoutNoteComponent
      },
      {
        path: 'bulletin',
        component: ListeBulletinEleveComponent
      },
      {
        path: 'bulletin/create',
        component: CreateBulletinComponent
      },
      {
        path: 'bulletin/edit/:id',
        component: CreateBulletinComponent
      },

      {
        path: 'bulletin/generer',
        component: GenererBulletinClasseComponent
      },
      {
        path: 'bulletin/details/:id',
        component: GenererBulletinComponent
      },
      {
        path: 'absences',
        component: ListeAbsenceComponent
      },
      {
        path: 'absence/create',
        component: CreationAbsenceComponent
      },
      {
        path: 'absence/edit/:id',
        component: CreationAbsenceComponent
      },

    ],
  },
];

