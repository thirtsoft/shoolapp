import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Paiement } from '../../../../../core/models/comptabilite/paiement';
import { PaiementAdd } from '../../../../../core/models/dossiereleve/request/paiement-add';
import { Eleve } from '../../../../../core/models/parent/parent';
import { TypePaiement } from '../../../../../core/models/referentiels/type-paiement';
import { ReferentielService } from '../../../referentiel/service/referentiel.service';
import { DossierEleveService } from '../../service/dossier-eleve.service';


@Component({
  selector: 'app-creation-paiement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './creation-paiement.component.html',
  styleUrls: ['./creation-paiement.component.css']
})
export class CreationPaiementComponent implements OnInit {

  errorMessage?: string;
  addPaiment: PaiementAdd = {};
  editPaiement: Paiement = {};
  eleves: Eleve[] = [];
  listTypePaiements: TypePaiement[] = [];
  paiementId?: number;

  listeMois: string[] = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
  ];

  title = "Ajouter un paiement";

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly referentielService = inject(ReferentielService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  paiementFormGroup = this._formBuilder.group({
    paiements: this._formBuilder.array([this.newPaiementItem()])
  });

  editPaiementFormGroup: any;

  ngOnInit(): void {
    this.paiementId = this.activeRoute.snapshot.params['id'];
    this.getTypePaiements();
    this.getEleves();
    this.initializeForm(null);
    if (this.paiementId != null && this.paiementId != undefined) {
      this.getPaiementById(this.paiementId);
      this.title = 'Modifier un paiement';
    }
  }

  getEleves() {
    this.dossierEleveService.getAllEleves().subscribe(
      (data: any[]) => {
        console.log("Eleves list", data);
        this.eleves = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  getTypePaiements() {
    this.referentielService.getAllTypePaiements().subscribe(
      (data: any[]) => {
        this.listTypePaiements = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getPaiementById(paiementId: number) {
    this.dossierEleveService.getPaiement(paiementId).subscribe({
      next: (data) => {
        this.editPaiement = data;
        this.initializeForm(this.editPaiement);
      }
    });
  }

  paiements(): FormArray {
    return this.paiementFormGroup.get("paiements") as FormArray
  }

  newPaiementItem(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      code: ['', Validators.required],
      eleveDTO: ['', Validators.required],
      mois: ['', Validators.required],
      typePaiements: []
    })
  }

  onAddPaiementItem() {
    this.paiements().push(this.newPaiementItem());
  }

  removePaiementItem(parentItemIndex: number) {
    this.paiements().removeAt(parentItemIndex);
  }


  ajouterPaiement() {
    const payload = this.paiementFormGroup.getRawValue().paiements;
    this.addPaiment = {
      paiements: payload
    }
    this.dossierEleveService.addPaiement(this.addPaiment).subscribe({
      next: (data) => {
        console.log("Paiement result", data);
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les informations du paiement ont été enregistrées avec succès !!! ');
          this.router.navigate(['/admin/dossier-eleve/paiement']);
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
        }
        this.ngOnInit();
      },

      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    });
  }

  initializeForm(pay: Paiement | null) {
    this.editPaiementFormGroup = this._formBuilder.group({
      id: [pay?.id ? pay.id : ''],
      code: [pay?.code ? pay.code : '', Validators.required],
      eleveDTO: [pay?.eleveDTO!.id ? pay.eleveDTO.id : '', Validators.required],
      mois: [pay?.mois ? pay.mois : '', Validators.required],
      typePaiements: [pay?.typePaiements?.map(a => a.id) ?? [], Validators.required],
    });
  }


  modifierPaiement() {
    const typePaySelected = this.editPaiementFormGroup.get('typePaiements')?.value;
    this.editPaiement = {
      id: this.editPaiementFormGroup.get("id").value,
      code: this.editPaiementFormGroup.get("code").value,
      mois: this.editPaiementFormGroup.get("mois").value,
      eleveDTO: this.eleves.filter(r => r.id == this.editPaiementFormGroup.get("eleveDTO").value)[0],
      typePaiements: this.listTypePaiements.filter(typePay => typePaySelected.includes(Number(typePay.id)))
    }
    this.dossierEleveService.updatePaiement(this.paiementId!, this.editPaiement).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les informations du paiement ont été modifiées avec succès !!! ');
          this.router.navigate(['/admin/dossier-eleve/paiement']);
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la modification : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);

      }
    });

  }

}
