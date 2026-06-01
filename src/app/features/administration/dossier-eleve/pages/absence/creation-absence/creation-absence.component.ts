import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TypeSignalement } from '../../../../../../core/enumeration/type-signalement';
import { AttendanceRecord } from '../../../../../../core/models/dossiereleve/absence/attendanceRecordedit';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { ListeCours } from '../../../../../../core/models/planification/liste-cours';
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
  attendanceRecordFormGroup!: FormGroup;
  attendanceRecord?: any;
  attendanceRecordId?: number;
  eleveId?: number;
  anneeScolaireList: AnneeScolaire[] = [];
  semestreList: Semestre[] = [];
  eleveList: ListeEleve[] = [];
  classeList: Classe[] = [];
  coursList: ListeCours[] = [];
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
    this.attendanceRecordId = this.activeRoute.snapshot.params['id'];
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId')!;
    this.getConnectedUserInfos();
    this.getClasseList();
    this.getAnneeSclaireList();
    this.getSemestresList();
    this.initializeForm(null);
    if (this.attendanceRecordId != null && this.attendanceRecordId != undefined) {
      this.getAttendanceRecordById(this.attendanceRecordId);
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

  getCoursList(classId: number) {
    this.coursService.getListeCoursByClasse(classId).subscribe(
      (data: any[]) => {
        this.coursList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  onClasseSelected() {
    const classId = this.attendanceRecordFormGroup.get('classId')?.value;
    if (classId) {
      this.getEleveList(classId);
      this.getCoursList(classId);
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

  initializeForm(absence: AttendanceRecord | null) {
    /*
    this.attendanceRecordFormGroup = this._formBuilder.group({
      id: [absence?.id ? absence.id : ''],
      eleveId: [absence?.eleveId ? absence.eleveId : '', Validators.required],
      semestre: [absence?.semestre ? absence.semestre : '', Validators.required],
      anneeScolaireId: [absence?.anneeScolaireId ? absence.anneeScolaireId : '', Validators.required],
      motif: [absence?.motif ? absence.motif : '', Validators.required],
      justifiee: [absence?.justifiee ? absence.justifiee : '', Validators.required],
      dateAbsence: [absence?.dateAbsence ? absence.dateAbsence : '', Validators.required],
      classId: [absence?.classId ? absence.classId : '', Validators.required],
    })*/

  }

  getAttendanceRecordById(absenceId: number) {
    this.coursService.getSingleResource('attendancerecord', absenceId).subscribe({
      next: (data: any) => {
        this.attendanceRecord = data;
        this.initializeForm(this.attendanceRecord);

        if (this.attendanceRecord?.classId) {

          this.attendanceRecordFormGroup.get("classId")!.patchValue(this.attendanceRecord.classId);
          this.getEleveList(this.attendanceRecord.classId);
        }
      }
    });
  }


  ajouterEditAbsence() {
    const payload: AttendanceRecord = this.attendanceRecordFormGroup.value;
    payload.declaredByUserId = this.userId;
    payload.typeSignalement = TypeSignalement.ADMIN;
    payload.ecole = this.ecoleId;
    if (this.attendanceRecordId === null || this.attendanceRecordId === undefined) {
      this.coursService.createRessource('attendancerecord', payload).subscribe({
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
      this.coursService.updateResource('attendancerecord', this.attendanceRecordId, payload).subscribe({
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
