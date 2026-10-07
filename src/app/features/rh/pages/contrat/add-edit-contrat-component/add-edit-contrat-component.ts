import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContratRequest } from '../../../../../core/models/rh/contrat-request.model';
import { RhResourceService } from '../../../services/rh-resource-service';

interface PersonnelOption {
  uuid: string;
  firstName?: string;
  lastName?: string;
  matricule?: string;
}

interface TypeContratOption {
  uuid: string;
  code?: string;
  libelle?: string;
}

interface ContratResponse {
  uuid: string;
  reference: string;
  personnelUuid: string;
  typeContratUuid: string;
  typeContratCode: string;
  typeContratLibelle: string;
  modeRemuneration: string;
  montantReference: number;
  dateDebut: string;
  dateFin?: string | null;
  statut: string;
  observation?: string | null;
  pieceJointeUuid?: string | null;
  nomFichier?: string | null;
  recordStatus?: string;
}

@Component({
  selector: 'app-add-edit-contrat-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-edit-contrat-component.html',
  styleUrl: './add-edit-contrat-component.css',
})
export class AddEditContratComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contratService = inject(RhResourceService);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;

  mode: 'CREATE' | 'EDIT' = 'CREATE';

  contratUuid: string | null = null;

  loading = signal(false);
  loadingData = signal(false);
  loadingFichier = signal(false);

  personnels = signal<PersonnelOption[]>([]);
  typesContrat = signal<TypeContratOption[]>([]);

  fichier: File | null = null;

  /**
   * UUID du fichier actuellement enregistré.
   */
  fichierExistant = signal<string | null>(null);

  /**
   * Nom du fichier actuellement enregistré.
   */
  fichierExistantNom = signal<string | null>(null);

  readonly maxFileSize = 10 * 1024 * 1024;

  readonly allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  ngOnInit(): void {
    this.initialiserFormulaire();
    this.chargerDonnees();

    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.mode = 'EDIT';
      this.contratUuid = uuid;
      this.chargerContrat(uuid);
    } else {
      this.mode = 'CREATE';

      const personnelUuid =
        this.route.snapshot.queryParamMap.get('personnelUuid');

      if (personnelUuid) {
        this.form.patchValue({ personnelUuid });
      }
    }
  }

  private initialiserFormulaire(): void {
    this.form = this.fb.group({
      reference: ['', [Validators.required, Validators.maxLength(50)]],
      personnelUuid: ['', Validators.required],
      typeContratUuid: ['', Validators.required],
      modeRemuneration: ['MENSUEL', Validators.required],
      montantReference: [
        null,
        [Validators.required, Validators.min(0.01)]
      ],
      dateDebut: ['', Validators.required],
      dateFin: [null],
      statut: ['ACTIF', Validators.required],
      observation: ['', Validators.maxLength(200)]
    });
  }

  private chargerDonnees(): void {
    this.loadingData.set(true);

    this.chargerPersonnels();
    this.chargerTypesContrat();
  }

  private chargerPersonnels(): void {
    this.contratService
      .getResourceList('personnels')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.personnels.set(response);
          this.verifierFinChargement();
        },

        error: error => {
          console.error('Erreur chargement personnels :', error);

          this.toastService.error(
            'Erreur',
            'Impossible de charger la liste des personnels.'
          );

          this.verifierFinChargement();
        }
      });
  }

  private chargerTypesContrat(): void {
    this.contratService
      .getResourceList('types-contrat')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.typesContrat.set(response);
          this.verifierFinChargement();
        },

        error: error => {
          console.error('Erreur chargement type contrat :', error);

          this.toastService.error(
            'Erreur',
            'Impossible de charger la liste des type contrat.'
          );

          this.verifierFinChargement();
        }
      });
  }

  private verifierFinChargement(): void {
    if (
      this.personnels().length > 0 ||
      this.typesContrat().length > 0
    ) {
      this.loadingData.set(false);
    }
  }

  private chargerContrat(uuid: string): void {
    this.loading.set(true);
    this.contratService.getContratByUuid(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contrat: any) => {

          this.form.patchValue({
            reference: contrat.reference,
            personnelUuid: contrat.personnelUuid,
            typeContratUuid: contrat.typeContratUuid,
            modeRemuneration: contrat.modeRemuneration,
            montantReference: contrat.montantReference,
            dateDebut: contrat.dateDebut,
            dateFin: contrat.dateFin ?? null,
            statut: contrat.statut,
            observation: contrat.observation ?? ''
          });

          /*
           * Document existant.
           */
          this.fichierExistant.set(
            contrat.pieceJointeUuid ?? null
          );

          this.fichierExistantNom.set(
            contrat.nomFichier ?? null
          );

          this.loading.set(false);
        },

        error: error => {
          console.error('Erreur chargement contrat :', error);

          this.loading.set(false);

          this.toastService.error(
            'Erreur',
            'Impossible de charger le contrat.'
          );

          this.retourListe();
        }
      });
  }

  get isEdit(): boolean {
    return this.mode === 'EDIT';
  }

  get pageTitle(): string {
    return this.isEdit
      ? 'Modifier le contrat'
      : 'Nouveau contrat';
  }

  get pageSubtitle(): string {
    return this.isEdit
      ? 'Modifiez les informations du contrat.'
      : 'Enregistrez un nouveau contrat pour un membre du personnel.';
  }

  get submitLabel(): string {
    return this.isEdit
      ? 'Enregistrer les modifications'
      : 'Créer le contrat';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (file.size > this.maxFileSize) {
      this.toastService.error(
        'Fichier trop volumineux',
        'La taille maximale autorisée est de 10 Mo.'
      );

      input.value = '';
      return;
    }

    if (
      file.type &&
      !this.allowedFileTypes.includes(file.type)
    ) {
      this.toastService.error(
        'Format non autorisé',
        'Formats acceptés : PDF, JPG, PNG, DOC et DOCX.'
      );

      input.value = '';
      return;
    }

    this.fichier = file;
  }

  supprimerFichierSelectionne(): void {
    this.fichier = null;
  }

  /**
   * Consulte le document actuellement enregistré.
   *
   * Le fichier est récupéré via HttpClient afin de conserver
   * l'authentification JWT de l'application.
   */
  consulterFichierExistant(): void {
    const fichierUuid = this.fichierExistant();

    if (!fichierUuid) {
      this.toastService.warning(
        'Document introuvable',
        'Aucun document associé à ce contrat.'
      );

      return;
    }

    this.loadingFichier.set(true);

    const url =
      `/myschool/api/storage/files/${fichierUuid}/content`;

    this.http
      .get(url, {
        responseType: 'blob'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.loadingFichier.set(false);

          const blobUrl = URL.createObjectURL(blob);

          const nouvelleFenetre = window.open(
            blobUrl,
            '_blank'
          );

          if (!nouvelleFenetre) {
            this.toastService.warning(
              'Fenêtre bloquée',
              'Autorisez les fenêtres contextuelles pour consulter le document.'
            );

            URL.revokeObjectURL(blobUrl);
            return;
          }

          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 60000);
        },

        error: error => {
          this.loadingFichier.set(false);

          console.error(
            'Erreur consultation pièce jointe :',
            error
          );

          this.toastService.error(
            'Erreur',
            'Impossible de consulter le document du contrat.'
          );
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.toastService.warning(
        'Formulaire incomplet',
        'Veuillez renseigner tous les champs obligatoires.'
      );

      return;
    }

    if (!this.isEdit && !this.fichier) {
      this.toastService.warning(
        'Document obligatoire',
        'Veuillez joindre le document du contrat.'
      );

      return;
    }

    const request = this.construireRequest();

    this.loading.set(true);

    if (this.isEdit && this.contratUuid) {
      this.modifier(
        this.contratUuid,
        request
      );
    } else {
      this.creer(request);
    }
  }

  private construireRequest(): ContratRequest {
    const value = this.form.getRawValue();

    return {
      reference: value.reference.trim(),
      personnelUuid: value.personnelUuid,
      typeContratUuid: value.typeContratUuid,
      modeRemuneration: value.modeRemuneration,
      montantReference: Number(value.montantReference),
      dateDebut: value.dateDebut,
      dateFin: value.dateFin || null,
      statut: value.statut,
      observation: value.observation?.trim() || null
    };
  }

  private creer(request: ContratRequest): void {
    this.contratService
      .creerContrat(
        request,
        this.fichier!
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.loading.set(false);

          this.toastService.success(
            'Succès',
            'Le contrat a été créé avec succès.'
          );

          this.retourListe();
        },

        error: error => {
          this.loading.set(false);

          console.error(
            'Erreur création contrat :',
            error
          );

          this.afficherErreur(
            error,
            'Impossible de créer le contrat.'
          );
        }
      });
  }

  private modifier(
    uuid: string,
    request: ContratRequest
  ): void {
    this.contratService
      .modifierContrat(
        uuid,
        request,
        this.fichier
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.loading.set(false);

          this.toastService.success(
            'Succès',
            'Le contrat a été modifié avec succès.'
          );

          this.retourListe();
        },

        error: error => {
          this.loading.set(false);

          console.error(
            'Erreur modification contrat :',
            error
          );

          this.afficherErreur(
            error,
            'Impossible de modifier le contrat.'
          );
        }
      });
  }

  private afficherErreur(
    error: any,
    messageParDefaut: string
  ): void {
    const message =
      error?.error?.message ??
      error?.error?.error ??
      messageParDefaut;

    this.toastService.error(
      'Erreur',
      message
    );
  }

  retourListe(): void {
    this.router.navigate([
      '/admin/rh/contrats'
    ]);
  }

  hasError(
    controlName: string,
    errorName: string
  ): boolean {
    const control = this.form.get(controlName);

    return !!(
      control &&
      control.touched &&
      control.hasError(errorName)
    );
  }

  getPersonnelName(
    personnel: PersonnelOption
  ): string {
    const name =
      `${personnel.firstName ?? ''} ${personnel.lastName ?? ''}`.trim();

    if (personnel.matricule) {
      return `${name} — ${personnel.matricule}`;
    }

    return name;
  }

  getTypeContratName(
    type: TypeContratOption
  ): string {
    return (
      type.libelle ??
      type.code ??
      'Type de contrat'
    );
  }
}