import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AttendanceSource } from '../../../../../core/enumeration/type-signalement';
import { AttendanceRecord } from '../../../../../core/models/dossiereleve/absence/attendanceRecordedit';
import { ListeEleve } from '../../../../../core/models/dossiereleve/liste-eleve';
import { Inscription } from '../../../../../core/models/dossiereleve/request/inscription';
import { ListeCours } from '../../../../../core/models/planification/liste-cours';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';

@Component({
  selector: 'app-ajout-absence-eleve',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-absence-eleve.component.html',
  styleUrls: ['./ajout-absence-eleve.component.css']
})
export class AjoutAbsenceEleveComponent implements OnInit {

  errorMessage?: string;
  attendanceRecordFormGroup!: FormGroup;
  attendanceRecord?: any;
  attendanceRecordId?: number;
  eleveId?: number;
  classeId?: number;
  anneeScolaireList: AnneeScolaire[] = [];
  sessionSemestreList: SessionSemestre[] = [];
  eleveList: ListeEleve[] = [];
  classeList: ListeClasse[] = [];
  coursList: ListeCours[] = [];
  allClassesList: ListeClasse[] = [];
  selectedClass: any;

  attendanceStatusList: string[] = ['ABSENCE', 'RETARD', 'MALADIE'];

  lateMinutes?: any;
  ecoleId: any;
  userId?: number;
  utilisateur: Utilisateur = {};
  inscription: Inscription = {};

  title = "Déclarer une absence";

