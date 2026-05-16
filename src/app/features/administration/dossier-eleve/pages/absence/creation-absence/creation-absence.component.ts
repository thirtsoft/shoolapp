import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { TypeSignalement } from '../../../../../../core/enumeration/type-signalement';
import { AbsenceEdit } from '../../../../../../core/models/dossiereleve/absence/absenceedit';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-creation-absence',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './creation-absence.component.html',
  styleUrls: ['./creation-absence.component.css']
})
export class CreationAbsenceComponent implements OnInit {

  errorMessage?: string;
  absenceFormGroup!: FormGroup;
  absence?: any;
  absenceId?: number;
  eleveId?: number;
  anneeScolaireList: AnneeScolaire[] = [];
  semestreList: Semestre[] = [];
  eleveList: ListeEleve[] = [];
  classeList: Classe[] = [];
  selectedClass: any;

  ecoleId: any;

  userId?: number;

  utilisateur: Utilisateur = {};

  title = "Ajouter une absence";

  private readonly dossierResource = inject(DossierResourceService);
  private readonly coursService = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly localStorage = inject(LocalStorageService);

  ngOnInit(): void {
    this.absenceId = this.activeRoute.snapshot.params['id'];
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId')!;
    this.getConnectedUserInfos();
    this.getClasseList();
    this.getAnneeSclaireList();
    this.getSemestresList();
    this.initializeForm(null);
    if (this.absenceId != null && this.absenceId != undefined) {
      this.getAbsenceById(this.absenceId);
      this.title = 'Modifier la déclaration absence';
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId!).subscribe({
      next: (data: any) => {
        this.utilisateur = data;
      },
      error: (error: any) => { console.log(error) },
    });
  }

  getClasseList() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classeList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getSemestresList() {
    this.referentielService.getAllSemestres().subscribe(
      (data: any[]) => {
        this.semestreList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getAnneeSclaireList() {
    this.referentielService.getAllAnneeScolaires().subscribe(
      (data: any[]) => {
        this.anneeScolaireList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  onClasseSelected() {
    const classId = this.absenceFormGroup.get('classId')?.value;
    if (classId) {
      this.getEleveList(classId);
    }
  }

  getEleveList(classId: number) {
    this.dossierResource.getResourceListByElement('inscription/classe', classId)?.subscribe({
      next: (data: any) => {
        this.eleveList = data;
        console.log('Eleves', this.eleveList);
      }
    });
  }

  initializeForm(absence: AbsenceEdit | null) {
    this.absenceFormGroup = this._formBuilder.group({
      id: [absence?.id ? absence.id : ''],
      eleveId: [absence?.eleveId ? absence.eleveId : '', Validators.required],
      semestre: [absence?.semestre ? absence.semestre : '', Validators.required],
      anneeScolaireId: [absence?.anneeScolaireId ? absence.anneeScolaireId : '', Validators.required],
      motif: [absence?.motif ? absence.motif : '', Validators.required],
      justifiee: [absence?.justifiee ? absence.justifiee : '', Validators.required],
      dateAbsence: [absence?.dateAbsence ? absence.dateAbsence : '', Validators.required],
      classId: [absence?.classId ? absence.classId : '', Validators.required],
    });
  }

  getAbsenceById(absenceId: number) {
    this.coursService.getSingleResource('absence', absenceId).subscribe({
      next: (data: any) => {
        this.absence = data;
        this.initializeForm(this.absence);

        if (this.absence?.classId) {

          this.absenceFormGroup.get("classId")!.patchValue(this.absence.classId);
          this.getEleveList(this.absence.classId);
        }
      }
    });
  }


  ajouterEditAbsence() {
    const payload: AbsenceEdit = this.absenceFormGroup.value;
    payload.createur = this.userId;
    payload.typeSignalement = TypeSignalement.ADMIN;
    payload.ecole = this.ecoleId;
    if (this.absenceId === null || this.absenceId === undefined) {
      this.coursService.createRessource('absence', payload).subscribe({
        next: (data) => {
          this.toastService.success('success', 'Absence ajoutée avec succès.');
          this.goBack();
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.coursService.updateResource('absence', this.absenceId, payload).subscribe({
        next: (data: any) => {
          this.toastService.success('success', 'Absence modifiée avec succès.');
          this.goBack();
        },
        error: (data: any) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }

  }

  goBack() {
    this.router.navigate(['/admin/dossier-eleve/absence']);
  }

}
