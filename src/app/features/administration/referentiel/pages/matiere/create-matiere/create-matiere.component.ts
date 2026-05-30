import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-create-matiere',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-matiere.component.html',
  styleUrls: ['./create-matiere.component.css']
})
export class CreateMatiereComponent implements OnInit {

  errorMessage?: string;
  matiereId: number;
  matiereFormGroup!: FormGroup;
  matiere: any;
  isEdit: boolean = false;

  title = "Ajouter une matière";

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.matiereId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.matiereId != null && this.matiereId != undefined) {
      this.getMatiere(this.matiereId);
      this.title = 'Modifier une matière';
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

  getMatiere(matiereId: number) {
    this.referentielService.getMatiereById(matiereId).subscribe({
      next: (data) => {
        this.matiere = data;
        this.initializeForm(this.matiere);
      }
    });
  }


  initializeForm(matiere: Matiere | null) {
    this.matiereFormGroup = this._formBuilder.group({
      id: [matiere?.id ? matiere.id : ''],
      code: [matiere?.code ? matiere.code : '', Validators.required],
      libelle: [matiere?.libelle ? matiere.libelle : '', Validators.required],
      ecole: [matiere?.ecole ? matiere.ecole : '', Validators.required],
    });
  }


  ajouteditMatiere() {
    const payload = this.matiereFormGroup.value;
    if (!this.isEdit) {
      payload.ecole = this.ecoleId;
      this.referentielService.createMatiere(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations de la matière ont été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/matiere'])
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
      this.referentielService.updateMatiere(this.matiereId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations de année scolaire ont été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/matiere'])
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
    this.router.navigate(['admin/referentiels/matiere'])
  }

}
