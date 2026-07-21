import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';
import { Serie } from '../../../../../../core/models/referentiels/serie';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
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
  serieList: Serie[] = [];
  anneeScolaireList: AnneeScolaire[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter une classe";

  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResource = inject(ReferentielResourceService);
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
    this.getNiveauList();
    this.getAnneeScolaireList();
    this.getSerieList();
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
    this.referentielResource.getResourceList('niveau').subscribe({
      next: (data: any) => {
        this.niveauList = data;
      }
    });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.classeFormGroup.get('niveau')?.value;
    const niveau = this.niveauList.find(n => Number(n.id) === Number(niveauId));
    return niveau?.libelle || '';
  }

  getSerieList() {
    this.referentielResource.getResourceList('serie').subscribe({
      next: (data: any) => {
        this.serieList = data;
      }
    });
  }

  getSelectedSerieName(): string {
    const serieId = this.classeFormGroup.get('serie')?.value;
    const serie = this.serieList.find(n => Number(n.id) === Number(serieId));
    return serie?.libelle || '';
  }

  getAnneeScolaireList() {
    this.referentielResource.getResourceList('anneescolaire').subscribe({
      next: (data: any) => {
        this.anneeScolaireList = data;
      }
    });
  }

  getSelectedAnneeScolaireName(): string {
    const anneeScolaireId = this.classeFormGroup.get('anneeScolaire')?.value;
    const anneeScolaire = this.anneeScolaireList.find(n => Number(n.id) === Number(anneeScolaireId));
    return anneeScolaire?.libelle || '';
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
      id: [classe?.id || null],
      libelle: [classe?.libelle || '', Validators.required],
      niveau: [classe?.niveau || null, Validators.required],
      capacite: [classe?.capacite || null, Validators.required],
      anneeScolaire: [classe?.anneeScolaire || null, Validators.required],
      serie: [classe?.serie || null],
    });
  }


  ajouteditClasse() {
    //  const payload = this.classeFormGroup.value;

    if (this.classeFormGroup.invalid) {
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');

      Object.keys(this.classeFormGroup.controls).forEach(key => {
        const control = this.classeFormGroup.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const formValue = this.classeFormGroup.getRawValue();

    const payload: Classe = {
      libelle: formValue.libelle?.trim(),
      niveau: formValue.niveau ? Number(formValue.niveau) : undefined,
      anneeScolaire: formValue.anneeScolaire ? Number(formValue.anneeScolaire) : undefined,
      serie: formValue.serie ? Number(formValue.serie) : undefined,
      capacite: formValue.capacite ? Number(formValue.capacite) : undefined,
    };

    if (this.classeId) {
      payload.id = this.classeId;
    }


    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielService.createClasse(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La classe a été enregistrées avec succès !!! ');
            this.goBack();
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
            this.goBack();
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
    this.router.navigate(['admin/referentiel/classes'])
  }


}
