import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComptabiliteComponent } from './comptabilite.component';
import { InscrireEleveServiceComponent } from './pages/eleveservice/inscrire-eleve-service/inscrire-eleve-service.component';
import { ListInscrireEleveServiceComponent } from './pages/eleveservice/list-inscrire-eleve-service/list-inscrire-eleve-service.component';
import { CreateFactureComponent } from './pages/facture/create-facture/create-facture.component';
import { GenererFactureClasseComponent } from './pages/facture/generer-facture-classe/generer-facture-classe.component';
import { ListFactureComponent } from './pages/facture/list-facture/list-facture.component';
import { CreatePaiementComponent } from './pages/paiement/create-paiement/create-paiement.component';
import { ListPaiementComponent } from './pages/paiement/list-paiement/list-paiement.component';
import { DetailsFactureComponent } from './pages/facture/details-facture/details-facture.component';

const routes: Routes = [
  {
    path: '',
    component: ComptabiliteComponent,
    children: [
      {
        path: 'facture',
        component: ListFactureComponent
      },
      {
        path: 'facture/create',
        component: CreateFactureComponent
      },
      {
        path: 'facture/edit/:id',
        component: CreateFactureComponent
      },
      {
        path: 'facture/generer',
        component: GenererFactureClasseComponent
      },
      {
        path: 'facture/details/:id',
        component: DetailsFactureComponent
      },
      {
        path: 'paiement',
        component: ListPaiementComponent
      },
      {
        path: 'paiement/create',
        component: CreatePaiementComponent
      },
      {
        path: 'paiement/edit/:id',
        component: CreatePaiementComponent
      },
      {
        path: 'eleveservice',
        component: ListInscrireEleveServiceComponent
      },
      {
        path: 'eleveservice/create',
        component: InscrireEleveServiceComponent
      },
      {
        path: 'eleveservice/edit/:id',
        component: InscrireEleveServiceComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComptabiliteRoutingModule { }
