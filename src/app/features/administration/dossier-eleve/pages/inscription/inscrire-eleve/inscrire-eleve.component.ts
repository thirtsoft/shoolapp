import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { CreateEleveRequest } from '../../../../../../core/models/dossiereleve/eleve/create-eleve-request.model';
import { ParentSearchToCreateEleve } from '../../../../../../core/models/dossiereleve/eleve/parent-search-to-create-eleve.model';
import { TypeRelationParent } from '../../../../../../core/models/dossiereleve/eleve/type-relation-parent.model';
import { EleveRequest } from '../../../../../../core/models/dossiereleve/request/eleve-request';
import { Inscription } from '../../../../../../core/models/dossiereleve/request/inscription';
import { InscriptionRequest } from '../../../../../../core/models/dossiereleve/request/inscription-request';
import { Eleve, Parent } from '../../../../../../core/models/parent/parent';
import { ClasseListResponse } from '../../../../../../core/models/referentiels/classe';
import { FraisInscription } from '../../../../../../core/models/referentiels/frais-inscription';
import { MoyenPaiement } from '../../../../../../core/models/referentiels/moyen-paiement';

import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';
import { AnneeScolaireResponse } from '../../../../../../core/models/planification/cours-calendrier-response';

interface ParentSearchState {
  loading: boolean;
  results: ParentSearchToCreateEleve[];
  selected: ParentSearchToCreateEleve | null;
}

interface DocumentSelectionne {
  type: string;
  fichiers: File[];
  apercus: string[];
}

@Component({
  selector: 'app-inscrire-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe],
  templateUrl: './inscrire-eleve.component.html',
  styleUrls: ['./inscrire-eleve.component.css']
})
export class InscrireEleveComponent implements OnInit {

  eleveFormGroup!: FormGroup;

  inscriptionFormGroup!: FormGroup;

  eleve?: Eleve;

  requestEleve: EleveRequest = {};

  eleveId?: number;

  eleveUuid?: string;

  eleveCreated = false;

  eleveCreationInProgress = false;

  parent: Parent = {};

  parentId?: number;

  inscription?: Inscription;

  inscriptionId?: number;

  classes: ClasseListResponse[] = [];

  anneeScolaires: AnneeScolaireResponse[] = [];

  moyenPaiementList: MoyenPaiement[] = [];

  paramId: any = 0;

  userId?: number;

  code?: number;

  currentStep = 1;

  readonly totalSteps = 4;

  endStep = false;

  typeSexe: string[] = ['Masculin', 'Féminin'];

  civilites: string[] = ['M.', 'Me'];

  today = new Date();

  title = "Création d'un élève";

  errorMessage?: string;

  allergie = '';

  allergies: string[] = [];

  currentFile?: File;

  message = '';

  preview = '';

  telephonesList?: string[];

  newParent = true;

  selectedOption = true;

  utilisateurDTOResult: any;

  fraisResultat = signal<FraisInscription | null>(null);

  chargement = signal<boolean>(false);

  erreur = signal<string | null>(null);

  documentsSelectionnes: DocumentSelectionne[] = [];

  private readonly searchSubject = new Subject<{
    index: number;
    query: string;
  }>();

  parentSearchState: ParentSearchState[] = [this.createParentSearchState()];

  typeRelationsParent = [
    {
      value: TypeRelationParent.PARENT,
      label: 'Parent'
    },
    {
      value: TypeRelationParent.TUTEUR,
      label: 'Tuteur'
    },
    {
      value: TypeRelationParent.RESPONSABLE_LEGAL,
      label: 'Responsable légal'
    },
    {
      value: TypeRelationParent.GRAND_PARENT,
      label: 'Grand-parent'
    },
    {
      value: TypeRelationParent.FRERE_SOEUR,
      label: 'Frère / Sœur'
    },
    {
      value: TypeRelationParent.AUTRE,
      label: 'Autre'
    }
  ];

  private readonly router = inject(Router);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly location = inject(Location);

  parentFormGroup = this._formBuilder.group({
    parents: this._formBuilder.array([
      this.createParentItem(false)
    ])
  });

