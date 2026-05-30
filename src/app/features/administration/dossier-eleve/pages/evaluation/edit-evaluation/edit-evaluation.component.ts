import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EvaluationEditRequest } from '../../../../../../core/models/dossiereleve/evaluation/evaluation-edit-resquest';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { Enseignement } from '../../../../../../core/models/planification/enseignement';
import { ListeEnseignement } from '../../../../../../core/models/planification/liste-enseignement';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-edit-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './edit-evaluation.component.html',
  styleUrls: ['./edit-evaluation.component.css']
})
export class EditEvaluationComponent implements OnInit {

  errorMessage?: string;
  evaluationId!: number;
  evaluationFormGroup!: FormGroup;
  evaluation: any;
  isEdit: boolean = false;
  enseignementList: ListeEnseignement[] = [];
  typeEvaluations: string[] = ['DEVOIR', 'COMPOSITION'];
  modeEvaluations: string[] = ['NORMAL', 'RATTRAPAGE'];

  addEditEvaluation: EvaluationEditRequest = {};
  isEditMode = false;
  title = "Modifier une évaluation";

  disableAddButton = false;

  elevesList?: ListeEleve[] = [];
  enseignement?: Enseignement = {};
  userId?: number;
  ecoleId: any;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  ngOnInit(): void {
    this.evaluationId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
    this.initialiserFormGroup();
    this.getEnseignementList();
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getEvaluationByID(this.evaluationId);
      this.title = 'Modifier les notes de l\'évaluation';
      this.isEdit = true;
    }
  }

  initialiserFormGroup() {
    this.evaluationFormGroup = this._formBuilder.group({
      id: [''],
      titre: ['', Validators.required],
      description: [''],
      enseignementId: ['', Validators.required],
      dateEvaluation: ['', Validators.required],
      evaluationType: ['', Validators.required],
      evaluationMode: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      noteEditRequestDTOList: this._formBuilder.array([])
    });
  }

  getEnseignementList() {
    this.planification.getAllEnseignement().subscribe({
      next: (data: any) => {
        this.enseignementList = data;
      }
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
        console.log('Liste des élèves chargée:', this.elevesList);
      },
      error: (error) => {
        console.error('Erreur chargement élèves:', error);
      }
    });
  }

  getEleveNomCompletEleve(id: number): string {
    const eleve = this.elevesList!.find(e => e.id === id);
    return eleve ? eleve.prenom + " " + eleve.nom : 'Élève inconnu';
  }

  getEvaluationByID(evaluationId: number) {
    this.dossierResource.getSingleResource('evaluation', evaluationId).subscribe({
      next: (data: any) => {
        this.addEditEvaluation = data;
        console.log('Details eval', this.addEditEvaluation);
        this.ecoleId = this.addEditEvaluation.ecole;

        if (this.addEditEvaluation?.enseignementId) {
          this.getEnseignement(this.addEditEvaluation.enseignementId);
        }

        this.evaluationFormGroup = this._formBuilder.group({
          id: [this.addEditEvaluation?.id ? this.addEditEvaluation.id : ''],
          titre: [this.addEditEvaluation?.titre ? this.addEditEvaluation.titre : '', Validators.required],
          description: [this.addEditEvaluation?.description ? this.addEditEvaluation.description : ''],
          enseignementId: [this.addEditEvaluation?.enseignementId ? this.addEditEvaluation.enseignementId : '', Validators.required],
          dateEvaluation: [this.addEditEvaluation?.dateEvaluation ? this.addEditEvaluation.dateEvaluation : '', Validators.required],
          evaluationType: [this.addEditEvaluation?.evaluationType ? this.addEditEvaluation.evaluationType : '', Validators.required],
          evaluationMode: [this.addEditEvaluation?.evaluationMode ? this.addEditEvaluation.evaluationMode : '', Validators.required],
          heureDebut: [this.addEditEvaluation?.heureDebut ? this.addEditEvaluation.heureDebut : '', Validators.required],
          heureFin: [this.addEditEvaluation?.heureFin ? this.addEditEvaluation.heureFin : '', Validators.required],
          noteEditRequestDTOList: this._formBuilder.array([])
        });
        this.addEditEvaluation?.noteEditRequestDTOList!.forEach((n: any) => {
          this.notes.push(this._formBuilder.group({
            id: [n.id],
            eleve: [n.eleve, Validators.required],
            note: [n.note],
            type: [n.type],
            dateCreation: [n.dateCreation],
            appreciation: [n.appreciation]
          }));
        });
        //     this.getEnseignement(this.addEditEvaluation?.enseignementId);
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  get notes(): FormArray {
    return this.evaluationFormGroup?.get('noteEditRequestDTOList') as FormArray;
  }

  ajouterEditEvaluation() {
    if (this.evaluationFormGroup!.invalid) {
      this.evaluationFormGroup!.markAllAsTouched();
      return;
    }

    const payload = this.evaluationFormGroup!.value;
    payload.createur = this.userId;
    payload.etatId = this.addEditEvaluation.etatId;
    payload.dateCreation = this.addEditEvaluation.dateCreation;
    payload.dateRemise = this.addEditEvaluation.dateRemise;
    payload.ecole = this.ecoleId;

    console.log(payload);

    this.dossierResource.updateUneReource('evaluation', payload.id, payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'L\'évaluation a été modifiées avec succès !!! ');
          this.router.navigate(['/admin/dossier-eleve/evaluations']);
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
    window.history.back();
  }

}
