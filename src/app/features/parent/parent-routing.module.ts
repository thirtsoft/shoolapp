import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChoisirEleveComponent } from './components/choisir-eleve/choisir-eleve.component';
import { AjoutAbsenceEleveComponent } from './pages/absence/ajout-absence-eleve/ajout-absence-eleve.component';
import { ListAbsenceEleveComponent } from './pages/absence/list-absence-eleve/list-absence-eleve.component';
import { DashboardParentComponent } from './pages/dashboard-parent/dashboard-parent.component';
import { DetailsEmploidutempsEleveComponent } from './pages/emploidutemps/details-emploidutemps-eleve/details-emploidutemps-eleve.component';
import { EmploieEleveComponent } from './pages/emploidutemps/emploie-eleve/emploie-eleve.component';
import { ListCourseEleveComponent } from './pages/emploidutemps/list-course-eleve/list-course-eleve.component';
import { ExerciceAFaireComponent } from './pages/exercice/exercice-a-faire/exercice-a-faire.component';
import { DetailsFactureParentComponent } from './pages/facture/details-facture-parent/details-facture-parent.component';
import { ListInvoiceEleveComponent } from './pages/facture/list-invoice-eleve/list-invoice-eleve.component';
import { ListPaiementEleveComponent } from './pages/facture/list-paiement-eleve/list-paiement-eleve.component';
import { DetailsInscriptionEleveComponent } from './pages/inscription/details-inscription-eleve/details-inscription-eleve.component';
import { ListInscriptionEleveParentComponent } from './pages/inscription/list-inscription-eleve-parent/list-inscription-eleve-parent.component';
import { ListNoteEleveComponent } from './pages/list-note-eleve/list-note-eleve.component';
import { ListeBulletinEleveComponent } from './pages/liste-bulletin-eleve/liste-bulletin-eleve.component';
import { ListeEvenementComponent } from './pages/liste-evenement/liste-evenement.component';
import { ListeMenuComponent } from './pages/liste-menu/liste-menu.component';
import { NoteInformationComponent } from './pages/note-information/note-information.component';
import { ChangerPasswordParentComponent } from './pages/settings/changer-password-parent/changer-password-parent.component';
import { ParentProfileComponent } from './pages/settings/parent-profile/parent-profile.component';
import { ParentComponent } from './parent.component';

const routes: Routes = [
  { path: '', redirectTo: 'choisir', pathMatch: 'full' },
  {
    path: 'choisir',
    component: ChoisirEleveComponent
  },
  {
    path: '', component: ParentComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      /*  { path: '', redirectTo: 'choisir', pathMatch: 'full' }, */
      {
        path: 'dashboard',
        component: DashboardParentComponent
      },
      {
        path: 'facture',
        component: ListInvoiceEleveComponent
      },
      {
        path: 'facture/details/:id',
        component: DetailsFactureParentComponent
      },
      {
        path: 'payement',
        component: ListPaiementEleveComponent
      },
      {
        path: 'emploi-eleve',
        component: EmploieEleveComponent
      },
      {
        path: 'emploi-eleve/details/:id',
        component: DetailsEmploidutempsEleveComponent
      },
      {
        path: 'inscription',
        component: ListInscriptionEleveParentComponent
      },
      {
        path: 'inscription/details/:id',
        component: DetailsInscriptionEleveComponent
      },
      {
        path: 'cours',
        component: ListCourseEleveComponent
      },
      {
        path: 'note',
        component: ListNoteEleveComponent
      },
      {
        path: 'bulletin',
        component: ListeBulletinEleveComponent
      },
      {
        path: 'exercice',
        component: ExerciceAFaireComponent
      },
      {
        path: 'menu-cantine',
        component: ListeMenuComponent
      },
      {
        path: 'evenement-scolaire',
        component: ListeEvenementComponent
      },
      {
        path: 'absence',
        component: ListAbsenceEleveComponent
      },
      {
        path: 'absence/create',
        component: AjoutAbsenceEleveComponent
      },
      {
        path: 'information',
        component: NoteInformationComponent
      },
      {
        path: 'monprofil/:id',
        component: ParentProfileComponent
      },
      {
        path: 'changer-mot-passe',
        component: ChangerPasswordParentComponent
      }

    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentRoutingModule { }
