import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SemestreRequest } from '../../../../../../core/models/referentiels/semestre';
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

  title = "Ajouter un semestre";

  typePeriodicites: string[] = ['SEMESTRE', 'TRIMESTRE'];

  private readonly referentielService = inject(ReferentielService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.semestreId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.initializeForm(null);
    if (this.semestreId != null && this.semestreId != undefined) {
      this.getSemestre(this.semestreId);
      this.title = 'Modifier un semestre';
      this.isEdit = true;
    }
  }

  getSemestre(semestreId: number) {
    this.referentielService.getSemestreById(semestreId).subscribe({
      next: (data) => {
        this.semestre = data;
        this.initializeForm(this.semestre);
      }
    });
  }

  initializeForm(semestre: SemestreRequest | null) {
    this.semestreFormGroup = this._formBuilder.group({
      id: [semestre?.id ? semestre.id : ''],
      numero: [semestre?.numero ? semestre.numero : '', Validators.required],
      libelle: [semestre?.libelle ? semestre.libelle : '', Validators.required],
      typePeriode: [semestre?.typePeriode ? semestre.typePeriode : '', Validators.required],
    });
  }


  ajouteditSemestre() {
    const payload = this.semestreFormGroup.value;
    if (!this.isEdit) {
      this.referentielService.createSemestre(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le semestre a été enregistrées avec succès !!! ');
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
      this.referentielService.updateSemestre(this.semestreId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le semestre a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/semestres'])
  }

}
