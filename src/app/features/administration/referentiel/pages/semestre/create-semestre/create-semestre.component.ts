import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';


@Component({
  selector: 'app-create-semestre',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-semestre.component.html',
  styleUrls: ['./create-semestre.component.css']
})
export class CreateSemestreComponent implements OnInit {

  errorMessage?: string;
  semestreId: number;
  semestreFormGroup!: FormGroup;
  semestre: any;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;

  utilisateur: Utilisateur = {};

  title = "Ajouter un semestre";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.semestreId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.semestreId != null && this.semestreId != undefined) {
      this.getSemestre(this.semestreId);
      this.title = 'Modifier un semestre';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
        //      this.ecoleId = this.utilisateur.ecoleId;
      },
      error: error => { console.log(error) },
    });
  }

  getSemestre(semestreId: number) {
    this.referentielService.getSemestreById(semestreId).subscribe({
      next: (data) => {
        this.semestre = data;
        this.initializeForm(this.semestre);
      }
    });
  }

  initializeForm(semestre: Semestre | null) {
    this.semestreFormGroup = this._formBuilder.group({
      id: [semestre?.id ? semestre.id : ''],
      code: [semestre?.code ? semestre.code : '', Validators.required],
      libelle: [semestre?.libelle ? semestre.libelle : '', Validators.required],
      dateDebut: [semestre?.dateDebut ? semestre.dateDebut : '', Validators.required],
      dateFin: [semestre?.dateFin ? semestre.dateFin : '', Validators.required],
    });
  }


  ajouteditSemestre() {
    const payload = this.semestreFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielService.createSemestre(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le semestre a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/semestre'])
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
      this.referentielService.updateSemestre(this.semestreId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le semestre a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/semestre'])
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
    this.router.navigate(['admin/referentiels/semestre'])
  }

}
