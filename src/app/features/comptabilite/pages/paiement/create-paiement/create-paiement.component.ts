import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListeFacture } from '../../../../../core/models/comptabilite/liste-facture';
import { PaiementAdd } from '../../../../../core/models/comptabilite/paiement';
import { MoyenPaiement } from '../../../../../core/models/referentiels/moyen-paiement';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-paiement',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './create-paiement.component.html',
  styleUrls: ['./create-paiement.component.css']
})
export class CreatePaiementComponent implements OnInit {

  errorMessage?: string;
  paiementId: number;
  paiementFormGroup!: FormGroup;
  paiement: any;
  isEdit: boolean = false;
  facture?: any;

  selectedFacture?: any;

  factureList?: ListeFacture[];
  moyenPayementList: MoyenPaiement[] = [];

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Enregistrer un paiement d'une facture";

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService)
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder)
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute)
  private readonly router = inject(Router);

  constructor(
  ) {
    this.paiementId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getFactureList();
    this.getMoyenPaiementList();
    this.initializeForm(null);
    if (this.paiementId != null && this.paiementId != undefined) {
      this.getPaiement(this.paiementId);
      this.title = 'Modifier un paiement de facture';
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

  getFactureList() {
    this.comptabiliteResource.getResourceList('facture/encours')?.subscribe({
      next: (data: any) => {
        this.factureList = data;
      }
    });
  }

  getMoyenPaiementList() {
    this.referentielResource.getResourceList('moyenpaiement')?.subscribe({
      next: (data: any) => {
        this.moyenPayementList = data;
      }
    });
  }


  onFactureSelected(event: any) {
    this.getFacture(event.target.value);
  }

  getFacture(factureId: number) {
    this.comptabiliteResource.recupererUneResource('facture', factureId).subscribe({
      next: (data) => {
        this.facture = data;
        this.paiementFormGroup.get('montantFacture')?.setValue(this.facture?.montant);
      }
    });
  }

  isFormStep2Valid(): boolean {
    return !!(this.paiementFormGroup.get('facture')?.value &&
      this.paiementFormGroup.get('moyenPaiement')?.value &&
      this.paiementFormGroup.get('montant')?.value);
  }

  /*
    getPaiement(paiementId: number) {
      this.comptabiliteResource.recupererUneResource('payement', paiementId).subscribe({
        next: (data) => {
          this.paiement = data;
          this.paiementFormGroup = this._formBuilder.group({
            id: [this.paiement?.id ? this.paiement.id : ''],
            facture: [this.paiement?.facture != null ? this.paiement.facture.toString() : '', Validators.required],
            moyenPaiement: [this.paiement?.moyenPaiement ? this.paiement.moyenPaiement : '', Validators.required],
            mode: [this.paiement?.mode ? this.paiement.mode : '', Validators.required],
            montant: [this.paiement?.montant ? this.paiement?.montant : '', Validators.required],
            montantFacture: [this.paiement?.montantFacture ? this.paiement?.montantFacture : '']
          });
          this.paiementFormGroup.get('montantFacture')?.setValue(this.paiement?.facture?.montant);
        }
      });
    }*/

  getPaiement(paiementId: number) {
    this.comptabiliteResource.recupererUneResource('payement', paiementId).subscribe({
      next: (data) => {
        this.paiement = data;
        this.paiementFormGroup.patchValue({
          id: this.paiement?.id || '',
          facture: this.paiement?.facture?.id?.toString() || '',
          moyenPaiement: this.paiement?.moyenPaiement?.id || '',
          mode: this.paiement?.mode || '',
          montant: this.paiement?.montant || '',
          montantFacture: this.paiement?.facture?.montant || ''
        });
      }
    });
  }

  /*
    initializeForm(pay: PaiementAdd | null) {
      this.paiementFormGroup = this._formBuilder.group({
        id: [pay?.id ? pay.id : ''],
        facture: [pay?.facture != null ? pay.facture.toString() : '', Validators.required],
        moyenPaiement: [pay?.moyenPaiement ? pay.moyenPaiement : '', Validators.required],
         mode: ['ESPECE', Validators.required], // Valeur par défaut
        mode: [pay?.mode ? pay.mode : '', Validators.required],
        montant: [pay?.montant ? pay?.montant : '', Validators.required],
        montantFacture: [pay?.montantFacture ? pay?.montantFacture : '']
      });
  
    }*/

  initializeForm(pay: PaiementAdd | null) {
    this.paiementFormGroup = this._formBuilder.group({
      id: [''],
      facture: ['', Validators.required],
      moyenPaiement: ['', Validators.required],
      mode: ['ESPECE', Validators.required], // Valeur par défaut
      montant: ['', [Validators.required, Validators.min(1)]],
      montantFacture: [{ value: '', disabled: true }]
    });
  }

  getMontantRestant(): number {
    const montantFacture = this.paiementFormGroup.get('montantFacture')?.value || 0;
    const montantRecu = this.paiementFormGroup.get('montant')?.value || 0;
    return montantFacture - montantRecu;
  }

  isMontantValide(): boolean {
    const montantFacture = this.paiementFormGroup.get('montantFacture')?.value || 0;
    const montantRecu = this.paiementFormGroup.get('montant')?.value || 0;
    return montantRecu <= montantFacture && montantRecu > 0;
  }


  ajouteditUnPaiement() {
    if (!this.isMontantValide()) {
      this.toastService.warning('Attention', 'Le montant reçu ne peut pas dépasser le montant de la facture');
      return;
    }
    const payload = {
      ...this.paiementFormGroup.getRawValue(),
      ecole: this.ecoleId,
      montant: Number(this.paiementFormGroup.get('montant')?.value),
      facture: Number(this.paiementFormGroup.get('facture')?.value)
    };

    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.comptabiliteResource.creerUneRessource('payement', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le paiement a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/comptabilite/paiement'])
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
      this.comptabiliteResource.modifierUneRessource('payement', this.paiementId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le paiement a été modifiées avec succès !!! ');
            this.router.navigate(['admin/comptabilite/paiement'])
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
    this.router.navigate(['admin/comptabilite/paiement'])
  }

}
