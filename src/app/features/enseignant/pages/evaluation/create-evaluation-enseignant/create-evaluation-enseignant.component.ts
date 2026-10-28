import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Evaluation } from '../../../../../core/models/dossiereleve/evaluation/evaluation';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';

import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-create-evaluation-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-evaluation-enseignant.component.html',
  styleUrls: ['./create-evaluation-enseignant.component.css']
})
export class CreateEvaluationEnseignantComponent implements OnInit {

  errorMessage?: string;

  evaluationFormGroup!: FormGroup;

  evaluation: Evaluation | null = null;

  isEdit = false;

  evaluationId: number | null = null;

  enseignementList: ListeEnseignement[] = [];

  typeEvaluations: string[] = ['DEVOIR'];

  modeEvaluations: string[] = ['NORMAL', 'RATTRAPAGE'];

  sessionSemestreList: SessionSemestre[] = [];

  title = 'Ajouter une évaluation';

  disableAddButton = false;

  classeId?: number;
  enseignementActif?: number;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly classeContext = inject(EnseignementContextService);

  constructor() {

    const contexteClasse = this.classeContext.getGestionClasseContext();

    this.classeId = contexteClasse?.classId;

    this.enseignementActif = contexteClasse?.enseignementId;

    console.log('classeId', this.classeId);

    console.log('enseignement active', this.enseignementActif);

    this.initializeForm();

  }

  ngOnInit(): void {
    this.detecterMode();
    this.chargerLesDonnees();

  }

  private detecterMode(): void {
    const evaluationIdParam = this.route.snapshot.paramMap.get('id');
    if (evaluationIdParam) {
      this.evaluationId = Number(evaluationIdParam);
      if (!Number.isNaN(this.evaluationId)) {
        this.isEdit = true;
        this.title = 'Modifier une évaluation';
        this.chargerEvaluation(this.evaluationId);
      }

    } else {

      this.isEdit = false;

      this.title = 'Ajouter une évaluation';

    }
  }

  private chargerLesDonnees(): void {
    this.referentielService
      .getResourceList('sessionsemestre')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.sessionSemestreList = data;
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement des sessions/semestres :',
            error
          );