  ngOnInit(): void {

    this.initializeEleveForm(null);

    this.initializeInscriptionForm(null);

    this.getClasses();

    this.getAnneeScolaires();

    this.getMoyenPaiementList();

    this.trackFormFieldsForFrais();

    this.trackMoyenPaiementChanges();

    this.initParentSearch();
  }

  initializeEleveForm(eleve: Eleve | null): void {

    this.eleveFormGroup = this._formBuilder.group({
      id: [
        eleve?.id ?? ''
      ],

      prenom: [
        eleve?.prenom ?? '',
        Validators.required
      ],

      nom: [
        eleve?.nom ?? '',
        Validators.required
      ],

      sexe: [
        eleve?.sexe ?? '',
        Validators.required
      ],

      lieuNaissance: [
        eleve?.lieuNaissance ?? '',
        Validators.required
      ],

      address: [
        eleve?.address ?? ''
      ],

      dateNaissance: [
        eleve?.dateNaissance
          ? new Date(eleve.dateNaissance)
          : '',
        Validators.required
      ],

      nationalite: [
        eleve?.nationalite ?? ''
      ]
    });
  }

  parents(): FormArray {
    return this.parentFormGroup.get('parents') as FormArray;
  }

  createParentItem(parentExist = false): FormGroup {

    return this._formBuilder.group({

      parentExist: [parentExist],
      parentUuid: ['', parentExist ? Validators.required : []],

      rechercheParent: ['', parentExist ? Validators.required : []],

      telephone: [''],

      email: [''],

      nom: ['', parentExist ? [] : Validators.required],

      prenom: ['', parentExist ? [] : Validators.required],

      civilite: ['', parentExist ? [] : Validators.required],

      address: [''],

      profession: [''],

      typeRelation: ['', Validators.required]
    });
  }

  private createParentSearchState(): ParentSearchState {
    return { loading: false, results: [], selected: null };
  }

  onAddParentItem(): void {

    if (this.parents().length >= 2) {

      this.toastService.warning(
        'Attention',
        'Vous ne pouvez ajouter que 2 parents maximum'
      );

      return;
    }

    this.parents().push(this.createParentItem(false));

    this.parentSearchState.push(this.createParentSearchState());
  }

  removeParentItem(index: number): void {
    if (this.parents().length <= 1) {
      return;
    }

    this.parents().removeAt(index);
    this.parentSearchState.splice(index, 1);
  }

  onParentExistChange(index: number, parentExist: boolean): void {
    const parent = this.parents().at(index) as FormGroup;
    const state = this.parentSearchState[index];
    if (!state) {
      return;
    }

    parent.patchValue({
      parentExist,
      parentUuid: '',
      rechercheParent: '',
      telephone: '',
      email: '',
      nom: '',
      prenom: '',
      civilite: '',
      address: '',
      profession: ''
    });

    state.results = [];

    state.loading = false;

    state.selected = null;

    const parentUuidControl = parent.get('parentUuid');
    const rechercheParentControl = parent.get('rechercheParent');

    if (parentExist) {
      parentUuidControl?.setValidators(Validators.required);
      rechercheParentControl?.setValidators(Validators.required);

    } else {

      parentUuidControl?.clearValidators();

      rechercheParentControl?.clearValidators();
    }

    parentUuidControl?.updateValueAndValidity();

    rechercheParentControl?.updateValueAndValidity();
  }

  private initParentSearch(): void {
    this.searchSubject
      .pipe(

        debounceTime(300),

        distinctUntilChanged(
          (previous, current) =>
            previous.index === current.index &&
            previous.query === current.query
        ),

        switchMap(({ index, query }) => {

          const state = this.parentSearchState[index];

          if (!state) {
            return of({ index, results: [] });
          }

          state.loading = true;

          if (!query || query.trim().length < 3) {
            state.loading = false;

            return of({ index, results: [] as ParentSearchToCreateEleve[] });
          }

          return this.dossierEleveService
            .rechercherParents(query.trim())
            .pipe(

              map(
                (results: ParentSearchToCreateEleve[]) => ({
                  index,
                  results
                })
              ),

              catchError(error => {

                console.error(
                  'Erreur lors de la recherche du parent:',
                  error
                );

                return of({ index, results: [] as ParentSearchToCreateEleve[] });
              })
            );
        })

      )
      .subscribe(({ index, results }) => {

        const state = this.parentSearchState[index];
        if (!state) {
          return;
        }

        state.results = results;
        state.loading = false;
      });
  }

