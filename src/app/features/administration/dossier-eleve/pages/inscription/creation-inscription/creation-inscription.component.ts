import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { Inscription } from '../../../../../../core/models/dossiereleve/request/inscription';
import { InscriptionRequest } from '../../../../../../core/models/dossiereleve/request/inscription-request';
import { Eleve } from '../../../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { FraisInscription } from '../../../../../../core/models/referentiels/frais-inscription';
import { MoyenPaiement } from '../../../../../../core/models/referentiels/moyen-paiement';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../../core/services/local-storage.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';

@Component({
  selector: 'app-creation-inscription',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './creation-inscription.component.html',
  styleUrls: ['./creation-inscription.component.css']
})
export class CreationInscriptionComponent implements OnInit {

  @Input() eleveId?: number;
  @Input() code!: number;
  @Input() eleve?: string;

  errorMessage!: string;
  today = new Date();
  title = "Réinscrire un élève";

  inscriptionFormGroup!: FormGroup;
  inscription?: Inscription = {};
  inscriptionId?: number;
  isEdit: boolean = false;

  classes: ListeClasse[] = [];
  anneeScolaires: AnneeScolaire[] = [];
  eleves: Eleve[] = [];
  moyenPaiementList: MoyenPaiement[] = [];


  ecoleId: any;

  userId?: number;

  utilisateur: Utilisateur = {};

  searchTerm: string = '';
  filteredEleves: Eleve[] = [];
  isLoading: boolean = false;
  showDropdown: boolean = false;
  selectedEleveInfo: any = null;

  fraisResultat = signal<FraisInscription | null>(null);
  chargement = signal<boolean>(false);
  erreur = signal<string | null>(null);