          this.toastService.error(
            'Erreur',
            'Impossible de charger les sessions/semestres.'
          );
        }

      });
  }

  private initializeForm(): void {
    this.evaluationFormGroup = this.formBuilder.group({
      titre: ['', Validators.required],
      description: [''],
      sessionSemestre: ['', Validators.required],
      dateEvaluation: ['', Validators.required],
      evaluationType: ['', Validators.required],
      evaluationMode: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required]
    });
  }

  private chargerEvaluation(evaluationId: number): void {
    this.disableAddButton = true;
    this.dossierResource.afficherDetailsResource<Evaluation>('evaluation', evaluationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: Evaluation) => {
          this.evaluation = data;
          this.remplirFormulaire(data);
          this.disableAddButton = false;
        },

        error: (error) => {

          console.error('Erreur lors du chargement de l’évaluation :', error);

          this.disableAddButton = false;

          this.toastService.error('Erreur', 'Impossible de charger l’évaluation.');

          this.goBack();
        }

      });
  }

  private remplirFormulaire(evaluation: Evaluation): void {
    this.evaluationFormGroup.patchValue({
      titre: evaluation.titre ?? '',
      description: evaluation.description ?? '',
      enseignementId: evaluation.enseignementId ?? '',
      sessionSemestre: evaluation.sessionSemestre ?? '',
      dateEvaluation: evaluation.dateEvaluation ?? '',
      evaluationType: evaluation.evaluationType ?? '',
      evaluationMode: evaluation.evaluationMode ?? '',
      heureDebut: this.formaterHeure(evaluation.heureDebut),
      heureFin: this.formaterHeure(evaluation.heureFin)
    });
    this.evaluationFormGroup.get('enseignementId')?.disable();
  }
  private formaterHeure(heure: any): string {
    if (!heure) {
      return '';
    }
    const valeur = String(heure);

    if (valeur.length >= 5) {
      return valeur.substring(0, 5);
    }

    return valeur;
  }


  ajouterEditEvaluation(): void {
    if (this.disableAddButton) {
      return;
    }
    if (!this.isEdit && !this.enseignementActif) {
      this.toastService.error(
        'Enseignement introuvable',
        'Impossible d’enregistrer l’évaluation : aucun enseignement n’est associé à la classe sélectionnée.'
      );
      return;
    }
    if (this.evaluationFormGroup.invalid) {
      this.evaluationFormGroup.markAllAsTouched();
      this.toastService.warning(
        'Formulaire incomplet',
        'Veuillez renseigner tous les champs obligatoires.'
      );

      return;
    }

    this.disableAddButton = true;

    if (this.isEdit) {

      this.modifierEvaluation();

    } else {

      this.creerEvaluation();
    }
  }

  private creerEvaluation(): void {
    const payload: any = {
      titre: this.evaluationFormGroup.get('titre')?.value,
      description: this.evaluationFormGroup.get('description')?.value,
      enseignementId: this.enseignementActif,
      sessionSemestre: this.evaluationFormGroup.get('sessionSemestre')?.value,
      dateEvaluation: this.evaluationFormGroup.get('dateEvaluation')?.value,
      evaluationType: this.evaluationFormGroup.get('evaluationType')?.value,
      evaluationMode: this.evaluationFormGroup.get('evaluationMode')?.value,
      heureDebut: this.evaluationFormGroup.get('heureDebut')?.value,
      heureFin: this.evaluationFormGroup.get('heureFin')?.value
    };

    console.log('send payload', payload);

    this.dossierResource.createUneEvaluationRessource('evaluation', payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: any) => {

          this.disableAddButton = false;

          if (data?.statut === 'OK') {

            this.toastService.success(
              'Succès',
              'L’évaluation a été enregistrée avec succès.'
            );

            this.goBack();

          } else {

            this.toastService.error(
              'Erreur',
              data?.message ??
              'Erreur lors de la création de l’évaluation.'
            );
          }
        },

        error: (error) => {

          console.error(
            'Erreur création évaluation :',
            error
          );

          this.disableAddButton = false;

          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Erreur lors de la création de l’évaluation.'
          );
        }

      });
  }

  private modifierEvaluation(): void {
    if (!this.evaluationId) {
      this.disableAddButton = false;
      this.toastService.error('Erreur', 'Identifiant de l’évaluation introuvable.');
      return;
    }

    const payload = {
      titre: this.evaluationFormGroup.get('titre')?.value,
      description: this.evaluationFormGroup.get('description')?.value,
      dateEvaluation: this.evaluationFormGroup.get('dateEvaluation')?.value,
      sessionSemestre: this.evaluationFormGroup.get('sessionSemestre')?.value,
      evaluationType: this.evaluationFormGroup.get('evaluationType')?.value,
      evaluationMode: this.evaluationFormGroup.get('evaluationMode')?.value,
      heureDebut: this.evaluationFormGroup.get('heureDebut')?.value,
      heureFin: this.evaluationFormGroup.get('heureFin')?.value
    };

    this.dossierResource.updateUneReource(`evaluation`, this.evaluationId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: any) => {

          this.disableAddButton = false;

          if (data?.statut === 'OK') {

            this.toastService.success('Succès', 'L’évaluation a été modifiée avec succès.');

            this.goBack();

          } else {

            this.toastService.error(
              'Erreur',
              data?.message ?? 'Erreur lors de la modification de l’évaluation.'
            );
          }
        },

        error: (error) => {

          console.error('Erreur modification évaluation :', error);

          this.disableAddButton = false;

          this.toastService.error(
            'Erreur',
            error?.error?.message ?? 'Erreur lors de la modification de l’évaluation.'
          );
        }

      });
  }

  goBack(): void {
    void this.router.navigate(['/enseignant/gestion-classe', this.classeId]);
  }

}