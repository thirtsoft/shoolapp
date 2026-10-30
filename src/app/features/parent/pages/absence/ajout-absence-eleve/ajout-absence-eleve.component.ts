import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AttendanceSource } from '../../../../../core/enumeration/type-signalement';
import { AttendanceRecord } from '../../../../../core/models/dossiereleve/absence/attendanceRecordedit';
import { ListeEleve } from '../../../../../core/models/dossiereleve/liste-eleve';
import { Inscription } from '../../../../../core/models/dossiereleve/request/inscription';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';


import { SlicePipe } from '@angular/common';
import { CoursParentAbsenceResponse } from '../../../../../core/models/parent/cours-parent-absence-response.model';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ParentSessionService } from '../../../service/parent-session.service';

@Component({
  selector: 'app-ajout-absence-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
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

  coursList: CoursParentAbsenceResponse[] = [];

  allClassesList: ListeClasse[] = [];

  selectedClass: any;

  attendanceStatusList: string[] = ['ABSENCE', 'RETARD'];

  lateMinutes?: number;
  inscription: Inscription = {};

  title = 'Déclarer une absence';

  eleveResume: any;

  private readonly coursService = inject(PlanificationResourceService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly parentSession = inject(ParentSessionService);

  constructor() {
    this.attendanceRecordId = this.activeRoute.snapshot.params['id'];
    const eleve = this.parentSession.getEleveResume();
    if (eleve) {
      this.eleveId = eleve.id;
      this.classeId = eleve.classeId;
      this.eleveResume = eleve;
    }
  }


  ngOnInit(): void {
    this.initializeForm(null);
    this.chargerLesDonnees();
    this.setupAttendanceStatusListener();
    this.setupAttendanceDateListener();
    this.setupCourseListener();

    if (this.attendanceRecordId !== null && this.attendanceRecordId !== undefined) {
      this.title = 'Modifier la déclaration absence';
      this.getAttendanceRecordById(this.attendanceRecordId);

    } else {
      this.attendanceRecordFormGroup.patchValue({ attendanceDate: this.getTodayDate() });

    }

    console.log('eleveId :', this.eleveId);
    console.log('classeId :', this.classeId);
  }

  private chargerLesDonnees(): void {
    this.referentielResourceService
      .getResourceList('sessionsemestre')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.sessionSemestreList = data;
        }
      });


    this.referentielResourceService
      .getResourceList('classe')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.classeList = data;
        }
      });


    this.referentielResourceService
      .getResourceList('anneescolaire')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.anneeScolaireList = data;
        }
      });
  }

  getCoursList(date: string): void {
    if (!this.eleveId) {
      console.warn('Impossible de charger les cours : eleveId absent');
      this.coursList = [];
      return;
    }

    if (!this.classeId) {
      console.warn('Impossible de charger les cours : classeId absent');
      this.coursList = [];
      return;
    }

    if (!date) {
      this.coursList = [];
      return;
    }

    this.coursService
      .getCoursPourAbsenceParent(Number(this.eleveId), Number(this.classeId), date)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: CoursParentAbsenceResponse[]) => {

          this.coursList = data ?? [];

          const courseId = this.attendanceRecordFormGroup.get('courseId')?.value;

          if (courseId) {

            const coursExiste = this.coursList.some(cours => Number(cours.coursId) === Number(courseId));

            if (!coursExiste) {
              this.attendanceRecordFormGroup.patchValue({
                courseId: null,
                expectedTime: null
              });
            }
          }
        },

        error: (error: any) => {
          console.error('Erreur lors du chargement des cours :', error);

          this.coursList = [];

          this.toastService.error(
            'Erreur', 'Impossible de récupérer les cours pour cette date.'
          );
        }
      });
  }

  setupCourseListener(): void {
    this.attendanceRecordFormGroup
      .get('courseId')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((courseId: number | null) => {

        if (!courseId) {
          this.attendanceRecordFormGroup.patchValue({
            expectedTime: null
          });

          return;
        }

        const cours = this.coursList.find(item => Number(item.coursId) === Number(courseId));

        if (!cours) {
          return;
        }

        const heureDebut = cours.heureDebut?.substring(0, 5) ?? null;

        this.attendanceRecordFormGroup.patchValue({
          expectedTime: heureDebut
        });

        if (this.attendanceRecordFormGroup.get('attendanceStatus')?.value === 'RETARD') {
          this.calculateLateMinutes();
        }

      });
  }

  setupAttendanceDateListener(): void {
    this.attendanceRecordFormGroup
      .get('attendanceDate')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date: string | null) => {

        if (!date) {

          this.coursList = [];

          this.attendanceRecordFormGroup.patchValue({
            courseId: null,
            expectedTime: null
          });

          return;
        }

        this.getCoursList(date);

      });
  }

  setupAttendanceStatusListener(): void {
    this.attendanceRecordFormGroup
      .get('attendanceStatus')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status: string) => {

        const courseControl = this.attendanceRecordFormGroup.get('courseId');
        const expectedTimeControl = this.attendanceRecordFormGroup.get('expectedTime');
        const arrivalTimeControl = this.attendanceRecordFormGroup.get('arrivalTime');

        if (status === 'RETARD') {
          courseControl?.setValidators([Validators.required]);
          expectedTimeControl?.setValidators([Validators.required]);
          arrivalTimeControl?.setValidators([Validators.required]);

        } else {
          courseControl?.setValidators([Validators.required]);
          expectedTimeControl?.clearValidators();
          arrivalTimeControl?.clearValidators();
          this.attendanceRecordFormGroup.patchValue({
            expectedTime: null,
            arrivalTime: null,
            lateMinutes: null
          });

          this.lateMinutes = undefined;
        }

        courseControl?.updateValueAndValidity();
        expectedTimeControl?.updateValueAndValidity();
        arrivalTimeControl?.updateValueAndValidity();

      });
  }

  calculateLateMinutes(): void {
    const expectedTime = this.attendanceRecordFormGroup.get('expectedTime')?.value;
    const arrivalTime = this.attendanceRecordFormGroup.get('arrivalTime')?.value;

    if (!expectedTime || !arrivalTime) {
      this.lateMinutes = undefined;
      this.attendanceRecordFormGroup.patchValue({
        lateMinutes: null
      });

      return;
    }

    const [expectedHour, expectedMinute] = expectedTime.split(':').map(Number);

    const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);

    const expectedTotalMinutes = expectedHour * 60 + expectedMinute;
    const arrivalTotalMinutes = arrivalHour * 60 + arrivalMinute;
    this.lateMinutes = arrivalTotalMinutes - expectedTotalMinutes;

    if (this.lateMinutes < 0) {
      this.lateMinutes = 0;
      this.toastService.warning(
        "L'heure d'arrivée ne peut pas être avant l'heure prévue",
        'Attention'
      );
    }

    this.attendanceRecordFormGroup.patchValue({
      lateMinutes: this.lateMinutes
    });

    if (this.lateMinutes > 60) {

      this.toastService.info(
        `Retard de ${this.lateMinutes} minutes, considéré comme demi-absence`,
        'Information'
      );
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

  initializeForm(absence: AttendanceRecord | null): void {
    this.attendanceRecordFormGroup =
      this._formBuilder.group({
        id: [absence?.id ?? ''],
        sessionSemestre: [absence?.sessionSemestre ?? '', Validators.required],
        anneeScolaireId: [absence?.anneeScolaireId ?? '', Validators.required],
        courseId: [absence?.courseId ?? '', Validators.required],
        justificationReason: [absence?.justificationReason ?? ''],
        attendanceDate: [absence?.attendanceDate ?? '', Validators.required],
        attendanceStatus: [absence?.attendanceStatus ?? '', Validators.required],
        expectedTime: [absence?.expectedTime ?? ''],
        arrivalTime: [absence?.arrivalTime ?? ''],
        lateMinutes: [absence?.lateMinutes ?? '']
      });
  }

  getAttendanceRecordById(absenceId: number): void {
    this.coursService
      .getSingleResource('attendancerecord', absenceId,)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: any) => {

          this.attendanceRecord = data;
          const recordData = this.attendanceRecord.attendanceRecordAddEditDTO;

          if (recordData) {
            this.fillFormWithData(recordData);

          }
        },

        error: (error: any) => {
          console.error('Erreur lors du chargement :', error);

          this.toastService.error(
            'Erreur',
            "Impossible de charger les données de l'absence"
          );
        }
      });
  }


  fillFormWithData(recordData: any): void {
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

  ajouterEditAbsence(): void {
    if (!this.attendanceRecordFormGroup.valid) {
      this.attendanceRecordFormGroup.markAllAsTouched();
      return;
    }

    const payload: AttendanceRecord = this.attendanceRecordFormGroup.value;
    payload.attendanceSource = AttendanceSource.PARENT;
    payload.eleveId = this.eleveId;

    if (this.attendanceRecordId === null || this.attendanceRecordId === undefined) {

      this.coursService
        .createRessource('attendancerecord', payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({

          next: () => {

            this.toastService.success(
              'Succès', 'Absence déclarée avec succès.'
            );

            this.goBack();
          },

          error: (error: any) => {

            console.error(
              'Erreur lors de la création :',
              error
            );

            this.toastService.error(
              'Erreur',
              error?.error?.message || "Erreur lors de la création de l'absence."
            );
          }

        });

      return;
    }


    this.coursService
      .updateResource('attendancerecord', Number(this.attendanceRecordId), payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          this.toastService.success(
            'Succès', 'Absence modifiée avec succès.'
          );

          this.goBack();
        },

        error: (error: any) => {

          console.error(
            'Erreur lors de la modification :',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ||
            "Erreur lors de la modification de l'absence."
          );
        }

      });
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goBack(): void {
    void this.router.navigate(['/parent/absences']);
  }

}