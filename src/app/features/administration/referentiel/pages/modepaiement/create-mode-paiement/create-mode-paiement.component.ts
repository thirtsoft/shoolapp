import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { MoyenPaiement } from '../../../../../../core/models/referentiels/moyen-paiement';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-create-mode-paiement',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-mode-paiement.component.html',
  styleUrls: ['./create-mode-paiement.component.css']
})
export class CreateModePaiementComponent implements OnInit {

  errorMessage?: string;
  moyenpaiementId: number;
  moyenPaiementFormGroup!: FormGroup;
  moyenPaiement: any;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter un moyen de paiement";

  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.moyenpaiementId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.moyenpaiementId != null && this.moyenpaiementId != undefined) {
      this.getMoyenPaiement(this.moyenpaiementId);
      this.title = 'Modifier un moyen de paiement';
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

  getMoyenPaiement(moyenpaiementId: number) {
    this.referentielResource.recupererUneResource("moyenpaiement", moyenpaiementId).subscribe({
      next: (data) => {
        this.moyenPaiement = data;
        this.initializeForm(this.moyenPaiement);
      }
    });
  }

  initializeForm(moyenPaiement: MoyenPaiement | null) {
    this.moyenPaiementFormGroup = this._formBuilder.group({
      id: [moyenPaiement?.id ? moyenPaiement.id : ''],
      libelle: [moyenPaiement?.libelle ? moyenPaiement.libelle : '', Validators.required]
    });
  }


  ajouteditUnMoyenPaiement() {
    const payload = this.moyenPaiementFormGroup.value;
    if (!this.moyenpaiementId && this.moyenpaiementId == undefined) {
      this.referentielResource.creerUneRessource("moyenpaiement", payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le moyenpaiement a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/moyenpaiement'])
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
      this.referentielResource.modifierUneRessource("moyenpaiement", this.moyenpaiementId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le moyenpaiement a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/moyenpaiement'])
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
    this.router.navigate(['admin/referentiels/moyenpaiement'])
  }

}
