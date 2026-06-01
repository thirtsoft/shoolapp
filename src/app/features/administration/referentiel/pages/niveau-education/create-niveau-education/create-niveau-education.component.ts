import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NiveauEducation } from '../../../../../../core/models/referentiels/niveau-eduction';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-create-niveau-education',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-niveau-education.component.html',
  styleUrls: ['./create-niveau-education.component.css']
})
export class CreateNiveauEducationComponent implements OnInit {

  errorMessage?: string;
  niveauId: number;
  niveauFormGroup!: FormGroup;
  niveau: any;
  isEdit: boolean = false;

  ecoleId: any;
  userId: number;

  utilisateur: Utilisateur = {};

  title = "Ajouter un niveau éducation";

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
      this.title = 'Modifier un niveau éducation';
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
    this.referentielService.getNiveauEducationById(niveauId).subscribe({
      next: (data) => {
        this.niveau = data;
        this.initializeForm(this.niveau);
      }
    });
  }

  initializeForm(niveau: NiveauEducation | null) {
    this.niveauFormGroup = this._formBuilder.group({
      id: [niveau?.id ? niveau.id : ''],
      code: [niveau?.code ? niveau.code : '', Validators.required],
      libelle: [niveau?.libelle ? niveau.libelle : '', Validators.required]
    });
  }


  ajouteditNiveau() {
    const payload = this.niveauFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.niveauId && this.niveauId == undefined) {
      this.referentielService.createNiveauEducation(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le niveau a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/niveau-education'])
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
      this.referentielService.updateNiveauEducation(this.niveauId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le niveau a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/niveau-education'])
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
    this.router.navigate(['admin/referentiels/niveau-education'])
  }


}
