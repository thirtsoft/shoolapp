
import { Routes } from '@angular/router';
import { ReferentielsComponent } from './referentiels.component';
import { BatimentComponent } from './pages/batiment/batiment.component';
import { CreationBatimentComponent } from './pages/batiment/creation-batiment/creation-batiment.component';
import { AnneeScolaireComponent } from './pages/anneescolaire/annee-scolaire/annee-scolaire.component';
import { CreateAnneeScolaireComponent } from './pages/anneescolaire/create-annee-scolaire/create-annee-scolaire.component';
import { MatiereComponent } from './pages/matiere/matiere.component';
import { CreateMatiereAvecCoefficientComponent } from './pages/matiere/create-matiere-avec-coefficient/create-matiere-avec-coefficient.component';
import { ClasseComponent } from './pages/classe/classe.component';
import { CreateClasseComponent } from './pages/classe/create-classe/create-classe.component';
import { SemestreComponent } from './pages/semestre/semestre.component';
import { CreateSemestreComponent } from './pages/semestre/create-semestre/create-semestre.component';
import { CategoryMenuComponent } from './pages/category-menu/category-menu.component';
import { CreationCategoryMenuComponent } from './pages/category-menu/creation-category-menu/creation-category-menu.component';
import { MenuComponent } from './pages/menu/menu.component';
import { NiveauEducationComponent } from './pages/niveau-education/niveau-education.component';
import { CreateNiveauEducationComponent } from './pages/niveau-education/create-niveau-education/create-niveau-education.component';
import { ListNiveauComponent } from './pages/niveau/list-niveau/list-niveau.component';
import { CreateNiveauComponent } from './pages/niveau/create-niveau/create-niveau.component';
import { TypePaiementComponent } from './pages/type-paiement/type-paiement.component';
import { TypeDocumentsComponent } from './pages/type-document/type-documents/type-documents.component';
import { CreateTypeDocumentComponent } from './pages/type-document/create-type-document/create-type-document.component';
import { SallesComponent } from './pages/salle/salles/salles.component';
import { ListTypeServiceOffertComponent } from './pages/typeservice/list-type-service-offert/list-type-service-offert.component';
import { CreateTypeServiceOffertComponent } from './pages/typeservice/create-type-service-offert/create-type-service-offert.component';
import { ListTarifComponent } from './pages/tarif/list-tarif/list-tarif.component';
import { CreateTarifComponent } from './pages/tarif/create-tarif/create-tarif.component';
import { CoefficientmatclasseComponent } from './pages/coefficientmatclasse/coefficientmatclasse/coefficientmatclasse.component';
import { CreateCoefficientmatclasseComponent } from './pages/coefficientmatclasse/create-coefficientmatclasse/create-coefficientmatclasse.component';
import { ListeModePaiementComponent } from './pages/modepaiement/liste-mode-paiement/liste-mode-paiement.component';
import { CreateModePaiementComponent } from './pages/modepaiement/create-mode-paiement/create-mode-paiement.component';
import { ConfigEtablissementComponent } from './pages/config-etablissement/config-etablissement.component';

export const REFERENTIELS_ROUTES: Routes = [
  {
    path: '',
    component: ReferentielsComponent,
    children: [

      {
        path: 'batiment',
        component: BatimentComponent
      },

      {
        path: 'batiment/create',
        component: CreationBatimentComponent
      },
      {
        path: 'batiment/edit/:id',
        component: CreationBatimentComponent
      },
      {
        path: 'annee-scolaire',
        component: AnneeScolaireComponent,
      },
      {
        path: 'annee-scolaire/create',
        component: CreateAnneeScolaireComponent,
      },
      {
        path: 'annee-scolaire/edit/:id',
        component: CreateAnneeScolaireComponent,
      },
      {
        path: 'matiere',
        component: MatiereComponent
      },
      {
        path: 'matiere/create',
        component: CreateMatiereAvecCoefficientComponent
      },
      {
        path: 'matiere/edit/:id',
        component: CreateMatiereAvecCoefficientComponent
      },
      {
        path: 'classe',
        component: ClasseComponent
      },
      {
        path: 'classe/create',
        component: CreateClasseComponent
      },
      {
        path: 'classe/edit/:id',
        component: CreateClasseComponent
      },
      {
        path: 'semestre',
        component: SemestreComponent
      },
      {
        path: 'semestre/create',
        component: CreateSemestreComponent
      },
      {
        path: 'semestre/edit/:id',
        component: CreateSemestreComponent
      },
      {
        path: 'category-menu',
        component: CategoryMenuComponent
      },
      {
        path: 'category-menu/create',
        component: CreationCategoryMenuComponent
      },
      {
        path: 'category-menu/edit/:id',
        component: CreationCategoryMenuComponent
      },
      {
        path: 'menu',
        component: MenuComponent
      },
      {
        path: 'niveau-education',
        component: NiveauEducationComponent
      },
      {
        path: 'niveau-education/create',
        component: CreateNiveauEducationComponent
      },
      {
        path: 'niveau-education/edit/:id',
        component: CreateNiveauEducationComponent
      },
      {
        path: 'niveau',
        component: ListNiveauComponent
      },
      {
        path: 'niveau/create',
        component: CreateNiveauComponent
      },
      {
        path: 'niveau/edit/:id',
        component: CreateNiveauComponent
      },


      {
        path: 'type-paiement',
        component: TypePaiementComponent
      },
      {
        path: 'type-document',
        component: TypeDocumentsComponent
      },
      {
        path: 'type-document/create',
        component: CreateTypeDocumentComponent
      },
      {
        path: 'type-document/edit/:id',
        component: CreateTypeDocumentComponent
      },

      {
        path: 'salle',
        component: SallesComponent
      },
      {
        path: 'typeservice',
        component: ListTypeServiceOffertComponent
      },
      {
        path: 'typeservice/create',
        component: CreateTypeServiceOffertComponent
      },
      {
        path: 'typeservice/edit/:id',
        component: CreateTypeServiceOffertComponent
      },
      {
        path: 'tarif',
        component: ListTarifComponent
      },
      {
        path: 'tarif/create',
        component: CreateTarifComponent
      },
      {
        path: 'tarif/edit/:id',
        component: CreateTarifComponent
      },
      {
        path: 'coefficient',
        component: CoefficientmatclasseComponent
      },
      {
        path: 'coefficient/create',
        component: CreateCoefficientmatclasseComponent
      },
      {
        path: 'coefficient/edit/:id',
        component: CreateCoefficientmatclasseComponent
      },
      {
        path: 'moyenpaiement',
        component: ListeModePaiementComponent
      },
      {
        path: 'moyenpaiement/create',
        component: CreateModePaiementComponent
      },
      {
        path: 'moyenpaiement/edit/:id',
        component: CreateModePaiementComponent
      },

      {
        path: 'parametrage',
        component: ConfigEtablissementComponent
      }
    ]
  }          
  
];