  onParentSearch(index: number): void {

    const parent = this.parents().at(index) as FormGroup;

    const query = parent.get('rechercheParent')?.value?.trim() ?? '';

    this.searchSubject.next({ index, query });
  }

  selectParent(index: number, parentResult: ParentSearchToCreateEleve): void {
    const parent = this.parents().at(index) as FormGroup;
    const state = this.parentSearchState[index];

    if (!state) {
      return;
    }

    parent.patchValue({
      parentUuid: parentResult.parentUuid,
      telephone: parentResult.telephone,
      email: parentResult.email,
      nom: parentResult.nom,
      prenom: parentResult.prenom,
      civilite: parentResult.civilite,
      address: parentResult.address ?? '',
      profession: parentResult.profession ?? '',
      rechercheParent: parentResult.telephone || parentResult.email
    });

    state.selected = parentResult;

    state.results = [];

    state.loading = false;

    parent.get('parentUuid')?.markAsTouched();

    parent.get('parentUuid')?.updateValueAndValidity();
  }

  get isFormValid(): boolean {
    return (
      this.parents().length > 0 &&
      this.parents().length <= 2 &&
      this.parents().controls.every(control => control.valid)
    );
  }

  selectFile(event: Event): void {
    this.message = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    const tailleMax = 2 * 1024 * 1024;

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      this.currentFile = undefined;
      this.preview = '';
      this.message = 'Format non supporté. Veuillez sélectionner une image JPG ou PNG.';
      input.value = '';
      return;
    }

    if (file.size > tailleMax) {
      this.currentFile = undefined;
      this.preview = '';
      this.message = `La photo est trop volumineuse. La taille maximale autorisée est de 2 Mo. Votre fichier fait ${this.formatFileSize(file.size)}.`;
      input.value = '';
      return;
    }

    this.currentFile = file;

    const reader = new FileReader();

    reader.onload = () => { this.preview = reader.result as string; };

    reader.readAsDataURL(file);

