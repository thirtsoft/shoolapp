import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { DetailsEnseignantUtilisateur } from '../../../../../core/models/enseignant/details-enseignant-utilisateur';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignantService } from '../../../service/enseignant.service';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Evaluation } from '../../../../../core/models/dossiereleve/evaluation/evaluation';

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
  typeEvaluations: string[] = ['DEVOIR', 'COMPOSITION'];
  modeEvaluations: string[] = ['NORMAL', 'RATTRAPAGE'];


  addEditEvaluation: any;
  userId?: number;

  title = "Ajouter une évaluation";

  disableAddButton = false;

  detailsEnseignant: DetailsEnseignantUtilisateur = {};
  enseignantId?: number;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly enseignantSerivce = inject(EnseignantService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);

  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getEnseignementByUtilisateur(this.userId!);
    this.initializeForm(null);
  }

  getEnseignementByUtilisateur(userId: number) {
    this.enseignantSerivce.getDetailsEnseignantUtilisateur(userId).subscribe({
      next: (data) => {
        this.detailsEnseignant = data;
        this.enseignantId = this.detailsEnseignant?.id;
        this.getEnseignementList(this.enseignantId!);
      },
      error: (err) => (err)
    });
  }


  getEnseignementList(ensId: number) {
    this.planification.getAllEnseignementByEnseignant(ensId).subscribe({
      next: (data) => {
        this.enseignementList = data;
      }
    });
  }

  initializeForm(evaluation: Evaluation | null) {
    this.evaluationFormGroup = this._formBuilder.group({
      id: [evaluation?.id ? evaluation.id : ''],
      titre: [evaluation?.titre ? evaluation.titre : '', Validators.required],
      description: [evaluation?.description ? evaluation.description : '', Validators.required],
      enseignementId: [evaluation?.enseignementId ? evaluation.enseignementId : '', Validators.required],
      dateEvaluation: [evaluation?.dateEvaluation ? evaluation.dateEvaluation : '', Validators.required],
      evaluationType: [evaluation?.evaluationType ? evaluation.evaluationType : '', Validators.required],
      evaluationMode: [evaluation?.evaluationMode ? evaluation.evaluationMode : '', Validators.required],
      heureDebut: [evaluation?.heureDebut ? evaluation.heureDebut : '', Validators.required],
      heureFin: [evaluation?.heureFin ? evaluation.heureFin : '', Validators.required],
    });
  }

  ajouterEditEvaluation() {
    const payload: Evaluation = {
      id: this.evaluationFormGroup.get("id")!.value,
      titre: this.evaluationFormGroup.get("titre")!.value,
      description: this.evaluationFormGroup.get("description")!.value,
      enseignementId: this.evaluationFormGroup.get("enseignementId")!.value,
      dateEvaluation: this.evaluationFormGroup.get("dateEvaluation")!.value,
      evaluationType: this.evaluationFormGroup.get("evaluationType")!.value,
      evaluationMode: this.evaluationFormGroup.get("evaluationMode")!.value,
      heureDebut: this.evaluationFormGroup.get("heureDebut")!.value,
      heureFin: this.evaluationFormGroup.get("heureFin")!.value,
    }
    payload.createur = this.userId;

    this.dossierResource.ajouterEditResource('evaluation', payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'L\'évaluation a été enregistrées avec succès !!! ');
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
  }



  goBack() {
    this.router.navigate(['/enseignant/evaluations'])
  }

}