  private readonly coursService = inject(PlanificationResourceService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly localStorage = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly referentielResourceService = inject(ReferentielResourceService);


  constructor(
  ) {
    this.attendanceRecordId = this.activeRoute.snapshot.params['id'];
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesDonnees();

    this.initializeForm(null);

    this.setupAttendanceStatusListener();

    console.log('Classid', this.classeId);

    if (this.attendanceRecordId != null && this.attendanceRecordId != undefined) {
      this.getAttendanceRecordById(this.attendanceRecordId, AttendanceSource.PARENT);
      this.title = 'Modifier la déclaration absence';
    }

    if (this.classeId != null && this.classeId != undefined) {
      this.getCoursList(this.classeId);
    }


  }

  private chargerLesDonnees() {
    this.referentielResourceService.getResourceList('sessionsemestre').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.sessionSemestreList = data;
      }
    });

    this.referentielResourceService.getResourceList('classe').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.classeList = data
    });

    this.referentielResourceService.getResourceList('anneescolaire').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.anneeScolaireList = data
    });
  }

  getCoursList(classId: number) {
    this.coursService.getListeCoursByClasse(classId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.coursList = data
    });
  }


  setupAttendanceStatusListener() {
    this.attendanceRecordFormGroup.get('attendanceStatus')?.valueChanges.subscribe((status) => {
      if (status === 'RETARD') {
        this.attendanceRecordFormGroup.get('courseId')?.setValidators([Validators.required]);
        this.attendanceRecordFormGroup.get('expectedTime')?.setValidators([Validators.required]);
        this.attendanceRecordFormGroup.get('arrivalTime')?.setValidators([Validators.required]);
      } else {
        this.attendanceRecordFormGroup.get('courseId')?.clearValidators();
        this.attendanceRecordFormGroup.get('expectedTime')?.clearValidators();
        this.attendanceRecordFormGroup.get('arrivalTime')?.clearValidators();

        if (status !== 'RETARD') {
          this.attendanceRecordFormGroup.patchValue({
            courseId: null,
            expectedTime: null,
            arrivalTime: null,
            lateMinutes: null
          });
        }
      }
      this.attendanceRecordFormGroup.get('courseId')?.updateValueAndValidity();
      this.attendanceRecordFormGroup.get('expectedTime')?.updateValueAndValidity();
      this.attendanceRecordFormGroup.get('arrivalTime')?.updateValueAndValidity();
    });
  }

  calculateLateMinutes() {
    const expectedTime = this.attendanceRecordFormGroup.get('expectedTime')?.value;
    const arrivalTime = this.attendanceRecordFormGroup.get('arrivalTime')?.value;

    if (expectedTime && arrivalTime) {
      const [expectedHour, expectedMinute] = expectedTime.split(':').map(Number);
      const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);

      const expectedTotalMinutes = expectedHour * 60 + expectedMinute;
      const arrivalTotalMinutes = arrivalHour * 60 + arrivalMinute;

      this.lateMinutes = arrivalTotalMinutes - expectedTotalMinutes;

      if (this.lateMinutes < 0) {
        this.lateMinutes += 24 * 60;
      }

      if (this.lateMinutes < 0) {
        this.lateMinutes = 0;
        this.toastService.warning('Attention', "L'heure d'arrivée ne peut pas être avant l'heure prévue");
      }

      this.attendanceRecordFormGroup.patchValue({
        lateMinutes: this.lateMinutes
      });

      if (this.lateMinutes > 60) {
        this.toastService.info('Information', `Retard de ${this.lateMinutes} minutes, considéré comme demi-absence`);
      }
    }
  }

  isRetardJustifie(): boolean {
    const lateMinutes = this.attendanceRecordFormGroup.get('lateMinutes')?.value;
    const justified = this.attendanceRecordFormGroup.get('justified')?.value;
    if (lateMinutes > 30 && !justified) {
      return false;
    }
    return true;
  }


  initializeForm(absence: AttendanceRecord | null) {
    this.attendanceRecordFormGroup = this._formBuilder.group({
      id: [absence?.id ? absence.id : ''],
      sessionSemestre: [absence?.sessionSemestre ?? '', Validators.required],
      anneeScolaireId: [absence?.anneeScolaireId ?? '', Validators.required],
      courseId: [absence?.courseId ?? ''],
      justificationReason: [absence?.justificationReason ?? ''],
      attendanceDate: [absence?.attendanceDate ?? ''],
      attendanceStatus: [absence?.attendanceStatus ?? '', Validators.required],
      expectedTime: [absence?.expectedTime ?? ''],
      arrivalTime: [absence?.arrivalTime ?? ''],
      lateMinutes: [absence?.lateMinutes ?? ''],
    })
  }

  getAttendanceRecordById(absenceId: number, source: string) {
    this.coursService.getSingleResourceAttendRecordByMultiplesParameters('attendancerecord', absenceId, source).subscribe({
      next: (data: any) => {
        this.attendanceRecord = data;
        const recordData = this.attendanceRecord.attendanceRecordAddEditDTO;

        if (recordData) {
          this.fillFormWithData(recordData);
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement:', error);
        this.toastService.error('Erreur', 'Impossible de charger les données de l\'absence');
      }
    });
  }

  fillFormWithData(recordData: any) {
    this.attendanceRecordFormGroup.patchValue({
      id: recordData.id,
      anneeScolaireId: recordData.anneeScolaireId,
      sessionSemestre: recordData.sessionSemestre,
      attendanceStatus: recordData.status,
      justificationReason: recordData.justificationReason || '',
      justified: recordData.justified ? 'true' : 'false',
      attendanceDate: recordData.attendanceDate,
      courseId: recordData.courseId || null,
      expectedTime: recordData.expectedTime || null,
      arrivalTime: recordData.arrivalTime || null,
      lateMinutes: recordData.lateMinutes || null
    });

    if (recordData.status === 'RETARD' && recordData.expectedTime && recordData.arrivalTime) {
      setTimeout(() => {
        this.calculateLateMinutes();
      }, 100);
    }
  }



  ajouterEditAbsence() {
    const payload: AttendanceRecord = this.attendanceRecordFormGroup.value;
    payload.declaredByUserId = this.userId;
    payload.attendanceSource = AttendanceSource.PARENT;
    payload.eleveId = this.eleveId;
    if (this.attendanceRecordId === null || this.attendanceRecordId === undefined) {
      this.coursService.createRessource('attendancerecord', payload).subscribe({
        next: (data) => {
          this.toastService.success('success', 'Absence déclarée avec succès.');
          this.router.navigate(['/parent/absences']);
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.coursService.updateResource('attendancerecord', Number(this.attendanceRecordId), payload).subscribe({
        next: data => {
          this.toastService.success('success', 'Absence modifiée avec succès.');
          this.router.navigate(['/parent/absences']);

        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/parent/absences']);

  }


}
