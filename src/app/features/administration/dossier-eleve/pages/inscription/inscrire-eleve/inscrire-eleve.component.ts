import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { ParentSearchToCreateEleve } from '../../../../../../core/models/dossiereleve/eleve/parent-search-to-create-eleve.model';
import { TypeRelationParent } from '../../../../../../core/models/dossiereleve/eleve/type-relation-parent.model';
import { EleveRequest } from '../../../../../../core/models/dossiereleve/request/eleve-request';
import { Inscription } from '../../../../../../core/models/dossiereleve/request/inscription';
import { InscriptionRequest } from '../../../../../../core/models/dossiereleve/request/inscription-request';
import { Eleve, MedecinTraitant, Parent } from '../../../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { FraisInscription } from '../../../../../../core/models/referentiels/frais-inscription';
import { MoyenPaiement } from '../../../../../../core/models/referentiels/moyen-paiement';
import { LocalStorageService } from '../../../../../../core/services/local-storage.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';

interface ParentSearchState {
  loading: boolean;
  results: ParentSearchToCreateEleve[];
  selected: ParentSearchToCreateEleve | null;
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
  errorMessage?: string;
  eleve?: Eleve;
  requestEleve: EleveRequest = {};
  eleveId?: number;
  typeSexe?: string[] = ["Masculin", "Féminin"];
  civilites?: string[] = ["M.", "Me"];
  today = new Date();
  title = "Création d'un élève";
  code?: number;

  medecinTraitantFormGroup!: FormGroup;
  medecinTraitant?: MedecinTraitant;
  medecinTraitantId?: number;

  parent: Parent = {};
  parentId?: number;

  inscriptionFormGroup!: FormGroup;
  inscription?: Inscription;
  inscriptionId?: number;

  paramId: any = 0;
  userId?: number;
  classes: ListeClasse[] = [];
  anneeScolaires: AnneeScolaire[] = [];
  moyenPaiementList: MoyenPaiement[] = [];
  ecoleId: any;

  currentStep: number = 1;
  endStep: boolean = false;
  allergie?: string;
  allergies?: string[];
  telephonesList?: string[];

  newParent: boolean = true;
  selectedOption: boolean = true;
  utilisateurDTOResult: any;

  fraisResultat = signal<FraisInscription | null>(null);
  chargement = signal<boolean>(false);
  erreur = signal<string | null>(null);


  private readonly searchSubject = new Subject<{ index: number; query: string }>();

  parentSearchResults: ParentSearchToCreateEleve[][] = [[]];

  parentSearchLoading: boolean[] = [false];

  selectedParents: (ParentSearchToCreateEleve | null)[] = [null];

  //  parentSearchState: ParentSearchState[] = [];

  private readonly router = inject(Router);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly location = inject(Location);

  typeRelationsParent = [
    { value: TypeRelationParent.PARENT, label: 'Parent' },
    { value: TypeRelationParent.TUTEUR, label: 'Tuteur' },
    { value: TypeRelationParent.RESPONSABLE_LEGAL, label: 'Responsable légal' },
    { value: TypeRelationParent.GRAND_PARENT, label: 'Grand-parent' },
    { value: TypeRelationParent.FRERE_SOEUR, label: 'Frère / Sœur' },
    { value: TypeRelationParent.AUTRE, label: 'Autre' }
  ];

  parentFormGroup = this._formBuilder.group({
    parents: this._formBuilder.array([
      this.createParentItem(false)
    ])
  });

  parentSearchState: ParentSearchState[] = [
    this.createParentSearchState()
  ];

  currentFile?: File;
  message = '';
  preview = '';



  ngOnInit(): void {
    this.userId = this.localStorage.getItem('id');
    this.initializeEleveForm(null);
    this.initializeMedecinTraitantForm(null);
    this.initializeInscriptionForm(null);
    this.getClasses();
    this.getAnneeScolaires();
    this.getMoyenPaiementList();
    this.trackFormFieldsForFrais();
    this.trackMoyenPaiementChanges();
    this.initParentSearch();
  }


