import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-annee-scolaire',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './create-annee-scolaire.component.html',
  styleUrls: ['./create-annee-scolaire.component.css']
})
export class CreateAnneeScolaireComponent implements OnInit {
  errorMessage?: string;
  anneeScolaireId: number;
  anneeScolairesFormGroup!: FormGroup;
  anneeScolaire: any;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter une année scolaire";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.anneeScolaireId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.anneeScolaireId != null && this.anneeScolaireId != undefined) {
      this.getAnneeScolaireById(this.anneeScolaireId);
      this.title = 'Modifier une année scolaire';
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

  getAnneeScolaireById(anneeScolaireId: number) {
    this.referentielService.getAnneeScolaireById(anneeScolaireId).subscribe({
      next: (data) => {
        this.anneeScolaire = data;
        this.initializeForm(this.anneeScolaire);
      }
    });
  }


  initializeForm(anneeScolaire: AnneeScolaire | null) {
    this.anneeScolairesFormGroup = this._formBuilder.group({
      id: [anneeScolaire?.id ? anneeScolaire.id : ''],
      libelle: [anneeScolaire?.libelle ? anneeScolaire.libelle : '', Validators.required],
      dateDebut: [anneeScolaire?.dateDebut ? anneeScolaire.dateDebut : '', Validators.required],
      dateFin: [anneeScolaire?.dateFin ? anneeScolaire.dateFin : ''],
    });
  }


  ajouteditAnneeScolaire() {
    const payload = this.anneeScolairesFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielService.createAnneeScolaire(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations de année scolaire ont été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/annee-scolaire'])
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
      payload.ecole = this.ecoleId;
      this.referentielService.updateAnneeScolaire(this.anneeScolaireId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations de année scolaire ont été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/annee-scolaire'])
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
    this.router.navigate(['admin/referentiels/annee-scolaire'])
  }


}
