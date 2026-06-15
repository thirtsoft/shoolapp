import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Evaluation } from '../../../../../core/models/dossiereleve/evaluation/evaluation';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-create-evaluation-enseignant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-evaluation-enseignant.component.html',
  styleUrls: ['./create-evaluation-enseignant.component.css']
})
export class CreateEvaluationEnseignantComponent implements OnInit {

  errorMessage?: string;
  evaluationFormGroup!: FormGroup;
  evaluation: any;
  isEdit: boolean = false;
  enseignementList: ListeEnseignement[] = [];
  typeEvaluations: string[] = ['DEVOIR'];
  modeEvaluations: string[] = ['NORMAL', 'RATTRAPAGE'];
  classeList: ListeClasse[] = [];
  classeId?: number;
  sessionSemestreList: SessionSemestre[] = [];

  ecoleId: any;
  utilisateur: Utilisateur = {};

  addEditEvaluation: any;
  userId?: number;

  title = "Ajouter une évaluation";

  disableAddButton = false;


  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly classeContext = inject(EnseignementContextService);


  readonly enseignementIdActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.id;
  });

  constructor(
  ) {
    this.initializeForm(null);
    this.userId = Number(localStorage.getItem('id'));
    effect(() => {
      const activeEnseignementId = this.enseignementIdActive();
      if (activeEnseignementId && !this.isEdit && this.evaluationFormGroup) {
        console.log('Mode création - Enseignement ID appliqué automatiquement :', activeEnseignementId);
        this.evaluationFormGroup.get('enseignementId')?.setValue(activeEnseignementId);
      }
    });
  }


  ngOnInit(): void {
    this.chargerLesDonnees();
  }

  private chargerLesDonnees() {
    this.referentielService.getResourceList('sessionsemestre').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.sessionSemestreList = data;
      }
    });
  }

  initializeForm(evaluation: Evaluation | null) {
    this.evaluationFormGroup = this._formBuilder.group({
      id: [evaluation?.id ?? ''],
      titre: [evaluation?.titre ?? '', Validators.required],
      description: [evaluation?.description ?? ''],
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
      enseignementId: this.evaluationFormGroup.get("enseignementId")!.value,
      sessionSemestre: this.evaluationFormGroup.get("sessionSemestre")!.value,
      dateEvaluation: this.evaluationFormGroup.get("dateEvaluation")!.value,
      evaluationType: this.evaluationFormGroup.get("evaluationType")!.value,
      evaluationMode: this.evaluationFormGroup.get("evaluationMode")!.value,
      heureDebut: this.evaluationFormGroup.get("heureDebut")!.value,
      heureFin: this.evaluationFormGroup.get("heureFin")!.value,
    }
    payload.createur = this.userId;
    payload.ecole = this.ecoleId;
    payload.classeId = this.classeId;
    this.dossierResource.ajouterEditResource('evaluation', payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'L\'évaluation a été enregistrées avec succès !!! ');
          this.router.navigate(['/enseignant/evaluations']);
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
    this.router.navigate(['/enseignant/evaluations'])
  }


}
