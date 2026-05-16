import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Evaluation } from '../../../../../../core/models/dossiereleve/evaluation/evaluation';
import { ListeEnseignement } from '../../../../../../core/models/planification/liste-enseignement';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
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

  ecoleId: any;
  utilisateur: Utilisateur = {};

  addEditEvaluation: any;
  userId?: number;

  title = "Ajouter une évaluation";

  disableAddButton = false;


  private readonly dossierResource = inject(DossierResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);


  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id'));
    this.getConnectedUserInfos();
    this.getEnseignementList();
    this.initializeForm(null);
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId!).subscribe({
      next: data => {
        this.utilisateur = data;
        //    this.ecoleId = this.utilisateur.ecoleId;
      },
      error: error => { console.log(error) },
    });

  }

  getEnseignementList() {
    this.planification.getAllEnseignement().subscribe({
      next: (data: any) => {
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
    payload.ecole = this.ecoleId;
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
