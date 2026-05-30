import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-create-niveau',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-niveau.component.html',
  styleUrls: ['./create-niveau.component.css']
})
export class CreateNiveauComponent implements OnInit {

  errorMessage?: string;
  niveauId: number;
  niveauFormGroup!: FormGroup;
  niveau: any;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;

  utilisateur: Utilisateur = {};

  title = "Ajouter un niveau";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.niveauId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.niveauId != null && this.niveauId != undefined) {
      this.getNiveau(this.niveauId);
      this.title = 'Modifier un niveau';
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

  getNiveau(niveauId: number) {
    this.referentielService.getNiveau(niveauId).subscribe({
      next: (data) => {
        this.niveau = data;
        this.initializeForm(this.niveau);
      }
    });
  }

  initializeForm(niveau: Niveau | null) {
    this.niveauFormGroup = this._formBuilder.group({
      id: [niveau?.id ? niveau.id : ''],
      libelle: [niveau?.libelle ? niveau.libelle : '', Validators.required]
    });
  }


  ajouteditNiveau() {
    const payload = this.niveauFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.niveauId && this.niveauId == undefined) {
      this.referentielService.createNiveau(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le niveau a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/niveau'])
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
      this.referentielService.updateNiveau(this.niveauId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le niveau a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/niveau'])
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
    this.router.navigate(['admin/referentiels/niveau'])
  }



}
