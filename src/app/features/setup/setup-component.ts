import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SetupAnneeScolaireRequest } from '../../core/models/setup/request/setup-annee-scolaire-request.model';
import { SetupClasseRequest } from '../../core/models/setup/request/setup-classe-request.model';
import { SetupEtablissementRequest } from '../../core/models/setup/request/setup-etablissement-request.model';
import { SetupMatieresRequest } from '../../core/models/setup/request/setup-matieres-request.model';
import { SetupPeriodeScolaireRequest } from '../../core/models/setup/request/setup-periode-scolaire-request.model';
import { SetupProcessStartRequest } from '../../core/models/setup/request/setup-process-start-request.model';
import { SetupStructurePedagogiqueRequest } from '../../core/models/setup/request/setup-structure-pedagogique-request.model';
import { SetupMode } from '../../core/models/setup/response/setup-mode.model';
import { SetupProcessResponse } from '../../core/models/setup/response/setup-process-response.model';
import { SetupStructurePedagogiqueResponse } from '../../core/models/setup/response/setup-sructure-pedagogique-response.model';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { SessionV2Service } from '../auth/services/multitenantV2/session-v2.service';
import { ClassesAAjouterComponent, StructurePedagogiqueSelection } from './components/classes-a-ajouter-component/classes-a-ajouter-component';
import { FinalisationComponent } from './components/finalisation-component/finalisation-component';
import { InformationEcoleComponent } from './components/information-ecole-component/information-ecole-component';
import { InitierAnneeScolaireComponent } from './components/initier-annee-scolaire-component/initier-annee-scolaire-component';
import { MatieresPrepareesComponent } from './components/matieres-preparees-component/matieres-preparees-component';
import { PeriodesScolairesComponent } from './components/periodes-scolaires-component/periodes-scolaires-component';
import { StructurePedagogiqueComponent } from './components/structure-pedagogique-component/structure-pedagogique-component';
import { SetupApiService } from './services/setup-api-service';

interface SetupStep {
  number: number;
  code: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-setup-component',
  standalone: true,
  imports: [ReactiveFormsModule, InformationEcoleComponent,
    InitierAnneeScolaireComponent,
    StructurePedagogiqueComponent,
    ClassesAAjouterComponent,
    PeriodesScolairesComponent,
    MatieresPrepareesComponent,
    FinalisationComponent],
  templateUrl: './setup-component.html',
  styleUrl: './setup-component.css',
})
export class SetupComponent implements OnInit {

  currentStep = signal(1);
  saving = signal(false);
  completed = signal(false);

  organizationUuid!: string;
  tenantUuid!: string;
  setupUuid!: string;
  userUuid?: string;

  structurePedagogique = signal<StructurePedagogiqueSelection | null>(null);

  @ViewChild(InformationEcoleComponent)
  informationEcoleComponent?: InformationEcoleComponent;

  @ViewChild(InitierAnneeScolaireComponent)
  initierAnneeScolaireComponent?: InitierAnneeScolaireComponent;

  @ViewChild(StructurePedagogiqueComponent)
  structurePedagogiqueComponent?: StructurePedagogiqueComponent;

  @ViewChild(ClassesAAjouterComponent)
  classeAAjouterComponent?: ClassesAAjouterComponent;

  @ViewChild(PeriodesScolairesComponent)
  periodesScolairesComponent?: PeriodesScolairesComponent;

  @ViewChild(MatieresPrepareesComponent)
  matieresPrepareesComponent?: MatieresPrepareesComponent;

