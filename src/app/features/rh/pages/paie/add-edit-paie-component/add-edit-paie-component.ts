import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContratResponse } from '../../../../../core/models/rh/contrat-response.model';
import { DemandeAvanceSalaireResponse } from '../../../../../core/models/rh/demande-avance-salaire-response.model';
import { PaieRequest } from '../../../../../core/models/rh/paie-request.model';
import { PersonnelResponse } from '../../../../../core/models/rh/personnel-response.model';
import { RhResourceService } from '../../../services/rh-resource-service';
import { EtatCode } from '../../../../../core/constants/etat-code';

@Component({
  selector: 'app-add-edit-paie-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-edit-paie-component.html',
  styleUrl: './add-edit-paie-component.css',
})
export class AddEditPaieComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rhResourceService = inject(RhResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;

  mode: 'CREATE' | 'EDIT' = 'CREATE';

  paieUuid: string | null = null;

  loading = signal(false);
  loadingData = signal(false);

  personnels = signal<PersonnelResponse[]>([]);
  contrats = signal<ContratResponse[]>([]);
  demandesAvance = signal<DemandeAvanceSalaireResponse[]>([]);


  ngOnInit(): void {
    this.initialiserFormulaire();
    this.chargerDonnees();
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.mode = 'EDIT';
      this.paieUuid = uuid;
      this.chargerPaie(uuid);

    } else {
      this.mode = 'CREATE';
      this.form.patchValue({
        annee: new Date().getFullYear(),
        mois: new Date().getMonth() + 1,
        dateCalcul: this.formatDateForInput(new Date())
      });

    }
    this.ecouterChangementPersonnel();
    this.ecouterChangementContrat();
  }

  private initialiserFormulaire(): void {
    this.form = this.fb.group({
      personnelUuid: ['', Validators.required],
      contratUuid: ['', Validators.required],
      annee: [
        new Date().getFullYear(),
        [
          Validators.required,
          Validators.min(2000),
          Validators.max(2100)
        ]
      ],
      mois: [
        new Date().getMonth() + 1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(12)
        ]
      ],
      nombreHeures: [null, [Validators.min(0.01)]],
      retenues: [0, [Validators.min(0)]],
      dateCalcul: [
        this.formatDateForInput(new Date()),
        Validators.required
      ],
      demandeAvanceUuid: [null],
      observation: ['', Validators.maxLength(500)]
    });
  }

  private chargerDonnees(): void {
    this.loadingData.set(true);
    this.chargerPersonnels();
    this.chargerContrats();
    this.chargerDemandesAvance();
  }

  private chargerPersonnels(): void {
    this.rhResourceService.getResourceList('personnels')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.personnels.set(
            response.filter(
              (personnel: any) =>
                personnel.eligiblePaie !== false
            )
          );
          this.verifierFinChargement();
        },
        error: (error) => {
          console.error('Erreur chargement personnels :', error);
          this.toastService.error(
            'Erreur',
            'Impossible de charger les personnels.'
          );
          this.verifierFinChargement();
        }
      });
  }

  private chargerContrats(): void {
    this.rhResourceService.getResourceList('contrats')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.contrats.set(response);
          this.verifierFinChargement();
        },
        error: (error) => {
          console.error('Erreur chargement contrats :', error);
          this.toastService.error(
            'Erreur',
            'Impossible de charger les contrats.'
          );
          this.verifierFinChargement();
        }
      });
  }

  private chargerDemandesAvance(): void {
    this.rhResourceService.getResourceList('demandes-avance-salaire')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.demandesAvance.set(response ?? []);
          this.verifierFinChargement();
        },
        error: (error) => {
          console.warn('Demandes d’avance non chargées :', error);
          this.demandesAvance.set([]);
          this.verifierFinChargement();
        }
      });
  }

  private verifierFinChargement(): void {
    this.loadingData.set(false);
  }

  private chargerPaie(uuid: string): void {

    this.loading.set(true);

    this.rhResourceService.getPaieByUuid(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (paie: any) => {
          this.form.patchValue({
            personnelUuid: paie.personnelUuid,
            contratUuid: paie.contratUuid,
            annee: paie.annee,
            mois: paie.mois,
            nombreHeures: paie.nombreHeures ?? null,
            retenues: paie.retenues ?? 0,
            etatUuid: paie.etatUuid ?? null,
            dateCalcul: paie.dateCalcul ?? null,
            dateValidation: paie.dateValidation ?? null,
            demandeAvanceUuid: paie.demandeAvanceUuid ?? null,
            observation: paie.observation ?? ''
          });
          this.loading.set(false);
        },

        error: (error) => {
          console.error('Erreur chargement paie :', error);
          this.loading.set(false);
          this.toastService.error('Erreur', 'Impossible de charger la paie.');
          this.goBack();
        }
      });
  }

  private ecouterChangementPersonnel(): void {
    this.form.get('personnelUuid')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((personnelUuid: string) => {
        if (!personnelUuid) {
          this.form.patchValue(
            {
              contratUuid: null,
              demandeAvanceUuid: null
            },
            {
              emitEvent: false
            }
          );
          return;
        }
        const contrats = this.getContratsPersonnel(personnelUuid);
        const contratUuid = this.form.get('contratUuid')?.value;
        if (contratUuid && !contrats.some(contrat => contrat.uuid === contratUuid)) {
          this.form.patchValue(
            {
              contratUuid: null
            },
            {
              emitEvent: false
            }
          );
        }
        const demandeUuid = this.form.get('demandeAvanceUuid')?.value;
        if (demandeUuid) {
          const demandeExiste =
            this.getDemandesPersonnel(
              personnelUuid
            ).some(
              demande =>
                demande.uuid === demandeUuid
            );

          if (!demandeExiste) {
            this.form.patchValue(
              {
                demandeAvanceUuid: null
              },
              {
                emitEvent: false
              }
            );
          }
        }

      });
  }

  private ecouterChangementContrat(): void {
    this.form.get('contratUuid')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((contratUuid: string) => {
        const contrat = this.getContratSelectionne();
        if (!contrat) {
          return;
        }
        if (contrat.modeRemuneration !== 'HORAIRE') {
          this.form.patchValue(
            {
              nombreHeures: null
            },
            {
              emitEvent: false
            }
          );
        }

      });
  }

  get isEdit(): boolean {
    return this.mode === 'EDIT';
  }

  get pageTitle(): string {
    return this.isEdit
      ? 'Modifier la paie'
      : 'Nouvelle paie';
  }

  get pageSubtitle(): string {
    return this.isEdit
      ? 'Modifiez les informations de la paie.'
      : 'Enregistrez la paie mensuelle d’un membre du personnel.';
  }

  get submitLabel(): string {
    return this.isEdit
      ? 'Enregistrer les modifications'
      : 'Créer la paie';
  }

  get contratsDisponibles(): ContratResponse[] {
    const personnelUuid = this.form?.get('personnelUuid')?.value;
    if (!personnelUuid) {
      return [];
    }
    return this.getContratsPersonnel(personnelUuid);
  }

  get demandesAvanceDisponibles(): DemandeAvanceSalaireResponse[] {
    const personnelUuid = this.form?.get('personnelUuid')?.value;
    if (!personnelUuid) {
      return [];
    }
    return this.getDemandesPersonnel(personnelUuid);
  }

  get contratSelectionne(): ContratResponse | null {
    return this.getContratSelectionne();
  }

  get isHoraire(): boolean {
    return (this.contratSelectionne?.modeRemuneration === 'HORAIRE');
  }

  get montantReference(): number {
    return Number(this.contratSelectionne?.montantReference ?? 0);
  }

  get montantBrutEstime(): number {
    if (!this.contratSelectionne) {
      return 0;
    }
    if (this.isHoraire) {
      const heures = Number(this.form.get('nombreHeures')?.value) || 0;
      return (heures * this.montantReference);
    }
    return this.montantReference;
  }

  get retenuesEstimees(): number {
    return Number(this.form.get('retenues')?.value) || 0;
  }

  get netAPayerEstime(): number {
    return Math.max(0, this.montantBrutEstime - this.retenuesEstimees);
  }

  private getContratsPersonnel(personnelUuid: string): ContratResponse[] {
    return this.contrats().filter(
      contrat =>
        contrat.personnelUuid === personnelUuid
        &&
        contrat.statut === 'ACTIF'
    );
  }


  private getDemandesPersonnel(personnelUuid: string): DemandeAvanceSalaireResponse[] {
    return this.demandesAvance().filter(
      (demande: DemandeAvanceSalaireResponse) =>
        demande.personnelUuid === personnelUuid &&
       demande.etatCode === EtatCode.ETAT_EN_ATTENTE
      //  demande.etatUuid === 'EN_ATTENTE'
    );
  }

  private getContratSelectionne(): ContratResponse | null {
    const uuid = this.form?.get('contratUuid')?.value;
    if (!uuid) {
      return null;
    }
    return (this.contrats().find(contrat => contrat.uuid === uuid) ?? null);
  }

  getPersonnelName(personnel: PersonnelResponse): string {
    const name = `${personnel.firstName ?? ''} ${personnel.lastName ?? ''}`.trim();
    if (personnel.matricule) {
      return `${name} — ${personnel.matricule}`;
    }
    return name || 'Personnel';
  }

  getContratName(contrat: ContratResponse): string {
    const type = contrat.typeContratLibelle || contrat.typeContratCode || 'Contrat';

    const reference = contrat.reference ? ` — ${contrat.reference}` : '';

    return `${type}${reference}`;
  }

  getModeRemunerationLabel(mode?: string | null): string {
    switch (mode) {
      case 'MENSUEL':
        return 'Mensuel';

      case 'HORAIRE':
        return 'Horaire';

      default:
        return mode || 'Non renseigné';
    }
  }

  formatMontant(montant: number | null | undefined): string {
    if (montant === null || montant === undefined || isNaN(Number(montant))) {
      return '0';
    }
    return new Intl.NumberFormat(
      'fr-FR',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    ).format(Number(montant));
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!(
      control &&
      control.touched &&
      control.hasError(errorName)
    );
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

    const contrat = this.contratSelectionne;

    if (!contrat) {
      this.toastService.warning(
        'Contrat requis',
        'Veuillez sélectionner un contrat actif.'
      );

      return;
    }

    if (
      this.isHoraire &&
      (!this.form.get('nombreHeures')?.value ||
        Number(
          this.form.get('nombreHeures')?.value
        ) <= 0)
    ) {

      this.toastService.warning(
        'Nombre d’heures requis',
        'Veuillez renseigner le nombre d’heures travaillées.'
      );

      return;
    }

    const retenues = Number(this.form.get('retenues')?.value) || 0;

    if (retenues > this.montantBrutEstime) {

      this.toastService.warning(
        'Retenues invalides',
        'Les retenues ne peuvent pas être supérieures au montant brut.'
      );

      return;
    }

    const request = this.construireRequest();

    this.loading.set(true);

    if (this.isEdit && this.paieUuid) {

      this.modifier(this.paieUuid, request);

    } else {

      this.creer(request);
    }
  }

  private construireRequest(): any {
    const value = this.form.getRawValue();
    const contrat = this.contratSelectionne;
    return {
      personnelUuid: value.personnelUuid,
      contratUuid: value.contratUuid,
      annee: Number(value.annee),
      mois: Number(value.mois),
      nombreHeures:
        contrat?.modeRemuneration === 'HORAIRE'
          ? Number(value.nombreHeures)
          : null,
      retenues:
        value.retenues === null ||
          value.retenues === ''
          ? 0
          : Number(value.retenues),

      dateCalcul: value.dateCalcul || null,
      demandeAvanceUuid: value.demandeAvanceUuid || null,
      observation: value.observation?.trim() || null
    };
  }

  private creer(request: PaieRequest): void {
    this.rhResourceService.creerPaie(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toastService.success(
            'Succès',
            'La paie a été créée avec succès.'
          );
          this.goBack();
        },
        error: (error) => {
          this.loading.set(false);
          console.error(
            'Erreur création paie :',
            error
          );
          this.afficherErreur(
            error,
            'Impossible de créer la paie.'
          );
        }

      });
  }

  private modifier(uuid: string, request: PaieRequest): void {
    this.rhResourceService.modifierPaie(uuid, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toastService.success(
            'Succès',
            'La paie a été modifiée avec succès.'
          );
          this.goBack();
        },
        error: (error) => {
          this.loading.set(false);
          console.error(
            'Erreur modification paie :',
            error
          );
          this.afficherErreur(
            error,
            'Impossible de modifier la paie.'
          );
        }

      });
  }

  private afficherErreur(error: any, messageParDefaut: string): void {
    const message =
      error?.error?.message ??
      error?.error?.error ??
      messageParDefaut;

    this.toastService.error('Erreur', message);
  }

  goBack(): void {
    this.router.navigate(['/admin/rh/paies']);
  }

  retourListe(): void {
    this.goBack();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}