import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { Tarif } from '../../../../../core/models/referentiels/tarif';
import { ListeEleve } from '../../../../../core/models/dossiereleve/liste-eleve';
import { TypeServiceOffert } from '../../../../../core/models/referentiels/type-service-offert';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { DossierEleveService } from '../../../../administration/dossier-eleve/service/dossier-eleve.service';
import { Facture } from '../../../../../core/models/comptabilite/facture';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-facture',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './create-facture.component.html',
  styleUrls: ['./create-facture.component.css']
})
export class CreateFactureComponent implements OnInit {

  errorMessage?: string;
  factureId: number;
  factureFormGroup!: FormGroup;
  facture: any;
  isEdit: boolean = false;

  classList: ListeClasse[] = [];
  typeServiceList: TypeServiceOffert[] = [];
  eleveList: ListeEleve[] = [];
  tarif: Tarif = {};
  montant?: any;

  title = "Ajouter une facture";

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly eleveService = inject(DossierEleveService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);



  constructor(
  ) {
    this.factureId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getClassList();
    this.getTypeServiceList();
    this.getEleveList();
    this.initializeForm(null);
    if (this.factureId != null && this.factureId != undefined) {
      this.getFacture(this.factureId);
      this.title = 'Modifier une facture';
      this.isEdit = true;
    }
  }

  getClassList() {
    this.referentielResource.getResourceList('classe')?.subscribe({
      next: (data:any) => {
        this.classList = data;
      }
    });
  }

  getTypeServiceList() {
    this.referentielResource.getResourceList('typeserviceoffert').subscribe({
      next: (data:any) => {
        this.typeServiceList = data;
      }
    });
  }

  selectedTypeService: any;

  onTypeServiceSelected(value: any) {
    if (value != null && value != undefined) {
      this.getTarifByTypeService(value)
    }

  }

  getTarifByTypeService(typeServiceId: number) {
    this.referentielService.getTarifByTypeService(typeServiceId).subscribe({
      next: (data) => {
        this.tarif = data;
        this.montant = this.tarif.montant;
        this.factureFormGroup.get('montant')?.setValue(this.montant);
      }
    });
  }

  getEleveList() {
    this.eleveService.getAllEleves().subscribe({
      next: (data) => {
        this.eleveList = data;
      }
    });
  }

  getFacture(factureId: number) {
    this.comptabiliteResource.recupererUneResource('facture', factureId).subscribe({
      next: (data) => {
        this.facture = data;
        this.initializeForm(this.facture);
      }
    });
  }


  initializeForm(facture: Facture | null) {
    this.factureFormGroup = this._formBuilder.group({
      id: [facture?.id ? facture.id : ''],
      eleve: [facture?.eleve ? facture.eleve : '', Validators.required],
      typeService: [facture?.typeService ? facture.typeService : '', Validators.required],
      montant: [facture?.montant ? facture?.montant : '', Validators.required],
    });
    this.factureFormGroup.get('typeService')?.valueChanges.subscribe(value => {
      this.onTypeServiceSelected(value);
    });

  }


  ajouteditFacture() {
    const payload = this.factureFormGroup.value;
    if (!this.isEdit) {
      this.comptabiliteResource.creerUneRessource('facture', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La facture a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/comptabilite/facture'])
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
      this.comptabiliteResource.modifierUneRessource('facture', this.factureId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La facture a été modifiées avec succès !!! ');
            this.router.navigate(['admin/comptabilite/facture'])
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
    this.router.navigate(['admin/comptabilite/facture'])
  }

}