  private readonly searchSubject = new Subject<string>();

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly referentielService = inject(ReferentielService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.eleve = this.localStorage.getItem('eleve');
    this.inscriptionId = this.route.snapshot.params['id'];

    this.initializeInscriptionForm(null);

    //  this.trackFormFieldsForFrais();
    //  this.trackMoyenPaiementChanges();

    this.setupFormObservers();

    this.getConnectedUserInfos();
    this.getClasses();
    this.getAnneeScolaires();
    this.getMoyenPaiementList();
    this.getEleves();

    if (this.inscriptionId != null && this.inscriptionId != undefined) {
      this.getInscription(this.inscriptionId);
      this.title = 'Modifier une inscription';
      this.isEdit = true;
    }
    this.setupSearch();
    //  this.trackFormFieldsForFrais();
    //  this.trackMoyenPaiementChanges();
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          this.showDropdown = false;
          return of([]);
        }
        this.isLoading = true;
        return this.searchEleves(term);
      })
    ).subscribe((results: any) => {
      this.filteredEleves = results;
      this.isLoading = false;
      this.showDropdown = results.length > 0;
    });
  }

  searchEleves(term: string): Observable<Eleve[]> {
    if (this.eleves && this.eleves.length > 0) {
      const lowerTerm = term.toLowerCase();
      const results = this.eleves.filter(eleve =>
        eleve.nom?.toLowerCase().includes(lowerTerm) ||
        eleve.prenom?.toLowerCase().includes(lowerTerm) ||
        eleve.matricule?.toLowerCase().includes(lowerTerm)
      ).slice(0, 20); // Limiter à 20 résultats
      return of(results);
    }
    return of([]);
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchSubject.next(this.searchTerm);

    if (!this.searchTerm) {
      this.inscriptionFormGroup.patchValue({ eleveId: '' });
      this.selectedEleveInfo = null;
    }
  }

  selectEleve(eleve: Eleve) {
    this.inscriptionFormGroup.patchValue({ eleveId: eleve.id });
    this.searchTerm = `${eleve.prenom} ${eleve.nom}`;
    this.selectedEleveInfo = eleve;
    this.showDropdown = false;

    this.inscriptionFormGroup.get('eleveId')?.markAsTouched();
  }

  closeDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  getSelectedEleveName1(): string {
    if (this.selectedEleveInfo) {
      return `${this.selectedEleveInfo.prenom} ${this.selectedEleveInfo.nom}`;
    }

    const eleveId = this.inscriptionFormGroup.get('eleveId')?.value;
    if (!eleveId || !this.eleves || this.eleves.length === 0) {
      return '';
    }
    const eleve = this.eleves.find(e => Number(e.id) === Number(eleveId));
    return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
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

  getInscription11(inscriptionId: number) {
    this.dossierEleveService.getInscription(inscriptionId).subscribe({
      next: (data) => {
        this.inscription = data;
        console.log('edit inscription', this.inscription);
        this.initializeInscriptionForm(this.inscription);

        if (this.inscription?.eleveDTO) {
          const eleve = this.inscription.eleveDTO;
          this.selectedEleveInfo = eleve;
          this.searchTerm = `${eleve.prenom} ${eleve.nom}`;

          if (eleve.matricule) {
            this.searchTerm += ` (${eleve.matricule})`;
          }
        }
      }
    });
  }

  setupFormObservers() {
    if (!this.inscriptionFormGroup) {
      console.warn('Formulaire non initialisé, impossible de configurer les observateurs');
      return;
    }

    // Nettoyer les anciens observateurs si nécessaire
    this.trackFormFieldsForFrais();
    this.trackMoyenPaiementChanges();
  }

  getInscription(inscriptionId: number) {
    this.dossierEleveService.getInscription(inscriptionId).subscribe({
      next: (data) => {
        this.inscription = data;
        this.initializeInscriptionForm(this.inscription);

        // RÉATTACHER LES OBSERVATEURS après la réinitialisation du formulaire
        this.setupFormObservers();

        if (this.inscription?.eleveDTO) {
          const eleve = this.inscription.eleveDTO;
          this.selectedEleveInfo = eleve;
          this.searchTerm = `${eleve.prenom} ${eleve.nom}`;

          if (eleve.matricule) {
            this.searchTerm += ` (${eleve.matricule})`;
          }
        }

        // Déclencher manuellement le chargement des frais pour le mode édition
        const classeId = this.inscriptionFormGroup.get('classeId')?.value;
        const anneeScolaireId = this.inscriptionFormGroup.get('anneeScolaireId')?.value;

        if (classeId && anneeScolaireId) {
          console.log('Mode édition - Chargement initial des frais:', { classeId, anneeScolaireId });
          this.chargerFrais(Number(classeId), Number(anneeScolaireId));
        }
      }
    });
  }

  getEleves() {
    this.dossierEleveService.getResourceList('eleve')?.subscribe({
      next: (data: any) => {
        this.eleves = data;
      }
    });
  }

  getSelectedEleveName(): string {
    const eleveId = this.inscriptionFormGroup.get('eleveId')?.value;
    if (!eleveId || !this.eleves || this.eleves.length === 0) {
      return '';
    }
    const eleve = this.eleves.find(e => Number(e.id) === Number(eleveId));
    return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
  }


  getClasses() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classes = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getSelectedClasseName(): string {
    const classeId = this.inscriptionFormGroup.get('classeId')?.value;
    if (!classeId || !this.classes || this.classes.length === 0) {
      return '';
    }
    const classe = this.classes.find(c => Number(c.id) === Number(classeId));
    return classe?.libelle ?? '';
  }

  getAnneeScolaires() {
    this.referentielService.getAllAnneeScolaires().subscribe(
      (data: any[]) => {
        this.anneeScolaires = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getSelectedAnneeName(): string {
    const anneeId = this.inscriptionFormGroup.get('anneeScolaireId')?.value;
    if (!anneeId || !this.anneeScolaires || this.anneeScolaires.length === 0) {
      return '';
    }
    const annee = this.anneeScolaires.find(c => Number(c.id) === Number(anneeId));
    return annee?.libelle ?? '';
  }

  getMoyenPaiementList() {
    this.referentielService.getAllTypeMoyenPaiements().subscribe(
      (data: any[]) => {
        this.moyenPaiementList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  /*
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
  }*/

  trackFormFieldsForFrais() {
    if (!this.inscriptionFormGroup) {
      console.warn('trackFormFieldsForFrais: Formulaire non initialisé');
      return;
    }

    console.log('Mise en place des observateurs pour le suivi des frais');

    this.inscriptionFormGroup.get('classeId')?.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(300)
    ).subscribe(classeId => {
      const anneeScolaireId = this.inscriptionFormGroup.get('anneeScolaireId')?.value;
      console.log('Changement de classe détecté:', { classeId, anneeScolaireId });
      if (classeId && anneeScolaireId) {
        this.chargerFrais(Number(classeId), Number(anneeScolaireId));
      }
    });

    this.inscriptionFormGroup.get('anneeScolaireId')?.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(300)
    ).subscribe(anneeScolaireId => {
      const classeId = this.inscriptionFormGroup.get('classeId')?.value;
      console.log('Changement d\'année scolaire détecté:', { classeId, anneeScolaireId });
      if (classeId && anneeScolaireId) {
        this.chargerFrais(Number(classeId), Number(anneeScolaireId));
      }
    });
  }

  chargerFrais111(classeId: number, anneeScolaireId: number): void {
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

  chargerFrais(classeId: number, anneeScolaireId: number): void {
    console.log('Appel à chargerFrais:', { classeId, anneeScolaireId });

    if (!classeId || !anneeScolaireId) {
      this.erreur.set('Veuillez sélectionner une classe et une année scolaire valides.');
      return;
    }
    if (this.chargement()) return;

    this.chargement.set(true);
    this.erreur.set(null);

    console.log('Appel API:', `/myschool/api/referentiel/calculer-frais?classeId=${classeId}&anneeScolaireId=${anneeScolaireId}`);

    this.referentielService.obtenirFraisInscription(classeId, anneeScolaireId).subscribe({
      next: (data) => {
        console.log('Frais récupérés avec succès:', data);
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

  getInscriptionByCodeEleve(code: string) {
    this.dossierEleveService.getInscriptionByCodeEleve(code).subscribe({
      next: (data) => {
        this.inscription = data;
        this.inscriptionId = this.inscription.id;
        this.initializeInscriptionForm(this.inscription);
      }
    });
  }

  ajouterEditInscription() {
    const payload = this.inscriptionFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.dossierEleveService.saveInscription(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'L\'élève a été inscrit avec succès !!! ');
            this.router.navigate(['admin/dossier-eleve/inscriptions'])
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
          }
        },

        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.dossierEleveService.updateInscription(this.inscriptionId!, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'L\inscription a été modifiée avec succès !!! ');
            this.router.navigate(['admin/dossier-eleve/inscriptions'])
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

  }

  goBack() {
    this.router.navigate(['admin/dossier-eleve/inscriptions'])
  }
}