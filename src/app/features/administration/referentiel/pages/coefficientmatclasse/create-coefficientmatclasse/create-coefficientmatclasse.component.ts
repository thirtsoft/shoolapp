import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { ToastrService } from 'ngx-toastr';
import { CoefficientMatiereClasse } from '../../../../../../core/models/referentiels/coefficient-matiere-classe';

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

  classList: ListeClasse[] = [];
  matiereList: Matiere[] = [];

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
    this.getClassList();
    this.getMatiereList();
    this.initializeForm(null);
    if (this.coeffId != null && this.coeffId != undefined) {
      this.getCoefficient(this.coeffId);
      this.title = 'Modifier un coefficient';
      this.isEdit = true;
    }
  }

  getClassList() {
    this.referentielResource.getResourceList('classe').subscribe({
      next: (data: any) => {
        this.classList = data;
      }
    });
  }

  getSelectedClasseName(): string {
    const classeId = this.coefficientFormGroup.get('classe')?.value;
    const classe = this.classList.find(c => Number(c.id) === Number(classeId));
    return classe?.libelle || '';
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
      id: [coeff?.id ? coeff.id : ''],
      classe: [coeff?.classe ? coeff.classe : '', Validators.required],
      matiere: [coeff?.matiere ? coeff.matiere : '', Validators.required],
      coefficient: [coeff?.coefficient ? coeff.coefficient : '', Validators.required],
    });
  }


  ajouteditCoefficient() {
    const payload = this.coefficientFormGroup.value;
    if (!this.isEdit) {
      this.referentielResource.creerUneRessource('coefficientmatiereclasse', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le tarif a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/coefficient'])
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
            this.toastService.success('succès', 'Le tarif a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/coefficient'])
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
    this.router.navigate(['admin/referentiels/coefficient'])
  }


}
