import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EnseigantList } from '../../../../../../core/models/enseignant/enseignant-list';
import { Enseignement } from '../../../../../../core/models/planification/enseignement';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { EnseignantService } from '../../../../../enseignant/service/enseignant.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-planifier-enseignement',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './planifier-enseignement.component.html',
  styleUrls: ['./planifier-enseignement.component.css']
})
export class PlanifierEnseignementComponent implements OnInit {

  errorMessage?: string;
  enseignementId?: number;
  enseignementFormGroup!: FormGroup;
  enseignement: any;
  isEdit: boolean = false;

  classeList: ListeClasse[] = [];
  matiereList: Matiere[] = [];
  enseigantList: EnseigantList[] = [];
  anneeScolaireList: AnneeScolaire[] = [];
  ecoleId?: number;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Planifier un enseignement";

  enseignementsItems?: FormArray;

  disableAddButton = false;

  private readonly planification = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
  ) {
    this.enseignementId = this.activeRoute.snapshot.params['id'] ? Number(this.activeRoute.snapshot.params['id']) : undefined;
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.loadReferentiels();
    this.initializeForm();
    if (this.enseignementId) {
      this.title = 'Modifier un enseignement';
      this.isEdit = true;
      this.getEnseignement(this.enseignementId);
    }
  }

  private getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.utilisateur = data,
        error: error => console.error('Erreur utilisateur:', error)
      });
  }

  private loadReferentiels() {
    this.referentielService.getAllClasses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.classeList = data
    });

    this.referentielService.getAllMatieres().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.matiereList = data
    });

    this.referentielService.getAllAnneeScolaires().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.anneeScolaireList = data
    });

    this.enseignantService.getAllEnseignants().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.enseigantList = data
    });
  }


  private getEnseignement(enseignementId: number) {
    this.planification.getSingleResource('planification/enseignement', enseignementId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.populateFormForEdit(data);
        },
        error: (error) => {
          console.error('Erreur chargement enseignement:', error);
          this.toastService.error('Erreur', 'Erreur lors du chargement de l\'enseignement');
        }
      });
  }

  private initializeForm() {
    this.enseignementFormGroup = this._formBuilder.group({
      enseignements: this._formBuilder.array([])
    });

    if (!this.enseignementId) {
      this.addEnseignementItem();
    }
  }

  private populateFormForEdit(enseignement: Enseignement) {
    this.enseignementsArray.clear();
    this.enseignementsArray.push(this.createEnseignementItem(enseignement));
    this.disableAddButton = true;
  }

  get enseignementsArray(): FormArray {
    return this.enseignementFormGroup.get('enseignements') as FormArray;
  }

  createEnseignementItem(enseignement: any | null = null): FormGroup {
    if (!enseignement) {
      return this._formBuilder.group({
        id: [''],
        description: [''],
        enseignant: ['', Validators.required],
        classe: ['', Validators.required],
        anneeScolaire: ['', Validators.required],
        matiere: ['', Validators.required],
        dateDebut: ['', Validators.required],
        dateFin: [''],
        estProfPrincipal: [false]
      });
    }
    return this._formBuilder.group({
      id: [enseignement.id || ''],
      description: [enseignement.description || ''],
      enseignant: [enseignement.enseignant?.id || enseignement.enseignant || '', Validators.required],
      classe: [enseignement.classe?.id || enseignement.classe || '', Validators.required],
      anneeScolaire: [enseignement.anneeScolaire?.id || enseignement.anneeScolaire || '', Validators.required],
      matiere: [enseignement.matiere?.id || enseignement.matiere || '', Validators.required],
      dateDebut: [enseignement.dateDebut || '', Validators.required],
      dateFin: [enseignement.dateFin || ''],
      estProfPrincipal: [enseignement.estProfPrincipal || false],
      ecole: this.ecoleId
    });
  }

  onAddEnseignementItems() {
    if (this.isEdit) {
      this.toastService.warning('Information', 'Vous ne pouvez pas ajouter d\'enseignement en mode modification');
      return;
    }
    this.addEnseignementItem();
  }

  addEnseignementItem(enseignement: Enseignement | null = null) {
    // this.enseignementsArray.insert(0, this.createEnseignementItem(enseignement));
    this.enseignementsArray.push(this.createEnseignementItem(enseignement));
  }

  removeEnseignementItem(index: number) {
    if (this.enseignementsArray.length > 1) {
      this.enseignementsArray.removeAt(index);
    }
  }

  getEnseignementsValues(): any[] {
    return this.enseignementsArray.value;
  }

  ajouteditEnseignement() {
    if (this.enseignementFormGroup.valid) {
      const enseignements = this.getEnseignementsValues();
      if (this.isEdit) {
        this.updateSingleEnseignement(enseignements[0]);
      } else {
        this.creerPlusieursEnseignements(enseignements);
      }
    } else {
      this.markFormGroupTouched(this.enseignementFormGroup);
      this.toastService.error('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
    }
  }

  creerPlusieursEnseignements(enseignements: any[]) {
    const payload = {
      enseignementAddEditDTOList: enseignements.map(enseignement => this.formatEnseignementForAPI(enseignement))
    };

    this.planification.createMultipleRessource('planification/enseignement', payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('Succès', `${enseignements.length} enseignement(s) créé(s) avec succès !`);
          this.router.navigate(['admin/planification/enseignement']);
        } else if (data.statut === 'FAILED') {
          this.toastService.error('Erreur', 'Erreur lors de la création : ' + data.message);
        }
      },
      error: (error) => {
        console.error('Erreur création bulk:', error);
        this.toastService.error('Erreur', 'Erreur lors de la création des enseignements : ' + error.error);
      }
    });
  }

  /*
  formatEnseignementForAPI(enseignement: any): any {
    const enseignantId = enseignement.enseignant?.id || enseignement.enseignant;
    const classeId = enseignement.classe?.id || enseignement.classe;
    const anneeScolaireId = enseignement.anneeScolaire?.id || enseignement.anneeScolaire;
    const matiereId = enseignement.matiere?.id || enseignement.matiere;
    return {
      id: enseignement.id || null,
      description: enseignement.description || '',
      enseignant: Number(enseignantId),
      classe: Number(classeId),
      anneeScolaire: Number(anneeScolaireId),
      matiere: Number(matiereId),
      dateDebut: enseignement.dateDebut,
      dateFin: enseignement.dateFin || null,
      actif: 1,
      estProfPrincipal: enseignement.estProfPrincipal || false,
      ecole: this.ecoleId
    };
  }*/

  private formatEnseignementForAPI(enseignement: any): any {
    return {
      id: enseignement.id ? Number(enseignement.id) : null,
      description: enseignement.description || '',
      enseignant: Number(enseignement.enseignant),
      classe: Number(enseignement.classe),
      anneeScolaire: Number(enseignement.anneeScolaire),
      matiere: Number(enseignement.matiere),
      dateDebut: enseignement.dateDebut,
      dateFin: enseignement.dateFin || null,
      actif: 1,
      estProfPrincipal: !!enseignement.estProfPrincipal,
      ecole: this.ecoleId
    };
  }

  updateSingleEnseignement(enseignement: any) {
    const payload = this.formatEnseignementForAPI(enseignement);
    if (!this.enseignementId) return;
    this.planification.updateResource('planification/enseignement', this.enseignementId, payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('Succès', 'L\'enseignement a été modifié avec succès !');
          this.router.navigate(['admin/planification/enseignement']);
        } else if (data.statut === 'FAILED') {
          this.toastService.error('Erreur', 'Erreur lors de la modification : ' + data.message);
        }
      },
      error: (error) => {
        console.error('Erreur modification:', error);
        this.toastService.error('Erreur', 'Erreur lors de la modification : ' + error.error);
      }
    });
  }

  markFormGroupTouched(formGroup: any | FormArray) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });

  }

  goBack() {
    this.router.navigate(['admin/planification/enseignement'])
  }


}
