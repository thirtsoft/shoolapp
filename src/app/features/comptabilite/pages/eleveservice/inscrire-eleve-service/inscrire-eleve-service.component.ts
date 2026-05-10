import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { TypeServiceOffert } from '../../../../../core/models/referentiels/type-service-offert';
import { ListeInscription } from '../../../../../core/models/dossiereleve/request/liste-inscription';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { InscriptionEleveTypeService } from '../../../../../core/models/comptabilite/inscrire-eleve-service';

@Component({
  selector: 'app-inscrire-eleve-service',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inscrire-eleve-service.component.html',
  styleUrls: ['./inscrire-eleve-service.component.css']
})
export class InscrireEleveServiceComponent implements OnInit {

  errorMessage?: string;
  eleveinscrireId: number;
  eleveinscrireFormGroup!: FormGroup;
  eleveinscrire: any;
  isEdit: boolean = false;

  typeServiceList: (TypeServiceOffert | 'selectAll')[] = [];
  selectedTypeServiceOfferts: number[] = [];

  eleveList?: ListeInscription[];
  anneeScolaires: AnneeScolaire[] = [];
  classList?: any[];
  selectedPrimary: number | null = null;
  selectedSecondary: number | null = null;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Inscrire un èleve à un service";

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly eleveService = inject(DossierResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.eleveinscrireId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClassList();
    this.getTypeServiceList();
    this.getAnneeScolaires();
    this.initializeForm(null);
    if (this.eleveinscrireId != null && this.eleveinscrireId != undefined) {
      this.getInscriptionEleve(this.eleveinscrireId);
      this.title = 'Modifier une inscription';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });

  }

  getTypeServiceList() {
    this.referentielResource.getResourceList('typeserviceoffert/autres').subscribe({
      next: (data:any) => {
        this.typeServiceList = ['selectAll', ...data];
      }
    });
  }

  getClassList() {
    this.referentielResource.getResourceList('classe').subscribe({
      next: (data) => {
        this.classList = data;
      }
    });
  }

  getAnneeScolaires() {
    this.referentielResource.getResourceList('anneescolaire').subscribe({
      next: (data:any) => {
        this.anneeScolaires = data;
        console.log('Valeur sélectionnée:', this.anneeScolaires);
      }
    });
  }

  onPrimaryChange(event:any) {
    if (event.target.value != null && event.target.value != undefined) {
      this.getEleveList(event.target.value);
    }
  }


  getEleveList(classId: number) {
    this.eleveService.getResourceListByElement('inscription/classe', classId).subscribe({
      next: (data:any) => {
        this.eleveList = data;
      }
    });
  }

  getInscriptionEleve(eleveserviceId: number) {
    this.comptabiliteResource.recupererUneResource('eleveservice', eleveserviceId).subscribe({
      next: (data) => {
        this.eleveinscrire = data;
        this.getEleveList(this.eleveinscrire.classId)
        this.initializeForm(this.eleveinscrire);
      }
    });
  }

  toggleSelection(id: number, event: Event) {
    event.stopPropagation();
    const index = this.selectedTypeServiceOfferts.indexOf(id);
    if (index === -1) this.selectedTypeServiceOfferts.push(id);
    else this.selectedTypeServiceOfferts.splice(index, 1);
    this.eleveinscrireFormGroup.get('typeServiceOffertDTOList')?.setValue(this.selectedTypeServiceOfferts);
  }

  isAllSelected(): boolean {
    const normalActions = this.typeServiceList.filter(
      (a): a is TypeServiceOffert => a !== 'selectAll'
    );
    return (
      normalActions.length > 0 &&
      normalActions.every((a) => this.selectedTypeServiceOfferts.includes(a.id!))
    );
  }

  toggleSelectAll(event: Event) {
    event.stopPropagation();
    const normalActions = this.typeServiceList.filter(
      (a): a is TypeServiceOffert => a !== 'selectAll'
    );
    if (this.isAllSelected()) {
      this.selectedTypeServiceOfferts = [];
    } else {
      this.selectedTypeServiceOfferts = normalActions.map((a) => a.id!) as number[];
    }
    this.eleveinscrireFormGroup.get('typeServiceOffertDTOList')?.setValue(this.selectedTypeServiceOfferts);
  }

  initializeForm(eleveservice: InscriptionEleveTypeService | null) {
    this.eleveinscrireFormGroup = this._formBuilder.group({
      id: [eleveservice?.id ? eleveservice.id : ''],
      classId: [eleveservice?.classId ? eleveservice.classId : '', Validators.required],
      anneeScolaire: [eleveservice?.anneeScolaire ? eleveservice.anneeScolaire : '', Validators.required],
      eleve: [eleveservice?.eleve ? eleveservice.eleve : '', Validators.required],
      typeServiceOffertDTOList: [eleveservice?.typeServiceOffertDTOList?.map(a => a.id) ?? [], Validators.required],
      benefice_remise: [eleveservice?.benefice_remise ?? '', Validators.required],
      remise: [eleveservice?.remise ?? ''],
    });
  }


  ajouteditInscriptionEleveTypeService() {
    const typeServiceOffertSelected = this.eleveinscrireFormGroup.value.typeServiceOffertDTOList;
    this.eleveinscrire = {
      id: this.eleveinscrireFormGroup.get('id')?.value,
      classId: this.eleveinscrireFormGroup.get('classId')?.value,
      eleve: this.eleveinscrireFormGroup.get('eleve')?.value,
      anneeScolaire: this.eleveinscrireFormGroup.get('anneeScolaire')?.value,
      benefice_remise: this.eleveinscrireFormGroup.get('benefice_remise')?.value,
      remise: this.eleveinscrireFormGroup.get('remise')?.value,
      typeServiceOffertDTOList: this.typeServiceList.filter((action: any) => typeServiceOffertSelected.includes(Number(action.id)))
    };
    this.eleveinscrire.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.comptabiliteResource.creerUneRessource('eleveservice', this.eleveinscrire).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Inscription a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/comptabilite/eleveservice'])
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.comptabiliteResource.modifierUneRessource('eleveservice', this.eleveinscrireId, this.eleveinscrire).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Inscription a été modifiées avec succès !!! ');
            this.router.navigate(['admin/comptabilite/eleveservice'])
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
        }
      });

    }
  }


  goBack() {
    this.router.navigate(['admin/comptabilite/eleveservice'])
  }

}
