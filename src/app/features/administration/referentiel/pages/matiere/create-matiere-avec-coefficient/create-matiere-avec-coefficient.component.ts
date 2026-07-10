import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { MatiereAvecCoefficient } from '../../../../../../core/models/referentiels/matiere';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { ReferentielService } from '../../../service/referentiel.service';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';
import { Serie } from '../../../../../../core/models/referentiels/serie';

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
    const niveauId = this.matiereAvecCoeficientFormGroup.get('coefficientMatiereClasseAddEditDTOList')?.get('niveau')?.value;
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
    const serieId = this.matiereAvecCoeficientFormGroup.get('coefficientMatiereClasseAddEditDTOList')?.get('serie')?.value;
    const serie = this.serieList.find(n => Number(n.id) === Number(serieId));
    return serie?.libelle || '';
  }

  getMatiereAvecCoefficient(batId: number) {
    this.referentielService.getMatiereAvecCoefficient(batId).subscribe({
      next: (data) => {
        this.matiereAvecCoeeficient = data;
        this.matiereAvecCoeficientFormGroup = this._formBuilder.group({
          id: [this.matiereAvecCoeeficient?.id ? this.matiereAvecCoeeficient.id : ''],
          code: [this.matiereAvecCoeeficient?.code ? this.matiereAvecCoeeficient.code : '', Validators.required],
          libelle: [this.matiereAvecCoeeficient?.libelle ? this.matiereAvecCoeeficient.libelle : '', Validators.required],
          coefficientMatiereClasseAddEditDTOList: this._formBuilder.array([])
        });
        for (let i = 0; i < this.matiereAvecCoeeficient.coefficientMatiereClasseAddEditDTOList!.length; i++) {
          (this.matiereAvecCoeficientFormGroup.get('coefficientMatiereClasseAddEditDTOList') as FormArray).push(
            this._formBuilder.group({
              id: [this.matiereAvecCoeeficient.coefficientMatiereClasseAddEditDTOList![i].id],
              niveau: [this.matiereAvecCoeeficient.coefficientMatiereClasseAddEditDTOList![i].niveau, Validators.required],
              serie: [this.matiereAvecCoeeficient.coefficientMatiereClasseAddEditDTOList![i].serie, Validators.required],
              coefficient: [this.matiereAvecCoeeficient.coefficientMatiereClasseAddEditDTOList![i].coefficient, Validators.required],
            })
          )
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la récupération : ' + data.error);
      }
    }
    );
  }


  initializeForm(matiere: MatiereAvecCoefficient | null) {
    this.matiereAvecCoeficientFormGroup = this._formBuilder.group({
      id: [matiere?.id ? matiere.id : ''],
      code: [matiere?.code ? matiere.code : '', Validators.required],
      libelle: [matiere?.libelle ? matiere.libelle : '', Validators.required],
      coefficientMatiereClasseAddEditDTOList: this._formBuilder.array([
        this.newCoefficientMatiereClasseItem()
      ])
    });
  }

  coefficientMatiereClasseAddEditDTOList(): FormArray {
    return this.matiereAvecCoeficientFormGroup.get('coefficientMatiereClasseAddEditDTOList') as FormArray;
  }

  newCoefficientMatiereClasseItem(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      niveau: ['', Validators.required],
      serie: ['', Validators.required],
      coefficient: ['', Validators.required],
    })
  }

  onAddCoefficientItem() {
    console.log("New traitement", this.newCoefficientMatiereClasseItem().value);
    this.coefficientMatiereClasseAddEditDTOList().push(this.newCoefficientMatiereClasseItem());
  }

  removeCoefficientItem(classItemIndex: number) {
    this.coefficientMatiereClasseAddEditDTOList().removeAt(classItemIndex);
  }

  ajouterUneMAtiereAvecCoefficient() {
    if (!this.matiereAvecCoefficientId && this.matiereAvecCoefficientId == undefined) {
      const payload: MatiereAvecCoefficient = {
        id: this.matiereAvecCoeficientFormGroup.get("id")!.value,
        code: this.matiereAvecCoeficientFormGroup.get("code")!.value,
        libelle: this.matiereAvecCoeficientFormGroup.get("libelle")!.value,
        coefficientMatiereClasseAddEditDTOList: this.matiereAvecCoeficientFormGroup.get("coefficientMatiereClasseAddEditDTOList")!.value,
      }
      payload.ecole = this.ecoleId;
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
