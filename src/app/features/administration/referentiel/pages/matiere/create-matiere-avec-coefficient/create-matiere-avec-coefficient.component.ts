import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatiereAvecCoefficient } from '../../../../../../core/models/referentiels/matiere';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';
import { Serie } from '../../../../../../core/models/referentiels/serie';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-create-matiere-avec-coefficient',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-matiere-avec-coefficient.component.html',
  styleUrls: ['./create-matiere-avec-coefficient.component.css']
})
export class CreateMatiereAvecCoefficientComponent implements OnInit {

  errorMessage?: string;
  matiereAvecCoefficientId: number;
  matiereAvecCoeficientFormGroup!: FormGroup;
  matiereAvecCoeeficient: MatiereAvecCoefficient = {};
  isEdit: boolean = false;
  niveauList: Niveau[] = [];
  serieList: Serie[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter une matière";

  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.matiereAvecCoefficientId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getNiveauList();
    this.getSerieList();
    this.initializeForm(null);
    if (this.matiereAvecCoefficientId != null && this.matiereAvecCoefficientId != undefined) {
      this.getMatiereAvecCoefficient(this.matiereAvecCoefficientId);
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

  getNiveauList() {
    this.referentielResource.getResourceList('niveau').subscribe({
      next: (data: any) => {
        this.niveauList = data;
      }
    });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.matiereAvecCoeficientFormGroup.get('coefficientMatiereAddEditDTOList')?.get('niveau')?.value;
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
    const serieId = this.matiereAvecCoeficientFormGroup.get('coefficientMatiereAddEditDTOList')?.get('serie')?.value;
    const serie = this.serieList.find(n => Number(n.id) === Number(serieId));
    return serie?.libelle || '';
  }

  getMatiereAvecCoefficient(batId: number) {
    this.referentielService.getMatiereAvecCoefficient(batId).subscribe({
      next: (data) => {
        console.log('Données reçues du backend:', data);
        this.matiereAvecCoeeficient = data;

        // Créer le formulaire avec les données de base
        this.matiereAvecCoeficientFormGroup = this._formBuilder.group({
          id: [data?.id ?? null],
          code: [data?.code ?? '', Validators.required],
          libelle: [data?.libelle ?? '', Validators.required],
          coefficientMatiereAddEditDTOList: this._formBuilder.array([])
        });

        // Récupérer le FormArray
        const formArray = this.matiereAvecCoeficientFormGroup.get('coefficientMatiereAddEditDTOList') as FormArray;

        // Vider le FormArray d'abord (au cas où)
        while (formArray.length !== 0) {
          formArray.removeAt(0);
        }

        // Ajouter les coefficients depuis les données reçues
        if (data.coefficientMatiereAddEditDTOList && data.coefficientMatiereAddEditDTOList.length > 0) {
          console.log('Nombre de coefficients à ajouter:', data.coefficientMatiereAddEditDTOList.length);

          data.coefficientMatiereAddEditDTOList.forEach((coeff, index) => {
            console.log(`Ajout coefficient ${index}:`, coeff);

            formArray.push(
              this._formBuilder.group({
                id: [coeff.id ?? null],
                niveau: [coeff.niveau ? Number(coeff.niveau) : null, Validators.required],
                serie: [coeff.serie ? Number(coeff.serie) : null],
                coefficient: [coeff.coefficient ? Number(coeff.coefficient) : '', Validators.required],
              })
            );
          });
        } else {
          // Si pas de coefficients, ajouter au moins un formulaire vide
          formArray.push(this.newCoefficientMatiereClasseItem());
        }

        console.log('Formulaire après remplissage:', this.matiereAvecCoeficientFormGroup.value);
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la récupération : ' + data.error);
      }
    });
  }


  initializeForm(matiere: MatiereAvecCoefficient | null) {
    this.matiereAvecCoeficientFormGroup = this._formBuilder.group({
      id: [matiere?.id ?? null],
      code: [matiere?.code ? matiere.code : '', Validators.required],
      libelle: [matiere?.libelle ? matiere.libelle : '', Validators.required],
      coefficientMatiereAddEditDTOList: this._formBuilder.array([
        this.newCoefficientMatiereClasseItem()
      ])
    });
  }

  coefficientMatiereAddEditDTOList(): FormArray {
    return this.matiereAvecCoeficientFormGroup.get('coefficientMatiereAddEditDTOList') as FormArray;
  }

  newCoefficientMatiereClasseItem(): FormGroup {
    return this._formBuilder.group({
      id: [null],
      niveau: [null, Validators.required],
      serie: [null],
      coefficient: ['', Validators.required],
    })
  }

  onAddCoefficientItem() {
    console.log("New traitement", this.newCoefficientMatiereClasseItem().value);
    this.coefficientMatiereAddEditDTOList().push(this.newCoefficientMatiereClasseItem());
  }

  removeCoefficientItem(classItemIndex: number) {
    this.coefficientMatiereAddEditDTOList().removeAt(classItemIndex);
  }

  ajouterUneMAtiereAvecCoefficient() {
    if (!this.matiereAvecCoefficientId && this.matiereAvecCoefficientId == undefined) {
      const formValue = this.matiereAvecCoeficientFormGroup.getRawValue();

      const payload: MatiereAvecCoefficient = {
        id: formValue.id ?? null,
        code: formValue.code,
        libelle: formValue.libelle,
        coefficientMatiereAddEditDTOList: formValue.coefficientMatiereAddEditDTOList.map((item: any) => ({
          id: item.id ? Number(item.id) : null,
          niveau: item.niveau ? Number(item.niveau) : null,  // Conversion string → number
          serie: item.serie ? Number(item.serie) : null,      // Conversion string → number
          coefficient: Number(item.coefficient)               // Conversion string → number
        }))
      };
      payload.ecole = this.ecoleId;
      console.log('payload envoyé', payload);
      this.referentielService.createMatiereAvecCoefficient(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations du batiment ont été enregistrées avec succès !!! ');
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
      this.matiereAvecCoeeficient = this.matiereAvecCoeficientFormGroup.value;
      this.matiereAvecCoeeficient.ecole = this.ecoleId;
      this.referentielService.updateMatiereAvecCoefficient(this.matiereAvecCoefficientId, this.matiereAvecCoeeficient).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations du batiment ont été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/matieres'])
  }


}
