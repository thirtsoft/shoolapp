import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { AbsenceEdit } from '../../../../../core/models/dossiereleve/absence/absenceedit';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { Semestre } from '../../../../../core/models/referentiels/semestre';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';

@Component({
  selector: 'app-ajout-absence-eleve',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-absence-eleve.component.html',
  styleUrls: ['./ajout-absence-eleve.component.css']
})
export class AjoutAbsenceEleveComponent implements OnInit {

  errorMessage?: string;
  absenceFormGroup!: FormGroup;
  absence?: any;
  absenceId: number;
  eleveId: number;
  userId: number;
  anneeScolaireList: AnneeScolaire[] = [];
  semestreList: Semestre[] = [];

  title = "Déclarer une absence";

  private readonly referentielService = inject(ReferentielService);
  private readonly coursService = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.absenceId = this.activeRoute.snapshot.params['id'];
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
  }

  ngOnInit(): void {
    this.getAnneeSclaireList();
    this.getSemestresList();
    this.initializeForm(null);
    if (this.absenceId != null && this.absenceId != undefined) {
      this.getAbsenceById(this.absenceId);
      this.title = 'Modifier la déclaration absence';
    }
  }

  getSemestresList() {
    this.referentielService.getAllSemestres().subscribe(
      (data: any[]) => {
        this.semestreList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  getAnneeSclaireList() {
    this.referentielService.getAllAnneeScolaires().subscribe(
      (data: any[]) => {
        this.anneeScolaireList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  initializeForm(absence: AbsenceEdit | null) {
    this.absenceFormGroup = this._formBuilder.group({
      id: [absence?.id ? absence.id : ''],
      semestre: [absence?.semestre ? absence.semestre : '', Validators.required],
      anneeScolaireId: [absence?.anneeScolaireId ? absence.anneeScolaireId : '', Validators.required],
      motif: [absence?.motif ? absence.motif : '', Validators.required],
      date_declaration: [absence?.date_declaration ? absence.date_declaration : '', Validators.required],
    });
  }

  getAbsenceById(absenceId: number) {
    this.coursService.getSingleResource('absence', absenceId).subscribe({
      next: (data) => {
        this.absence = data;
        this.initializeForm(this.absence);
      }
    });
  }

  ajouterEditAbsence() {
    const payload: AbsenceEdit = this.absenceFormGroup.value;
    payload.createur = this.userId;
    payload.eleveId = this.eleveId;
    console.log('Ajout edit note {}', payload);
    if (this.absenceId === null || this.absenceId === undefined) {
      this.coursService.createRessource('absence', payload).subscribe({
        next: (data) => {
          this.toastService.success('success', 'Absence déclarée avec succès.');
          this.router.navigate(['/parent/absence']);
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.coursService.updateResource('absence', this.absenceId, payload).subscribe({
        next: data => {
          this.toastService.success('success', 'Absence modifiée avec succès.');
          this.router.navigate(['/parent/absence']);

        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }

  }


}
