import { Component, computed, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EvaluationEditRequest } from '../../../../../core/models/dossiereleve/evaluation/evaluation-edit-resquest';
import { ListeEleve } from '../../../../../core/models/dossiereleve/liste-eleve';
import { Enseignement } from '../../../../../core/models/planification/enseignement';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-edit-evaluation-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './edit-evaluation-enseignant.component.html',
  styleUrls: ['./edit-evaluation-enseignant.component.css']
})
export class EditEvaluationEnseignantComponent implements OnInit {

  errorMessage?: string;
  evaluationId!: number;
  evaluationFormGroup!: FormGroup;
  evaluation: any;
  isEdit: boolean = false;
  enseignementList: ListeEnseignement[] = [];
  typeEvaluations: string[] = ['DEVOIR'];
  modeEvaluations: string[] = ['NORMAL', 'RATTRAPAGE'];
  sessionSemestreList: SessionSemestre[] = [];
  addEditEvaluation: EvaluationEditRequest = {};
  isEditMode = false;
  title = "Modifier une évaluation";

  disableAddButton = false;
  elevesList?: ListeEleve[] = [];
  enseignement?: Enseignement = {};
  classeList: ListeClasse[] = [];
  userId?: number;
  ecoleId: any;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly classeContext = inject(EnseignementContextService);


  readonly enseignementIdActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.id;
  });

  constructor() {
    this.initialiserFormGroup();
    this.evaluationId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));

    effect(() => {
      const activeEnseignementId = this.enseignementIdActive();
      if (activeEnseignementId && !this.isEdit && this.evaluationFormGroup) {
        console.log('Mode création - Enseignement ID appliqué automatiquement :', activeEnseignementId);
        this.evaluationFormGroup.get('enseignementId')?.setValue(activeEnseignementId);
        this.getEnseignement(Number(activeEnseignementId));
      }
    });
  }


  ngOnInit(): void {
    this.chargerLesDonnees();
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getEvaluationByID(this.evaluationId);
      this.title = 'Modifier les notes de l\'évaluation';
      this.isEdit = true;
    } else {
      const currentId = this.enseignementIdActive();
      if (currentId) {
        this.evaluationFormGroup.get('enseignementId')?.setValue(currentId);
      }
    }
  }

  private chargerLesDonnees() {
    this.referentielService.getResourceList('sessionsemestre').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.sessionSemestreList = data;
      }
    });
  }


  initialiserFormGroup() {
    this.evaluationFormGroup = this._formBuilder.group({
      id: [''],
      titre: ['', Validators.required],
      description: [''],
      enseignementId: ['', Validators.required],
      sessionSemestre: ['', Validators.required],
      dateEvaluation: ['', Validators.required],
      evaluationType: ['', Validators.required],
      evaluationMode: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      noteEditRequestDTOList: this._formBuilder.array([])
    });
  }

  getEnseignement(enseignementId?: number) {
    this.planification.getSingleResource('planification/enseignement', enseignementId!).subscribe({
      next: (data: any) => {
        this.enseignement = data;
        this.getEleveListByClassAndAnneeScolaire(this.enseignement?.classe!, this.enseignement?.anneeScolaire!)
      }
    });
  }

  getEleveListByClassAndAnneeScolaire(classId: number, anneeId: number) {
    this.dossierResource.afficherListeEleveParClassEtAnneeScolaire('eleve', classId, anneeId).subscribe({
      next: (data: any) => {
        this.elevesList = data;
      },
      error: (error) => {
        console.error('Erreur chargement élèves:', error);
      }
    });
  }

  getEleveNomCompletEleve(id: number): string {
    const eleve = this.elevesList?.find(e => e.id === id);
    return eleve ? eleve.prenom + " " + eleve.nom : 'Élève inconnu';
  }

  getEvaluationByID(evaluationId: number) {
    this.dossierResource.getSingleResource('evaluation', evaluationId).subscribe({
      next: (data: any) => {
        this.addEditEvaluation = data;
        this.ecoleId = this.addEditEvaluation.ecole;

        this.evaluationFormGroup = this._formBuilder.group({
          id: [this.addEditEvaluation?.id ?? ''],
          titre: [this.addEditEvaluation?.titre ?? '', Validators.required],
          description: [this.addEditEvaluation?.description ?? ''],
          classeId: [this.addEditEvaluation?.classeId ?? '', Validators.required],
          enseignementId: [this.addEditEvaluation?.enseignementId ?? '', Validators.required],
          sessionSemestre: [this.addEditEvaluation?.sessionSemestre ?? '', Validators.required],
          dateEvaluation: [this.addEditEvaluation?.dateEvaluation ?? '', Validators.required],
          evaluationType: [this.addEditEvaluation?.evaluationType ?? '', Validators.required],
          evaluationMode: [this.addEditEvaluation?.evaluationMode ?? '', Validators.required],
          heureDebut: [this.addEditEvaluation?.heureDebut ?? '', Validators.required],
          heureFin: [this.addEditEvaluation?.heureFin ?? '', Validators.required],
          noteEditRequestDTOList: this._formBuilder.array([])
        });

        this.addEditEvaluation?.noteEditRequestDTOList?.forEach((n: any) => {
          this.notes.push(this._formBuilder.group({
            id: [n.id],
            eleve: [n.eleve, Validators.required],
            note: [n.note],
            type: [n.type],
            dateCreation: [n.dateCreation],
            appreciation: [n.appreciation]
          }));
        });
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  get notes(): FormArray {
    const formArray = this.evaluationFormGroup?.get('noteEditRequestDTOList');
    return (formArray as FormArray) ?? this._formBuilder.array([]);
  }

  ajouterEditEvaluation() {
    if (this.evaluationFormGroup?.invalid) {
      this.evaluationFormGroup?.markAllAsTouched();
      return;
    }

    const payload = this.evaluationFormGroup?.value;
    payload.createur = this.userId;
    payload.etatId = this.addEditEvaluation.etatId;
    payload.dateCreation = this.addEditEvaluation.dateCreation;
    payload.dateRemise = this.addEditEvaluation.dateRemise;
    payload.ecole = this.ecoleId;

    this.dossierResource.updateUneReource('evaluation', payload.id, payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'L\'évaluation a été modifiées avec succès !!! ');
          this.router.navigate(['/enseignant/evaluations']);
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

  goBack() {
    this.router.navigate(['/enseignant/evaluations'])
  }


}
