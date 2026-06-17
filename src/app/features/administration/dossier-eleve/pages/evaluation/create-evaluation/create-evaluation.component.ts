import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { Evaluation } from '../../../../../../core/models/dossiereleve/evaluation/evaluation';
import { ListeEnseignement } from '../../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-create-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-evaluation.component.html',
  styleUrls: ['./create-evaluation.component.css']
})
export class CreateEvaluationComponent implements OnInit {

  errorMessage?: string;
  evaluationFormGroup!: FormGroup;
  evaluation: any;
  isEdit: boolean = false;
  enseignementList: ListeEnseignement[] = [];
  typeEvaluations: string[] = ['DEVOIR', 'COMPOSITION'];
  modeEvaluations: string[] = ['NORMAL', 'RATTRAPAGE'];
  classeList: ListeClasse[] = [];
  sessionSemestreList: SessionSemestre[] = [];


  ecoleId: any;
  utilisateur: Utilisateur = {};

  addEditEvaluation: any;
  userId?: number;

  title = "Ajouter une évaluation";

  disableAddButton = false;


  private readonly dossierResource = inject(DossierResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);


  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id'));
    this.chargerLesDonnees();
    this.initializeForm(null);
  }

  private chargerLesDonnees() {
    this.utilisateurService.getUtilisateur(this.userId!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.utilisateur = data
    });

    this.referentielService.getResourceList('sessionsemestre').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.sessionSemestreList = data;
      }
    });

    this.referentielService.getResourceList('classe').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.classeList = data
    });
  }

  onClasseSelected() {
    const classeId = this.evaluationFormGroup.get('classeId')?.value;
    if (classeId) {
      this.getEnseignementByClass(classeId);
    }
  }

  private getEnseignementByClass(classId: number) {
    this.planification.getAllEnseignementByclasse(classId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.enseignementList = data;
      }
    });
  }

  initializeForm(evaluation: Evaluation | null) {
    this.evaluationFormGroup = this._formBuilder.group({
      id: [evaluation?.id ?? ''],
      titre: [evaluation?.titre ?? '', Validators.required],
      description: [evaluation?.description ?? ''],
      classeId: [evaluation?.classeId ?? '', Validators.required],
      enseignementId: [evaluation?.enseignementId ?? '', Validators.required],
      sessionSemestre: [evaluation?.sessionSemestre ?? '', Validators.required],
      dateEvaluation: [evaluation?.dateEvaluation ?? '', Validators.required],
      evaluationType: [evaluation?.evaluationType ?? '', Validators.required],
      evaluationMode: [evaluation?.evaluationMode ?? '', Validators.required],
      heureDebut: [evaluation?.heureDebut ?? '', Validators.required],
      heureFin: [evaluation?.heureFin ?? '', Validators.required],
    });
  }

  ajouterEditEvaluation() {
    const payload: Evaluation = {
      id: this.evaluationFormGroup.get("id")!.value,
      titre: this.evaluationFormGroup.get("titre")!.value,
      description: this.evaluationFormGroup.get("description")!.value,
      enseignementId: Number(this.evaluationFormGroup.get("enseignementId")!.value),
      //  semestre: this.evaluationFormGroup.get("semestre")!.value,
      sessionSemestre: this.evaluationFormGroup.get("sessionSemestre")!.value,
      dateEvaluation: this.evaluationFormGroup.get("dateEvaluation")!.value,
      evaluationType: this.evaluationFormGroup.get("evaluationType")!.value,
      evaluationMode: this.evaluationFormGroup.get("evaluationMode")!.value,
      heureDebut: this.evaluationFormGroup.get("heureDebut")!.value,
      heureFin: this.evaluationFormGroup.get("heureFin")!.value,
    }
    payload.createur = this.userId;
    payload.ecole = this.ecoleId;
    console.log('Log', payload);
    this.dossierResource.ajouterEditResource('evaluation', payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'L\'évaluation a été enregistrées avec succès !!! ');
          this.router.navigate(['/admin/dossier-eleve/evaluations']);
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/dossier-eleve/evaluations'])
  }


}