    input.value = '';
  }

  formatFileSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} Ko`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  }

  deletePhoto(): void {
    const confirmDelete =
      confirm('Voulez-vous vraiment supprimer cette photo ?');

    if (!confirmDelete) {
      return;
    }

    this.preview = '';

    this.currentFile = undefined;

    this.message = '';

    const fileInput =
      document.querySelector(
        '#fileInput'
      ) as HTMLInputElement;

    if (fileInput) {
      fileInput.value = '';
    }

    this.toastService.success(
      'Succès',
      'Photo supprimée avec succès'
    );
  }

  addAllergie(): void {

    const value =
      this.allergie.trim();

    if (!value) {
      return;
    }

    if (!this.allergies) {
      this.allergies = [];
    }

    this.allergies.push(value);

    this.allergie = '';
  }

  add(event: Event): void {

    event.preventDefault();

    event.stopPropagation();

    this.addAllergie();
  }

  remove(item: string): void {

    const index =
      this.allergies.indexOf(item);

    if (index >= 0) {
      this.allergies.splice(
        index,
        1
      );
    }
  }

  nextStep(): void {

    if (this.currentStep === 1) {

      if (!this.validateCurrentStep()) {
        return;
      }

      this.goToStep(2);

      return;
    }

    if (this.currentStep === 2) {

      if (!this.validateCurrentStep()) {
        return;
      }

      this.createEleveIfNecessary();

      return;
    }

    if (this.currentStep === 3) {

      if (!this.validateCurrentStep()) {
        return;
      }

      this.ajouterInscription();

      return;
    }

    if (this.currentStep === 4) {

      this.terminerInscription();
    }
  }

  precedent(): void {

    if (this.currentStep <= 1) {
      return;
    }

    this.currentStep--;

    this.updateProgressBar();
  }

  private goToStep(step: number): void {

    if (
      step < 1 ||
      step > this.totalSteps
    ) {
      return;
    }

    this.currentStep = step;

    this.updateProgressBar();
  }

  private validateCurrentStep(): boolean {

    switch (this.currentStep) {

      case 1:

        if (this.eleveFormGroup.valid) {
          return true;
        }

        this.eleveFormGroup.markAllAsTouched();

        return false;

      case 2:

        if (this.isFormValid) {
          return true;
        }

        this.parentFormGroup.markAllAsTouched();

        return false;

      case 3:

        if (this.inscriptionFormGroup.valid) {
          return true;
        }

        this.inscriptionFormGroup.markAllAsTouched();

        return false;

      case 4:
        return true;

      default:
        return false;
    }
  }

  isCurrentStepValid(): boolean {

    switch (this.currentStep) {

      case 1:
        return this.eleveFormGroup.valid;

      case 2:
        return this.isFormValid;

      case 3:
        return this.inscriptionFormGroup.valid;

      case 4:
        return true;

      default:
        return false;
    }
  }

  private createEleveIfNecessary(): void {

    if (this.eleveCreated && this.eleveId) {

      this.updateInscriptionFormWithEleveId(this.eleveId);

      this.goToStep(3);

      return;
    }

    if (this.eleveCreationInProgress) {
      return;
    }

    this.saveEleveWithFiles();
  }

  saveEleveWithFiles(): void {
    if (this.eleveCreated) {
      if (this.eleveId) {
        this.updateInscriptionFormWithEleveId(this.eleveId);
        this.goToStep(3);
      }
      return;
    }
    if (!this.eleveFormGroup.valid) {
      this.eleveFormGroup.markAllAsTouched();
      return;
    }
    if (!this.isFormValid) {
      this.parentFormGroup.markAllAsTouched();
      return;
    }

    this.eleveCreationInProgress = true;

    const eleveForm = this.eleveFormGroup.getRawValue();

    const request: CreateEleveRequest = {
      nom: eleveForm.nom,
      prenom: eleveForm.prenom,
      sexe: eleveForm.sexe,
      lieuNaissance: eleveForm.lieuNaissance,
      address: eleveForm.address,
      dateNaissance: eleveForm.dateNaissance,
      nationalite: eleveForm.nationalite,
      allergies: this.allergies ?? [],
      parents: this.parents().getRawValue()
    };

    const formData = new FormData();

    formData.append(
      'eleve',
      new Blob(
        [
          JSON.stringify(request)
        ],
        {
          type: 'application/json'
        }
      )
    );

    if (this.currentFile) {

      formData.append(
        'file',
        this.currentFile
      );
    }

    this.dossierEleveService
      .enregistrerEleveAvecPhotoFiles(formData)
      .subscribe({

        next: response => {

          this.eleveCreationInProgress = false;

          if (!response.success || !response.data) {

            this.toastService.error('Erreur',
              response.message ||
              "Impossible d'enregistrer l'élève."
            );

            return;
          }

          const data = response.data;
          this.eleveId = data.eleveId;
          this.eleveUuid = data.eleveUuid;
          this.code = data.eleveId;
          this.eleveCreated = true;

          this.updateInscriptionFormWithEleveId(data.eleveId);

          this.toastService.success('Succès',
            response.message || "Les informations de l'élève ont été enregistrées avec succès."
          );

          if (data.photoProvided && !data.photoStored) {

            this.toastService.warning('Attention',
              data.photoMessage || "L'élève a été créé, mais la photo n'a pas pu être enregistrée."
            );
          }

          this.goToStep(3);
        },

        error: error => {

          this.eleveCreationInProgress = false;

          console.error("Erreur lors de la création de l'élève", error);

          this.toastService.error('Erreur',
            error?.error?.message || "Une erreur est survenue lors de la création de l'élève."
          );
        }
      });
  }

  initializeInscriptionForm(inscription: InscriptionRequest | null): void {
    this.inscriptionFormGroup = this._formBuilder.group({
      id: [inscription?.id ?? ''],
      eleveId: [inscription?.eleveId ?? '', Validators.required],
      anneeScolaireId: [inscription?.anneeScolaireId ?? '', Validators.required],
      classeId: [inscription?.classeId ?? '', Validators.required],
      moyenPaiement: [inscription?.moyenPaiement ?? '', Validators.required],
      montantInscription: [inscription?.montantInscription ?? '', Validators.required],
      montantRecu: [inscription?.montantRecu ?? '', [Validators.required, Validators.min(0)]],
      reference: [inscription?.reference ?? '']
    },
      {
        validators: this.coherenceMontantValidator()
      }
    );
  }

  coherenceMontantValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const montantDue = control.get('montantInscription')?.value;

      const montantRecuCtrl = control.get('montantRecu');

      if (!montantDue || !montantRecuCtrl?.value) {
        return null;
      }

      if (Number(montantRecuCtrl.value) > Number(montantDue)) {

        montantRecuCtrl.setErrors({
          ...(montantRecuCtrl.errors ?? {}),
          montantDepasse: true
        });

        return { coherenceMontant: true };
      }

      if (montantRecuCtrl.hasError('montantDepasse')) {

        const errors = { ...(montantRecuCtrl.errors ?? {}) };

        delete errors['montantDepasse'];

        montantRecuCtrl.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  trackFormFieldsForFrais(): void {
    this.inscriptionFormGroup
      .get('classeId')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(classeId => {

        const anneeScolaireId = this.inscriptionFormGroup.get('anneeScolaireId')?.value;

        if (classeId && anneeScolaireId) {

          this.chargerFrais(Number(classeId), Number(anneeScolaireId));
        }
      });

    this.inscriptionFormGroup
      .get('anneeScolaireId')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(anneeScolaireId => {

        const classeId = this.inscriptionFormGroup.get('classeId')?.value;

        if (classeId && anneeScolaireId) {

          this.chargerFrais(Number(classeId), Number(anneeScolaireId));
        }
      });
  }

  chargerFrais(classeId: number, anneeScolaireId: number): void {

    if (!classeId || !anneeScolaireId) {

      this.erreur.set('Veuillez sélectionner une classe et une année scolaire valides.');

      return;
    }

    if (this.chargement()) {
      return;
    }

    this.chargement.set(true);

    this.erreur.set(null);

    this.referentielService
      .obtenirFraisInscription(classeId, anneeScolaireId)
      .subscribe({

        next: data => {

          this.fraisResultat.set(data);

          this.chargement.set(false);

          if (data && data.montant !== undefined) {

            this.inscriptionFormGroup.patchValue(
              {
                montantInscription: data.montant,

                montantRecu: data.montant
              },
              {
                emitEvent: false
              }
            );

            this.inscriptionFormGroup.updateValueAndValidity({ emitEvent: false });
          }
        },

        error: err => {

          console.error(
            'Erreur lors du calcul des frais:',
            err
          );

          this.erreur.set("Impossible de récupérer les frais d'inscription.");

          this.chargement.set(false);

          this.inscriptionFormGroup.patchValue(
            {
              montantInscription: '',
              montantRecu: ''
            },
            {
              emitEvent: false
            }
          );
        }
      });
  }

  trackMoyenPaiementChanges(): void {

    this.inscriptionFormGroup.get('moyenPaiement')?.valueChanges
      .subscribe(() => {

        const refCtrl = this.inscriptionFormGroup.get('reference');

        if (this.doitAfficherReference()) {

          refCtrl?.setValidators(Validators.required);

        } else {

          refCtrl?.clearValidators();
        }

        refCtrl?.updateValueAndValidity({ emitEvent: false });
      });
  }

  doitAfficherReference(): boolean {
    const moyenId = this.inscriptionFormGroup.get('moyenPaiement')?.value;

    if (!moyenId || this.moyenPaiementList.length === 0) {
      return false;
    }

    const moyen = this.moyenPaiementList.find(m => String(m.id) === String(moyenId));

    if (!moyen?.libelle) {
      return false;
    }

    const nomMoyen = moyen.libelle.toLowerCase();

    return (!nomMoyen.includes('espèce') && !nomMoyen.includes('espece'));
  }

  isMontantInsuffisant(): boolean {

    const du = this.inscriptionFormGroup.get('montantInscription')?.value;

    const recu = this.inscriptionFormGroup.get('montantRecu')?.value;

    return !!(du && recu && Number(recu) < Number(du));
  }

  getReliquat(): number {

    const du = this.inscriptionFormGroup.get('montantInscription')?.value ?? 0;

    const recu = this.inscriptionFormGroup.get('montantRecu')?.value ?? 0;

    const reliquat = Number(du) - Number(recu);

    return reliquat > 0 ? reliquat : 0;
  }

  updateInscriptionFormWithEleveId(eleveId: number): void {
    this.inscriptionFormGroup.patchValue({ eleveId });
  }

  getInscriptionByCodeEleve(code: string): void {

    this.dossierEleveService
      .getInscriptionByCodeEleve(code)
      .subscribe({

        next: data => {

          this.inscription = data;

          this.inscriptionId = this.inscription.id;

          this.initializeInscriptionForm(this.inscription);
        }
      });
  }

  ajouterInscription(): void {
    if (!this.eleveId) {
      this.toastService.error('Erreur', "L'élève n'a pas encore été créé.");
      return;
    }

    if (!this.inscriptionFormGroup.valid) {
      this.inscriptionFormGroup.markAllAsTouched();
      return;
    }

    const payload = this.inscriptionFormGroup.getRawValue();

    this.dossierEleveService
      .saveInscription(payload)
      .subscribe({
        next: data => {
          if (data.statut === 'OK') {
            this.toastService.success('Succès',
              'L’inscription a été enregistrée avec succès !'
            );

            this.goToStep(4);

            return;
          }
          if (
            data.statut === 'FAILED') {

            this.toastService.error('Erreur',
              'Erreur lors de la création : ' + data.message
            );
            return;
          }

          this.toastService.error('Erreur', 'Réponse inattendue du serveur.');
        },

        error: error => {
          console.error("Erreur lors de la création de l'inscription:", error);

          this.toastService.error('Erreur',
            error?.error?.message || error?.message || "Erreur lors de la création de l'inscription."
          );
        }
      });
  }

  onDocumentSelected(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const fichiers = Array.from(input.files);

    const tailleMax = 50 * 1024 * 1024;

    if (type === 'PHOTOS_IDENTITE') {

      const fichierNonImage = fichiers.find(file =>
        file.type !== 'image/jpeg' &&
        file.type !== 'image/jpg' &&
        file.type !== 'image/png'
      );

      if (fichierNonImage) {
        this.toastService.warning('Format non supporté',
          'Les photos d’identité doivent être au format JPG, JPEG ou PNG.'
        );

        input.value = '';

        return;
      }

      if (fichiers.length > 2) {

        this.toastService.warning('Nombre de fichiers limité', 'Vous pouvez sélectionner au maximum 2 photos d’identité.');

        input.value = '';

        return;
      }
    }

    else {
      const fichierNonAutorise = fichiers.find(file =>
        file.type !== 'application/pdf' &&
        file.type !== 'image/jpeg' &&
        file.type !== 'image/jpg' &&
        file.type !== 'image/png'
      );

      if (fichierNonAutorise) {

        this.toastService.warning('Format non supporté', 'Utilisez uniquement des fichiers PDF, JPG, JPEG ou PNG.');

        input.value = '';

        return;
      }
    }


    const fichierTropVolumineux = fichiers.find(file => file.size > tailleMax);

    if (fichierTropVolumineux) {

      this.toastService.warning('Fichier trop volumineux',
        `Le fichier "${fichierTropVolumineux.name}" dépasse la taille maximale autorisée de 50 Mo. Sa taille est de ${this.formatFileSize(fichierTropVolumineux.size)}.`
      );

      input.value = '';

      return;
    }

    const fichiersSelectionnes = type === 'PHOTOS_IDENTITE' ? fichiers : [fichiers[0]];

    const documentExistant = this.documentsSelectionnes.find(document => document.type === type);

    if (documentExistant) {

      documentExistant.fichiers = fichiersSelectionnes;
      documentExistant.apercus = [];

    } else {

      this.documentsSelectionnes.push({
        type,
        fichiers: fichiersSelectionnes,
        apercus: []
      });
    }

    this.genererApercus(type);

    input.value = '';
  }

  private genererApercus(type: string): void {
    const document = this.documentsSelectionnes.find(item => item.type === type);
    if (!document) {
      return;
    }

    document.apercus = new Array(document.fichiers.length).fill('');

    document.fichiers.forEach(
      (file, index) => {

        if (file.type === 'application/pdf') {
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          document.apercus[index] = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    );
  }

  getDocument(type: string): DocumentSelectionne | undefined {
    return this.documentsSelectionnes.find(document => document.type === type);
  }

  supprimerDocument(type: string, index = 0): void {
    const document = this.getDocument(type);
    if (!document) {
      return;
    }

    document.fichiers.splice(index, 1);
    document.apercus.splice(index, 1);

    if (document.fichiers.length === 0) {
      this.documentsSelectionnes = this.documentsSelectionnes.filter(item => item.type !== type);
    }
  }

  getNombreDocuments(type: string): number {
    return this.getDocument(type)?.fichiers.length ?? 0;
  }

  terminerInscription(): void {
    if (!this.eleveUuid) {
      this.toastService.error('Erreur', "Impossible d'associer les documents : l'élève n'a pas été créé.");
      return;
    }

    if (this.documentsSelectionnes.length === 0) {
      this.toastService.success('Inscription terminée',
        "L'élève a été inscrit. Vous pourrez ajouter les documents ultérieurement depuis son dossier."
      );
      this.goBack();
      return;
    }
    this.uploadDocuments();
  }

  private uploadDocuments(): void {
    if (!this.eleveUuid || this.documentsSelectionnes.length === 0) {
      this.goBack();
      return;
    }

    const documents = [...this.documentsSelectionnes];

    let uploadsTermines = 0;
    let uploadsEchoues = 0;

    documents.forEach(document => {

      this.dossierEleveService
        .uploadDocuments(this.eleveUuid!, document.type, document.fichiers)
        .subscribe({

          next: response => {

            uploadsTermines++;

            if (!response.success) {

              uploadsEchoues++;

              console.error(`Erreur lors de l'upload du document ${document.type}:`,
                response.message
              );
            }

            this.verifierFinUploadDocuments(uploadsTermines, uploadsEchoues);
          },

          error: error => {

            uploadsTermines++;

            uploadsEchoues++;

            console.error(`Erreur lors de l'upload du document ${document.type}:`, error);

            this.verifierFinUploadDocuments(uploadsTermines, uploadsEchoues);
          }
        });
    });
  }

  private verifierFinUploadDocuments(uploadsTermines: number, uploadsEchoues: number): void {
    if (uploadsTermines !== this.documentsSelectionnes.length) {
      return;
    }
    if (uploadsEchoues === 0) {
      this.toastService.success('Inscription terminée',
        "L'élève, son inscription et les documents ont été enregistrés avec succès."
      );

    } else {
      this.toastService.warning('Inscription terminée',
        `L'inscription est enregistrée, mais ${uploadsEchoues} document(s) n'ont pas pu être envoyé(s). Vous pourrez les ajouter depuis le dossier de l'élève.`
      );
    }

    this.goBack();
  }

  getMoyenPaiementList(): void {
    this.referentielService
      .getAllTypeMoyenPaiements()
      .subscribe({
        next: data => {
          this.moyenPaiementList = data;
        },
        error: error => {
          this.errorMessage = error;
        }
      });
  }

  getClasses(): void {
    this.referentielResource.getResourceList('classe/annee-encours')
      .subscribe({
        next: data => {
          this.classes = data as ClasseListResponse[];
        },
        error: error => {
          this.errorMessage = error;
        }
      });
  }

  getAnneeScolaires(): void {
    this.referentielResource.getResourceList('anneescolaire/response')
      .subscribe({
        next: data => {
          this.anneeScolaires = data as AnneeScolaireResponse[];
        },
        error: error => {
          this.errorMessage = error;
        }
      });
  }

  updateProgressBar(): void {
    setTimeout(() => {
      const steps = document.querySelectorAll('.step');
      const progressBar = document.querySelector('.step-indicator') as HTMLElement;

      if (progressBar && steps.length > 0) {
        const progress = ((this.currentStep - 1) / (steps.length - 1)) * 100;

        progressBar.style.width = `${progress}%`;
      }

    });
  }

  cancel(): void {
    this.location.back();
  }

  goBack(): void {
    void this.router.navigate(['/admin/dossier-eleve/eleves']);
  }
}