  private readonly setupApiService = inject(SetupApiService);
  private readonly sessionV2Service = inject(SessionV2Service);
  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);

  constructor() {
    this.tenantUuid = this.sessionV2Service.getTenantUuid()!;
    this.organizationUuid = this.sessionV2Service.getOrganizationUuid()!;
    this.userUuid = this.sessionV2Service.getUser()?.uuid;
  }

  setupDetails!: SetupProcessResponse;

  readonly steps: SetupStep[] = [

    {
      number: 1,
      code: 'ecole',
      label: 'Mon établissement',
      description: 'Les informations essentielles',
      icon: '🏫'
    },

    {
      number: 2,
      code: 'annee',
      label: 'Année scolaire',
      description: 'Préparer votre année',
      icon: '📅'
    },

    {
      number: 3,
      code: 'structure',
      label: 'Cycles & niveaux',
      description: 'Définir votre structure pédagogique',
      icon: '📚'
    },

    {
      number: 4,
      code: 'classes',
      label: 'Classes',
      description: 'Organiser vos classes',
      icon: '🏷️'
    },

    {
      number: 5,
      code: 'periodes',
      label: 'Périodes scolaires',
      description: 'Définir vos périodes d’apprentissage',
      icon: '🗓️'
    },

    {
      number: 6,
      code: 'matieres',
      label: 'Matières',
      description: 'Préparer les matières essentielles',
      icon: '📖'
    },

    {
      number: 7,
      code: 'finalisation',
      label: 'Prêt à démarrer',
      description: 'Vérifier votre configuration',
      icon: '🚀'
    }

  ];

  ngOnInit(): void {
    if (this.tenantUuid && this.organizationUuid && this.userUuid && !this.setupUuid) {
      this.demarrerInitialisationDonnees();
    }
    this.getCurrentSetupProcess();
  }

  get currentStepData(): SetupStep {
    return this.steps[
      this.currentStep() - 1
    ];
  }

  get progress(): number {
    return (
      (this.currentStep() - 1)
      /
      (this.steps.length - 1)
    ) * 100;
  }

  continuer(): void {
    if (this.saving()) {
      return;
    }

    switch (this.currentStep()) {

      case 1:
        this.enregistrerInformationEcole();
        break;

      case 2:
        this.enregistrerAnneeScolaire();
        break;

      case 3:
        this.enregistrerStructurePedagogique();
        break;

      case 4:
        this.enregistrerClasses();
        break;

      case 5:
        this.enregistrerPeriodes();
        break;

      case 6:
        this.enregistrerMatieres();
        break;

      case 7:
        this.afficherDetails();
        break;
    }

  }

  private getCurrentSetupProcess(): void {
    this.setupApiService.getCurrent()
      .subscribe({
        next: (response) => {
          console.log('[SETUP][ÉTAPE 0] API → Enregistrement réussi');
          console.log('[SETUP][ÉTAPE 0] Response :', response);

          this.localStorage.setItem('setup_uuid', response.setupUuid);

          this.setupUuid = this.localStorage.getItem('setup_uuid');

        },

        error: (error) => {
          console.error('[SETUP][ÉTAPE 0] Erreur API :', error);
        }

      });
  }


  private demarrerInitialisationDonnees(): void {
    if (!this.tenantUuid) {
      console.error('[SETUP][ÉTAPE 0] tenantUuid introuvable');
      return;
    }
    if (!this.organizationUuid) {
      console.error('[SETUP][ÉTAPE 0] organizationUuid introuvable');
      return;
    }
    if (!this.userUuid) {
      console.error('[SETUP][ÉTAPE 0] userUuid introuvable');
      return;
    }

    const payload: SetupProcessStartRequest = {
      setupMode: SetupMode.INITIALISATION,
      tenantUuid: this.tenantUuid,
      organizationUuid: this.organizationUuid,
      userUuid: this.userUuid,
    };
    console.log('[SETUP][ÉTAPE 0] PATCH /api/setup' + this.setupUuid + '/start');
    console.log('[SETUP][ÉTAPE 0] Payload JSON :', JSON.stringify(payload, null, 2));

    this.setupApiService.startSetup(payload)
      .subscribe({
        next: (response) => {
          console.log('[SETUP][ÉTAPE 0] API → Enregistrement réussi');
          console.log('[SETUP][ÉTAPE 0] Response :', response);

          this.localStorage.setItem('setup_uuid', response.setupUuid);

          this.setupUuid = this.localStorage.getItem('setup_uuid');

        },

        error: (error) => {
          console.error('[SETUP][ÉTAPE 0] Erreur API :', error);
        }

      });
  }

  private enregistrerInformationEcole(): void {

    console.log('SetupUUID est {} ', this.setupUuid);

    const component = this.informationEcoleComponent;

    if (!component) {

      console.error('[SETUP][ÉTAPE 1] Formulaire établissement introuvable');

      return;
    }

    const form = component.form;

    if (form.invalid) {

      form.markAllAsTouched();

      console.warn('[SETUP][ÉTAPE 1] Formulaire invalide');
      return;
    }
    if (!this.setupUuid) {
      console.error('[SETUP][ÉTAPE 1] setupUuid introuvable');
      return;
    }

    this.saving.set(true);

    const formValue = form.getRawValue();

    const payload: SetupEtablissementRequest = {
      code: formValue.code,
      libelle: formValue.libelle,
      sigle: formValue.sigle ?? '',
      adresse: formValue.adresse,
      boitePostale: formValue.boitePostale ?? '',
      telephone: formValue.telephone,
      mobile: formValue.mobile,
      email: formValue.email,
      siteWeb: formValue.siteWeb ?? '',
      logoFileUuid: formValue.logoFileUuid ?? '',
      description: formValue.description ?? '',
      schoolType: formValue.schoolType,
      anneeCreation: formValue.anneeCreation
    };

    console.log('[SETUP][ÉTAPE 1] PATCH /api/setup/' + this.setupUuid + '/etablissement');
    console.log('[SETUP][ÉTAPE 1] Payload JSON :', JSON.stringify(payload, null, 2));

    this.setupApiService.editerEtablissement(
      this.setupUuid,
      payload
    )
      .subscribe({ 

        next: (response) => {

          console.log('[SETUP][ÉTAPE 1] API → Enregistrement réussi');
          console.log('[SETUP][ÉTAPE 1] Response :', response);

          this.saving.set(false);

          this.currentStep.update(step => step + 1);

        },

        error: (error) => {

          console.error('[SETUP][ÉTAPE 1] Erreur API :', error);
          this.saving.set(false);

        }

      });

  }

  private enregistrerAnneeScolaire(): void {
    const component = this.initierAnneeScolaireComponent;
    if (!component) {
      console.error('[SETUP][ÉTAPE 2] Formulaire année scolaire introuvable');
      return;
    }

    const form = component.form;

    if (form.invalid) {

      form.markAllAsTouched();

      console.warn('[SETUP][ÉTAPE 2] Formulaire invalide');
      return;
    }

    if (!this.setupUuid) {
      console.error('[SETUP][ÉTAPE 2] setupUuid introuvable');
      return;
    }

    this.saving.set(true);

    const formValue = form.getRawValue();

    const payload: SetupAnneeScolaireRequest = {
      id: formValue.id ?? null,
      tenantUuid: this.tenantUuid!,
      organizationUuid: this.organizationUuid!,
      libelle: formValue.libelle,
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin ?? null
    };

    console.log('[SETUP][ÉTAPE 2] POST /api/setup/' + this.setupUuid + '/annee-scolaire');
    console.log('[SETUP][ÉTAPE 2] Payload JSON :', JSON.stringify(payload, null, 2));

    this.setupApiService.enregistrerAnneeScolaire(
      this.setupUuid,
      payload
    )
      .subscribe({

        next: (response) => {

          console.log('[SETUP][ÉTAPE 2] API → Enregistrement réussi');
          console.log('[SETUP][ÉTAPE 2] Response :', response);

          this.saving.set(false);
          this.currentStep.update(step => step + 1);

        },

        error: (error) => {
          console.error('[SETUP][ÉTAPE 2] Erreur API :', error);
          this.saving.set(false);

        }
      });
  }

  private enregistrerStructurePedagogique(): void {

    const component = this.structurePedagogiqueComponent;

    if (!component) {
      console.error('[SETUP][ÉTAPE 3] Composant structure pédagogique introuvable');
      return;
    }

    if (!component.hasSelection) {
      console.warn('[SETUP][ÉTAPE 3] Aucun niveau sélectionné');
      return;
    }

    if (!this.setupUuid) {
      console.error('[SETUP][ÉTAPE 3] setupUuid introuvable');
      return;
    }

    const payload: SetupStructurePedagogiqueRequest = component.getStructurePedagogiqueRequest();

    console.log('[SETUP][ÉTAPE 3] POST /api/setup/' + this.setupUuid + '/structure-pedagogique');

    console.log('[SETUP][ÉTAPE 3] Payload JSON :', JSON.stringify(payload, null, 2));

    this.saving.set(true);

    this.setupApiService.enregistrerStructurePedagogique(
      this.setupUuid,
      payload
    )
      .subscribe({

        next: (response) => {

          console.log('[SETUP][ÉTAPE 3] API → Enregistrement réussi');

          console.log('[SETUP][ÉTAPE 3] Response :', response);

          const structureResponse: SetupStructurePedagogiqueResponse = response.structurePedagogique;

          if (!structureResponse) {

            console.error('[SETUP][ÉTAPE 3] Structure pédagogique absente de la réponse');

            this.saving.set(false);
            return;
          }

          const structure: StructurePedagogiqueSelection = {
            cycles: structureResponse.cycles.map(cycle => ({
              id: cycle.cycleId,
              libelle: cycle.libelle,

              niveaux: cycle.niveaux.map(niveau => ({
                id: niveau.niveauId,
                libelle: niveau.libelle,
                selected: true,
              })),
            })),
          };

          this.structurePedagogique.set(structure);

          this.saving.set(false);

          this.currentStep.update(
            step => step + 1
          );
        },

        error: (error) => {
          console.error('[SETUP][ÉTAPE 3] Erreur API :', error);

          this.saving.set(false);
        }
      });
  }

  private enregistrerClasses(): void {

    const component = this.classeAAjouterComponent;

    if (!component) {
      console.error('[SETUP][ÉTAPE 4] Composant classes introuvable');
      return;
    }

    if (!component.hasSelection) {
      console.warn('[SETUP][ÉTAPE 4] Aucune classe sélectionnée');
      return;
    }

    if (!this.setupUuid) {
      console.error('[SETUP][ÉTAPE 4] setupUuid introuvable');
      return;
    }

    const payload: SetupClasseRequest = component.getClassesRequest();

    console.log('[SETUP][ÉTAPE 4] POST /api/setup/' + this.setupUuid + '/classes');

    console.log('[SETUP][ÉTAPE 4] Payload JSON :');

    console.log(JSON.stringify(payload, null, 2));

    this.saving.set(true);

    this.setupApiService.enregistrerClasses(
      this.setupUuid,
      payload
    )
      .subscribe({

        next: (response) => {

          console.log('[SETUP][ÉTAPE 4] API → Enregistrement réussi');
          console.log('[SETUP][ÉTAPE 4] Response :', response);

          this.saving.set(false);
          this.currentStep.update(step => step + 1);

        },

        error: (error) => {
          console.error('[SETUP][ÉTAPE 4] Erreur API :', error);
          this.saving.set(false);

        }

      });
  }

  private enregistrerPeriodes(): void {

    const component = this.periodesScolairesComponent;

    if (!component) {
      console.error('[SETUP][ÉTAPE 5] Composant périodes scolaires introuvable');
      return;
    }

    if (!component.hasSelection) {
      console.warn('[SETUP][ÉTAPE 5] Aucune périodicité sélectionnée');
      return;
    }

    if (!this.setupUuid) {

      console.error('[SETUP][ÉTAPE 5] setupUuid introuvable');

      return;
    }

    const payload: SetupPeriodeScolaireRequest = component.getPeriodiciteRequest();

    console.log('[SETUP][ÉTAPE 5] POST /api/setup/' + this.setupUuid + '/periodicite');

    console.log('[SETUP][ÉTAPE 5] Payload JSON :');

    console.log(JSON.stringify(payload, null, 2));

    this.saving.set(true);

    this.setupApiService.enregistrerPeriodes(
      this.setupUuid,
      payload
    )
      .subscribe({

        next: (response) => {

          console.log('[SETUP][ÉTAPE 5] API → Enregistrement réussi');

          console.log('[SETUP][ÉTAPE 5] Response :', response);

          this.saving.set(false);
          this.currentStep.update(step => step + 1);
        },

        error: (error) => {
          console.error('[SETUP][ÉTAPE 5] Erreur API :', error);
          this.saving.set(false);
        }

      });
  }

  private enregistrerMatieres(): void {

    const component = this.matieresPrepareesComponent;

    if (!component) {
      console.error('[SETUP][ÉTAPE 6] Composant matières introuvable');
      return;
    }

    if (!component.hasSelection) {
      console.warn('[SETUP][ÉTAPE 6] Aucune matière sélectionnée');
      return;
    }

    if (!this.setupUuid) {
      console.error('[SETUP][ÉTAPE 6] setupUuid introuvable');
      return;
    }

    const payload: SetupMatieresRequest = component.getMatieresRequest();

    console.log('[SETUP][ÉTAPE 6] POST /api/setup/' + this.setupUuid + '/matieres');
    console.log('[SETUP][ÉTAPE 6] Payload JSON :');
    console.log(JSON.stringify(payload, null, 2));

    this.saving.set(true);

    this.setupApiService.enregistrerMatieres(
      this.setupUuid,
      payload
    )
      .subscribe({

        next: (response) => {

          console.log('[SETUP][ÉTAPE 6] API → Création des matières réussie');
          console.log('[SETUP][ÉTAPE 6] Response :', response);

          this.finaliserSetup();
        },

        error: (error) => {

          console.error('[SETUP][ÉTAPE 6] Erreur API :', error);

          this.saving.set(false);
        }
      });
  }

  private finaliserSetup(): void {

    if (!this.setupUuid) {
      console.error('[SETUP][FINALISATION] setupUuid introuvable');
      this.saving.set(false);
      return;
    }

    console.log('[SETUP][FINALISATION] POST /api/setup/' + this.setupUuid + '/finaliser');

    this.setupApiService.finaliser(this.setupUuid)
      .subscribe({

        next: (response) => {

          console.log('[SETUP][FINALISATION] API → Finalisation réussie');

          console.log('[SETUP][FINALISATION] Response :', response);

          this.saving.set(false);

          this.completed.set(true);

          this.currentStep.set(7);
        },

        error: (error) => {

          console.error('[SETUP][FINALISATION] Erreur API :', error);

          this.saving.set(false);
        }
      });
  }

  private afficherDetails(): void {

    if (!this.setupUuid) {
      console.error('[SETUP][DÉTAILS] setupUuid introuvable');
      return;
    }

    this.saving.set(true);

    console.log('[SETUP][DÉTAILS] GET /api/setup/' + this.setupUuid + '/details');

    this.setupApiService.afficherSetupProcess(this.setupUuid)
      .subscribe({

        next: (response: SetupProcessResponse) => {

          console.log('[SETUP][DÉTAILS] API → Récupération réussie');

          console.log('[SETUP][DÉTAILS] Response :', response);

          this.setupDetails = response;

          this.saving.set(false);
        },

        error: (error) => {

          console.error('[SETUP][DÉTAILS] Erreur API :', error);

          this.saving.set(false);
        }
      });
  }

  retour(): void {
    if (this.saving()) {
      return;
    }
    if (this.currentStep() > 1) {
      this.currentStep.update(
        step => step - 1
      );
    }
  }

  allerA(step: number): void {
    if (this.saving()) {
      return;
    }

    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }

  }

  terminer(): void {
    console.log('[SETUP] Configuration terminée');
    this.completed.set(true);
    this.router.navigate(['/admin'])
  }

}