import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-create-classe',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-classe.component.html',
  styleUrls: ['./create-classe.component.css']
})
export class CreateClasseComponent implements OnInit {

  errorMessage?: string;
  classeId: number;
  classeFormGroup!: FormGroup;
  classe: any;
  isEdit: boolean = false;
  niveauList: Niveau[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter une classe";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.classeId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getNiveauList();
    this.initializeForm(null);
    if (this.classeId != null && this.classeId != undefined) {
      this.getClasse(this.classeId);
      this.title = 'Modifier une classe';
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

  getNiveauList() {
    this.referentielService.getAllNiveau().subscribe({
      next: (data) => {
        this.niveauList = data;
      }
    });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.classeFormGroup.get('niveau')?.value;
    const niveau = this.niveauList.find(n => Number(n.id) === Number(niveauId));
    return niveau?.libelle || '';
  }

  getClasse(classeId: number) {
    this.referentielService.getClasseById(classeId).subscribe({
      next: (data) => {
        this.classe = data;
        this.initializeForm(this.classe);
      }
    });
  }

  initializeForm(classe: Classe | null) {
    this.classeFormGroup = this._formBuilder.group({
      id: [classe?.id ? classe.id : ''],
      libelle: [classe?.libelle ? classe.libelle : '', Validators.required],
      niveau: [classe?.niveau ? classe.niveau : '', Validators.required],
    });
  }


  ajouteditClasse() {
    const payload = this.classeFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielService.createClasse(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La classe a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiel/classe'])
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
      this.referentielService.updateClasse(this.classeId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La classe a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiel/classe'])
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
    this.router.navigate(['admin/referentiel/classe'])
  }


}