  private initParentSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),

      distinctUntilChanged(
        (previous, current) =>
          previous.index === current.index &&
          previous.query === current.query
      ),

      switchMap(({ index, query }) => {

        const state = this.parentSearchState[index];

        if (!state) {
          return of({
            index,
            results: []
          });
        }

        state.loading = true;

        if (!query || query.trim().length < 3) {
          return of({
            index,
            results: [] as ParentSearchToCreateEleve[]
          });
        }

        return this.dossierEleveService
          .rechercherParents(query.trim())
          .pipe(
            map((results: ParentSearchToCreateEleve[]) => ({
              index,
              results
            })),

            catchError(error => {
              console.error(
                'Erreur lors de la recherche du parent:',
                error
              );

              return of({
                index,
                results: [] as ParentSearchToCreateEleve[]
              });
            })
          );
      })
    ).subscribe(({ index, results }) => {

      const state = this.parentSearchState[index];

      if (!state) {
        return;
      }

      state.results = results;
      state.loading = false;
    });
  }

  getMoyenPaiementList() {
    this.referentielService.getAllTypeMoyenPaiements().subscribe(
      (data: any[]) => {
        this.moyenPaiementList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getClasses() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classes = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getAnneeScolaires() {
    this.referentielResource.getResourceList('anneescolaire').subscribe({
      next: (data: any) => {
        this.anneeScolaires = data;
      }
    });
  }

  nextStep() {
    if (!this.isCurrentStepValid()) return;
    if (this.currentStep === 1) {
      this.ajouterEleve();
    } else if (this.currentStep === 2) {
      this.ajouterParent();
    } else if (this.currentStep === 3) {
      this.saveEleveWithFiles();
    } else if (this.currentStep === 4) {
      this.ajouterInscription();
    }
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return this.eleveFormGroup.valid;
    } else if (this.currentStep === 2) {
      return this.isFormValid;
    } else if (this.currentStep === 3) {
      return this.medecinTraitantFormGroup.valid;
    } else if (this.currentStep === 4) {
      this.checkFormValidity();
      return this.inscriptionFormGroup.valid;
    }
    return false;
  }

  deletePhoto() {
    const confirmDelete = confirm('Voulez-vous vraiment supprimer cette photo ?');
    if (!confirmDelete) return;
    this.preview = '';
    this.currentFile = undefined;
    this.message = '';
    const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.toastService.success('Succès', 'Photo supprimée avec succès');
  }

  remove(item: string) {
    if (!this.allergies) return;

    const index = this.allergies.indexOf(item);
    if (index >= 0) {
      this.allergies.splice(index, 1);
    }
    this.toastService.info('Info', '"${item}" supprimée`');
  }

  remove1(produit: string): void {
    const index = this.allergies!.indexOf(produit);
    if (index >= 0) {
      this.allergies!.splice(index, 1);
    }
  }

  addAllergie() {
    if (this.allergie && this.allergie.trim() !== '') {
      if (!this.allergies) {
        this.allergies = [];
      }
      this.allergies.push(this.allergie.trim());
      this.allergie = '';
    }
  }

  add(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (this.allergie === '') return;
    if (!this.allergies) {
      this.allergies = [];
    }
    this.allergies.push(this.allergie!.trim());
    this.allergie = '';
  }

  initializeEleveForm(eleve: Eleve | null) {
    this.eleveFormGroup = this._formBuilder.group({
      id: [eleve?.id ? eleve.id : ''],
      prenom: [eleve?.prenom ? eleve.prenom : '', Validators.required],
      nom: [eleve?.nom ? eleve.nom : '', Validators.required],
      sexe: [eleve?.sexe ? eleve.sexe : '', Validators.required],
      lieuNaissance: [eleve?.lieuNaissance ? eleve.lieuNaissance : '', Validators.required],
      address: [eleve?.address ? eleve.address : ''],
      dateNaissance: [new Date(eleve?.dateNaissance!)],
      nationalite: [eleve?.nationalite ? eleve.nationalite : '']
    });
  }

  ajouterEleve() {
    const payload = this.eleveFormGroup.value;
    if (payload && this.eleveFormGroup.valid) {
      this.currentStep++;
      this.updateProgressBar();
      this.toastService.success('Succès', 'Elève ajouté avec succès');
    }

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

  onParentSearch(index: number): void {
    const parent = this.parents().at(index) as FormGroup;

    const query = parent.get('rechercheParent')?.value?.trim() ?? '';

    this.searchSubject.next({
      index,
      query
    });
  }

  selectParent(
    index: number,
    parentResult: ParentSearchToCreateEleve
  ): void {

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
      rechercheParent:
        parentResult.telephone || parentResult.email
    });

    state.selected = parentResult;
    state.results = [];
    state.loading = false;

    parent.get('parentUuid')?.markAsTouched();
    parent.get('parentUuid')?.updateValueAndValidity();
  }

  newParentItem(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
      civility: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],
      profession: [''],
      email: [''],
    })
  }

  private createParentSearchState(): ParentSearchState {
    return {
      loading: false,
      results: [],
      selected: null
    };
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

  onParentExistChange(
    index: number,
    parentExist: boolean
  ): void {

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
    const rechercheParentControl =
      parent.get('rechercheParent');

    if (parentExist) {
      parentUuidControl?.setValidators([
        Validators.required
      ]);

      rechercheParentControl?.setValidators([
        Validators.required
      ]);
    } else {
      parentUuidControl?.clearValidators();
      rechercheParentControl?.clearValidators();
    }

    parentUuidControl?.updateValueAndValidity();
    rechercheParentControl?.updateValueAndValidity();
  }

  ParentItemIdentifiant(): FormGroup {
    return this._formBuilder.group({
      telephone: ['', Validators.required],
      email: ['']
    })
  }

  get isFormValid(): boolean {
    return this.parents().length > 0 && this.parents().length <= 2 &&
      this.parents().controls.every(control => control.valid);
  }

  ajouterParent(): void {
    if (!this.isFormValid) {
      this.parentFormGroup.markAllAsTouched();
      return;
    }
    this.currentStep++;
    this.updateProgressBar();
  }

  initializeMedecinTraitantForm(medecin: MedecinTraitant | null) {
    this.medecinTraitantFormGroup = this._formBuilder.group({
      id: [medecin?.id ?? ''],
      prenom: [medecin?.prenom ?? ''],
      nom: [medecin?.nom ?? ''],
      telephone: [medecin?.telephone ?? ''],
      email: [medecin?.email ?? ''],
    });
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.item(0)) {
      const file: File = selectedFiles.item(0);

      if (!file.type.match('image.*')) {
        this.message = 'Seules les images sont autorisées!';
        return;
      }

      if (file.size > 2097152) { // 2MB en octets
        this.message = 'L\'image ne doit pas dépasser 2MB!';
        return;
      }

      this.currentFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(this.currentFile);
    }
    console.log("Le fichier choisi est ", this.currentFile);
  }

  saveEleveWithFiles() {
    const formData: FormData = new FormData();

    const eleveForm = this.eleveFormGroup.getRawValue();
    const medecinForm = this.medecinTraitantFormGroup.getRawValue();

    const request: any = {
      nom: eleveForm.nom,
      prenom: eleveForm.prenom,
      sexe: eleveForm.sexe,
      lieuNaissance: eleveForm.lieuNaissance,
      address: eleveForm.address,
      dateNaissance: eleveForm.dateNaissance,
      nationalite: eleveForm.nationalite,
      allergies: this.allergies ?? [],

      medecinTraitantDTO: medecinForm,

      parents: this.parents().getRawValue()
    };

    formData.append('file', this.currentFile!);
    formData.append('piecejointeeleve', JSON.stringify(request));

    this.dossierEleveService.enregistrerEleveWithFiles(formData).subscribe({
      next: (response) => {
        if (response.statut === 'OK') {
          this.code = response.eleve;
          this.eleveId = response.eleve;
          this.updateInscriptionFormWithEleveId(this.eleveId);
          if (this.eleveId) {
            this.currentStep++;
            this.updateProgressBar();
            this.toastService.success('succès', 'Les informations l\'élève ont été enregistrées avec succès !!! ');
          }
        } else if (response.statut === 'FAILED') {
          this.toastService.error('Erreur', response.message);
        } else {
          this.toastService.error('Erreur', 'Réponse inattendue du serveur: ' + JSON.stringify(response));
        }
      }, error: (error) => {
        console.error('Erreur technique:', error);
        const errorMsg = error.error?.message || error.message || 'Erreur de connexion au serveur';
        this.toastService.error('Erreur technique', errorMsg);
      }
    });
  }


  initializeInscriptionForm(inscription: InscriptionRequest | null) {
    this.inscriptionFormGroup = this._formBuilder.group({
      id: [inscription?.id ?? ''],
      eleveId: [inscription?.eleveId ?? '', Validators.required],
      anneeScolaireId: [inscription?.anneeScolaireId ?? '', Validators.required],
      classeId: [inscription?.classeId ?? '', Validators.required],
      moyenPaiement: [inscription?.moyenPaiement ?? '', Validators.required],
      montantInscription: [inscription?.montantInscription ?? '', Validators.required],
      montantRecu: [inscription?.montantRecu ?? '', [Validators.required, Validators.min(0)]],
      reference: [inscription?.reference ?? ''],
    }, { validators: this.coherenceMontantValidator() });
  }

  coherenceMontantValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const montantDue = control.get('montantInscription')?.value;
      const montantRecuCtrl = control.get('montantRecu');

      if (!montantDue || !montantRecuCtrl?.value) return null;

      if (Number(montantRecuCtrl.value) > Number(montantDue)) {
        montantRecuCtrl.setErrors({ montantDepasse: true });
        return { coherenceMontant: true };
      } else {
        if (montantRecuCtrl.hasError('montantDepasse')) {
          const errors = montantRecuCtrl.errors;
          if (errors) {
            delete errors['montantDepasse'];
            montantRecuCtrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
      return null;
    };
  }


  trackFormFieldsForFrais() {
    this.inscriptionFormGroup.get('classeId')?.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(classeId => {
      const anneeScolaireId = this.inscriptionFormGroup.get('anneeScolaireId')?.value;
      if (classeId && anneeScolaireId) {
        this.chargerFrais(Number(classeId), Number(anneeScolaireId));
      }
    });

    this.inscriptionFormGroup.get('anneeScolaireId')?.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(anneeScolaireId => {
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
    if (this.chargement()) return;

    this.chargement.set(true);
    this.erreur.set(null);

    this.referentielService.obtenirFraisInscription(classeId, anneeScolaireId).subscribe({
      next: (data) => {
        this.fraisResultat.set(data);
        this.chargement.set(false);

        if (data && data.montant !== undefined) {
          this.inscriptionFormGroup.patchValue({
            montantInscription: data.montant,
            montantRecu: data.montant
          }, { emitEvent: false });

          this.inscriptionFormGroup.updateValueAndValidity({ emitEvent: false });
        }
      },
      error: (err) => {
        console.error('Erreur lors du calcul des frais:', err);
        this.erreur.set('Impossible de récupérer les frais d\'inscription.');
        this.chargement.set(false);
        this.inscriptionFormGroup.patchValue({
          montantInscription: '',
          montantRecu: ''
        }, { emitEvent: false });
      }
    });
  }

  trackMoyenPaiementChanges() {
    this.inscriptionFormGroup.get('moyenPaiement')?.valueChanges.subscribe(moyenId => {
      const refCtrl = this.inscriptionFormGroup.get('reference');
      if (this.doitAfficherReference()) {
        refCtrl?.setValidators([Validators.required]);
      } else {
        refCtrl?.clearValidators();
      }
      refCtrl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  doitAfficherReference(): boolean {
    const moyenId = this.inscriptionFormGroup.get('moyenPaiement')?.value;
    if (!moyenId || this.moyenPaiementList.length === 0) return false;

    const moyen = this.moyenPaiementList.find(m => String(m.id) === String(moyenId));
    if (!moyen?.libelle) return false;

    const nomMoyen = moyen.libelle.toLowerCase();

    return !nomMoyen.includes('espèce') && !nomMoyen.includes('espece');
  }

  isMontantInsuffisant(): boolean {
    const du = this.inscriptionFormGroup.get('montantInscription')?.value;
    const recu = this.inscriptionFormGroup.get('montantRecu')?.value;
    return du && recu && (Number(recu) < Number(du));
  }

  getReliquat(): number {
    const du = this.inscriptionFormGroup.get('montantInscription')?.value ?? 0;
    const recu = this.inscriptionFormGroup.get('montantRecu')?.value ?? 0;
    const reliquat = Number(du) - Number(recu);
    return reliquat > 0 ? reliquat : 0;
  }


  updateInscriptionFormWithEleveId(eleveId: number) {
    this.inscriptionFormGroup.patchValue({
      eleveId: eleveId
    });
    console.log('eleveId mis à jour dans le formulaire inscription:', eleveId);
  }

  checkFormValidity() {
    if (this.currentStep === 4) {
      Object.keys(this.inscriptionFormGroup.controls).forEach(key => {
        const control = this.inscriptionFormGroup.get(key);
        console.log(`${key}:`, {
          value: control?.value,
          valid: control?.valid,
          errors: control?.errors
        });
      });
    }
  }

  getInscriptionByCodeEleve(code: string) {
    this.dossierEleveService.getInscriptionByCodeEleve(code).subscribe({
      next: (data) => {
        this.inscription = data;
        this.inscriptionId = this.inscription.id;
        this.initializeInscriptionForm(this.inscription);
      }
    });
  }

  ajouterInscription() {
    const payload = this.inscriptionFormGroup.value;
    payload.ecole = this.ecoleId;
    this.dossierEleveService.saveInscription(payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les informations inscription ont été enregistrées avec succès !!! ');
          this.router.navigate(['/admin/dossier-eleve/eleves'])
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

  cancel() {
    this.location.back()
  }

  precedent() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgressBar();
    }
  }

  updateProgressBar() {
    setTimeout(() => {
      const steps = document.querySelectorAll(".step");
      const progressBar = document.querySelector(".step-indicator") as HTMLElement;

      if (progressBar && steps.length > 0) {
        const progress = ((this.currentStep - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
      }
    });
  }

  goBack() {
    this.router.navigate(['admin/dossier-eleve/eleves'])
  }
}
