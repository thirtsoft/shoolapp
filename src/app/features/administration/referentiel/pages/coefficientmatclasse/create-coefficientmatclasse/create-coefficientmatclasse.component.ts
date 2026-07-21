import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CoefficientMatiereClasse } from '../../../../../../core/models/referentiels/coefficient-matiere-classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';
import { Serie } from '../../../../../../core/models/referentiels/serie';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-create-coefficientmatclasse',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-coefficientmatclasse.component.html',
  styleUrls: ['./create-coefficientmatclasse.component.css']
})
export class CreateCoefficientmatclasseComponent implements OnInit {

  errorMessage?: string;
  coeffId: number;
  coefficientFormGroup!: FormGroup;
  coefficent: any;
  isEdit: boolean = false;
  matiereList: Matiere[] = [];
  niveauList: Niveau[] = [];
  serieList: Serie[] = [];

  title = "Ajouter un coefficient par matiere et classe";

  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.coeffId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getNiveauList();
    this.getSerieList();
    this.getMatiereList();
    this.initializeForm(null);
    if (this.coeffId != null && this.coeffId != undefined) {
      this.getCoefficient(this.coeffId);
      this.title = 'Modifier un coefficient';
      this.isEdit = true;
    }
  }

  getNiveauList() {
    this.referentielResource.getResourceList('niveau').subscribe({
      next: (data: any) => {
        this.niveauList = data;
      }
    });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.coefficientFormGroup.get('niveau')?.value;
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
    const serieId = this.coefficientFormGroup.get('serie')?.value;
    const serie = this.serieList.find(n => Number(n.id) === Number(serieId));
    return serie?.libelle || '';
  }

  getMatiereList() {
    this.referentielResource.getResourceList('matiere').subscribe({
      next: (data: any) => {
        this.matiereList = data;
      }
    });
  }

  getSelectedMatiereName(): string {
    const matiereId = this.coefficientFormGroup.get('matiere')?.value;
    const matiere = this.matiereList.find(m => Number(m.id) === Number(matiereId));
    return matiere?.libelle || '';
  }


  getCoefficient(coeffId: number) {
    this.referentielResource.recupererUneResource('coefficientmatiereclasse', coeffId).subscribe({
      next: (data) => {
        this.coefficent = data;
        this.initializeForm(this.coefficent);
      }
    });
  }


  initializeForm(coeff: CoefficientMatiereClasse | null) {
    this.coefficientFormGroup = this._formBuilder.group({
      id: [coeff?.id || null],
      niveau: [coeff?.niveau || null, Validators.required],
      serie: [coeff?.serie || null],
      matiere: [coeff?.matiere || null, Validators.required],
      coefficient: [coeff?.coefficient ?? '', Validators.required],
    });
  }


  ajouteditCoefficient() {
    const payload = this.coefficientFormGroup.value;
    if (!this.isEdit) {
      this.referentielResource.creerUneRessource('coefficientmatiereclasse', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le coéfficient de cette matière a été enregistrées avec succès !!! ');
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
      this.referentielResource.modifierUneRessource('coefficientmatiereclasse', this.coeffId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le coéfficient a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/coefficients'])
  }


}
