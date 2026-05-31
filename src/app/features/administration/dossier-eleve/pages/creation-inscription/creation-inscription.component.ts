import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { Inscription } from '../../../../../core/models/dossiereleve/request/inscription';
import { Eleve } from '../../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { Classe } from '../../../../../core/models/referentiels/classe';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { ReferentielService } from '../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../utilisateur/service/utilisateur.service';
import { DossierEleveService } from '../../service/dossier-eleve.service';

@Component({
  selector: 'app-creation-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  classes: Classe[] = [];
  anneeScolaires: AnneeScolaire[] = [];
  eleves: Eleve[] = [];


  ecoleId: any;

  userId?: number;

  utilisateur: Utilisateur = {};

  searchTerm: string = '';
  filteredEleves: Eleve[] = [];
  isLoading: boolean = false;
  showDropdown: boolean = false;
  selectedEleveInfo: any = null;

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
    this.getConnectedUserInfos();
    this.getClasses();
    this.getAnneeScolaires();
    this.getEleves();
    this.initializeInscriptionForm(null);
    if (this.inscriptionId != null && this.inscriptionId != undefined) {
      this.getInscription(this.inscriptionId);
      this.title = 'Modifier une inscription';
      this.isEdit = true;
    }
    this.setupSearch();
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
    // Version côté client (si vous avez déjà tous les élèves en mémoire)
    if (this.eleves && this.eleves.length > 0) {
      const lowerTerm = term.toLowerCase();
      const results = this.eleves.filter(eleve =>
        eleve.nom?.toLowerCase().includes(lowerTerm) ||
        eleve.prenom?.toLowerCase().includes(lowerTerm) ||
        eleve.matricule?.toLowerCase().includes(lowerTerm)
      ).slice(0, 20); // Limiter à 20 résultats
      return of(results);
    }

    // ✅ Si pas d'élèves en mémoire, retourner un observable vide
    return of([]);
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchSubject.next(this.searchTerm);

    // Si le champ est vide, effacer la sélection
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

    // Optionnel : Marquer le champ comme touched pour valider
    this.inscriptionFormGroup.get('eleveId')?.markAsTouched();
  }

  closeDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  // Améliorez votre méthode getSelectedEleveName existante
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

  getInscription(inscriptionId: number) {
    this.dossierEleveService.getInscription(inscriptionId).subscribe({
      next: (data) => {
        this.inscription = data;
        this.initializeInscriptionForm(this.inscription);

        if (this.inscription?.eleveDTO) {
          const eleve = this.inscription.eleveDTO;
          this.selectedEleveInfo = eleve;
          this.searchTerm = `${eleve.prenom} ${eleve.nom}`;

          // Optionnel : Ajouter le matricule si disponible pour plus de précision
          if (eleve.matricule) {
            this.searchTerm += ` (${eleve.matricule})`;
          }
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
    const annee = this.classes.find(c => Number(c.id) === Number(anneeId));
    return annee?.libelle ?? '';
  }

  initializeInscriptionForm(inscription: Inscription | null) {
    this.inscriptionFormGroup = this._formBuilder.group({
      id: [inscription?.id ? inscription.id : ''],
      eleveId: [inscription?.eleveDTO?.id ? inscription?.eleveDTO?.id : '', Validators.required],
      anneeScolaireId: [inscription?.anneeScolaireDTO?.id ? inscription?.anneeScolaireDTO?.id : '', Validators.required],
      classeId: [inscription?.classeDTO?.id ? inscription?.classeDTO?.id : '', Validators.required],
      montantInscription: [inscription?.montantInscription ? inscription.montantInscription : '', Validators.required],
    });
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
