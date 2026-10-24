import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AttendanceRecord } from '../../../../../../core/models/dossiereleve/absence/attendanceRecordedit';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { ListeCours } from '../../../../../../core/models/planification/liste-cours';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { LocalStorageService } from '../../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
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

  anneeScolaireList: AnneeScolaire[] = [];
  sessionSemestreList: SessionSemestre[] = [];
  eleveList: ListeEleve[] = [];
  classeList: ListeClasse[] = [];
  allClassesList: ListeClasse[] = [];
  coursList: ListeCours[] = [];

  attendanceStatusList: string[] = ['PRESENCE', 'ABSENCE', 'RETARD', 'EXCLUSION',];

  lateMinutes = 0;

  title = 'Ajouter une absence';

  private readonly dossierResource = inject(DossierResourceService);
  private readonly coursService = inject(PlanificationResourceService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly referentielResourceService = inject(ReferentielResourceService);

  ngOnInit(): void {
    const id = this.activeRoute.snapshot.params['id'];
    this.attendanceRecordId = id ? Number(id) : undefined;
    this.initializeForm(null);
    this.setupAttendanceStatusListener();
    this.chargerLesDonnees();
    if (this.attendanceRecordId != null) {
      this.title = 'Modifier la déclaration absence';
      this.getAttendanceRecordById(this.attendanceRecordId);
    }
  }

  private chargerLesDonnees(): void {
    this.referentielResourceService
      .getResourceList('sessionsemestre')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.sessionSemestreList = data;
        }
      });

    this.referentielResourceService
      .getResourceList('classe')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.classeList = data;
        }
      });

    this.referentielResourceService
      .getResourceList('anneescolaire')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.anneeScolaireList = data;
        }
      });
  }

  onClasseSelected(): void {
    const classId = this.attendanceRecordFormGroup.get('classId')?.value;
    if (!classId) {
      this.eleveList = [];
      this.coursList = [];

      this.attendanceRecordFormGroup.patchValue({
        eleveId: null,
        courseId: null
      });

      return;
    }

    this.getEleveList(Number(classId));
    this.getCoursList(Number(classId));
  }

  private getEleveList(classId: number): void {

    this.dossierResource.getResourceListByElement('inscription/classe', classId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.eleveList = data;
        },
        error: () => {
          this.eleveList = [];
          this.toastService.error(
            'Erreur',
            'Impossible de charger les élèves de la classe.'
          );
        }
      });
  }

  private getCoursList(classId: number): void {
    this.coursService
      .getListeCoursByClasse(classId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: ListeCours[]) => {
          this.coursList = data;
        },
        error: () => {
          this.coursList = [];
          this.toastService.error(
            'Erreur',
            'Impossible de charger les cours de la classe.'
          );
        }
      });
  }

  private initializeForm(absence: AttendanceRecord | null): void {
    this.attendanceRecordFormGroup = this.formBuilder.group({
      id: [absence?.id ?? null],
      eleveId: [absence?.eleveId ?? null, Validators.required],
      sessionSemestre: [absence?.sessionSemestre ?? null, Validators.required],
      anneeScolaireId: [absence?.anneeScolaireId ?? null, Validators.required],
      courseId: [absence?.courseId ?? null],
      justificationReason: [absence?.justificationReason ?? ''],
      attendanceDate: [absence?.attendanceDate ?? null, Validators.required],
      classId: [absence?.classId ?? null, Validators.required],
      attendanceStatus: [absence?.attendanceStatus ?? null, Validators.required],
      justified: [absence?.justified ?? null, Validators.required],
      expectedTime: [absence?.expectedTime ?? null],
      arrivalTime: [absence?.arrivalTime ?? null],
      lateMinutes: [absence?.lateMinutes ?? null]
    });
  }

  private setupAttendanceStatusListener(): void {
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
          courseControl?.clearValidators();
          expectedTimeControl?.clearValidators();
          arrivalTimeControl?.clearValidators();
          this.attendanceRecordFormGroup.patchValue(
            {
              courseId: null,
              expectedTime: null,
              arrivalTime: null,
              lateMinutes: null
            },
            {
              emitEvent: false
            }
          );

          this.lateMinutes = 0;
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
      this.lateMinutes = 0;
      return;
    }

    const [expectedHour, expectedMinute] = expectedTime.split(':').map(Number);
    const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);
    const expectedTotalMinutes = expectedHour * 60 + expectedMinute;
    const arrivalTotalMinutes = arrivalHour * 60 + arrivalMinute;
    const difference = arrivalTotalMinutes - expectedTotalMinutes;

    if (difference < 0) {
      this.lateMinutes = 0;
      this.attendanceRecordFormGroup.patchValue(
        {
          lateMinutes: 0
        },
        {
          emitEvent: false
        }
      );
      this.toastService.warning(
        'Attention',
        "L'heure d'arrivée ne peut pas être avant l'heure prévue."
      );
      return;
    }
    this.lateMinutes = difference;
    this.attendanceRecordFormGroup.patchValue(
      {
        lateMinutes: difference
      },
      {
        emitEvent: false
      }
    );
    if (difference > 60) {
      this.toastService.info(
        'Information',
        `Retard de ${difference} minutes, considéré comme demi-absence.`
      );
    }
  }

  isRetardJustifie(): boolean {
    const lateMinutes = Number(this.attendanceRecordFormGroup.get('lateMinutes')?.value ?? 0);
    const justified = this.attendanceRecordFormGroup.get('justified')?.value;
    return !(lateMinutes > 30 && !justified);
  }

  private getAttendanceRecordById(absenceId: number): void {
    this.coursService
      .getSingleResource(
        'attendancerecord',
        absenceId
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: any) => {

          this.attendanceRecord = data;

          const recordData =
            data.attendanceRecordEditAdminDTO ??
            data.attendanceRecordAddEditDTO ??
            data;

          if (!recordData) {
            this.toastService.error(
              'Erreur',
              'Les données de l’absence sont introuvables.'
            );
            return;
          }

          this.fillFormWithData(recordData);

          this.loadRequiredLists(recordData);
        },

        error: (error: any) => {

          console.error(
            'Erreur lors du chargement de l’absence :',
            error
          );

          this.toastService.error(
            'Erreur',
            "Impossible de charger les données de l'absence."
          );
        }
      });
  }

  private fillFormWithData(recordData: any): void {
    this.attendanceRecordFormGroup.patchValue({
      id: recordData.id,
      eleveId: recordData.eleveId,
      classId: recordData.classeId,
      anneeScolaireId: recordData.anneeScolaireId,
      sessionSemestre: recordData.sessionSemestre,
      attendanceStatus: recordData.status,
      justificationReason: recordData.justificationReason ?? '',
      justified: recordData.justified ?? null,
      attendanceDate: recordData.attendanceDate,
      courseId: recordData.courseId ?? null,
      expectedTime: recordData.expectedTime ?? null,
      arrivalTime: recordData.arrivalTime ?? null,
      lateMinutes: recordData.lateMinutes ?? null
    });
    if (recordData.classeId) {
      this.getEleveList(recordData.classeId);
      this.getCoursList(recordData.classeId);
    }
    if (
      recordData.status === 'RETARD' &&
      recordData.expectedTime &&
      recordData.arrivalTime
    ) {
      setTimeout(() => { this.calculateLateMinutes(); });
    }
  }

  private loadRequiredLists(recordData: any): void {
    if (recordData.toutesLesClasses && recordData.toutesLesClasses.length > 0) {
      this.allClassesList = recordData.toutesLesClasses;
      this.classeList = recordData.toutesLesClasses;
    }
    if (recordData.classeId && recordData.elevesDeLaClasse) {
      this.eleveList = recordData.elevesDeLaClasse.map(
        (eleve: any) => ({
          id: eleve.id,
          eleve: eleve.id,
          nomEleve: eleve.nom,
          prenomEleve: eleve.prenom,
          matricule: eleve.matricule
        })
      );
    }
    if (recordData.classeId && recordData.coursDeLaClasse) {
      this.coursList = recordData.coursDeLaClasse;
    }
  }

  ajouterEditAbsence(): void {
    if (this.attendanceRecordFormGroup.invalid) {
      this.attendanceRecordFormGroup.markAllAsTouched();
      this.toastService.warning(
        'Attention',
        'Veuillez renseigner tous les champs obligatoires.'
      );
      return;
    }

    const payload = this.attendanceRecordFormGroup.getRawValue();

    if (this.attendanceRecordId == null) {
      this.creerAbsence(payload);

    } else {
      this.modifierAbsence(this.attendanceRecordId, payload);
    }
  }

  private creerAbsence(payload: any): void {
    this.coursService.createRessource('attendancerecord', payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Succès', 'Absence ajoutée avec succès.');
          this.goBack();
        },

        error: (error: any) => {

          console.error(
            'Erreur lors de la création :',
            error
          );

          this.toastService.error(
            'Erreur',
            this.extractErrorMessage(
              error,
              "Erreur lors de la création de l'absence."
            )
          );
        }
      });
  }

  private modifierAbsence(absenceId: number, payload: any): void {
    this.coursService.updateResource('attendancerecord', absenceId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Succès', 'Absence modifiée avec succès.');
          this.goBack();
        },

        error: (error: any) => {
          console.error('Erreur lors de la modification :', error);

          this.toastService.error(
            'Erreur',
            this.extractErrorMessage(
              error,
              "Erreur lors de la modification de l'absence."
            )
          );
        }
      });
  }

  private extractErrorMessage(error: any, defaultMessage: string): string {
    if (Array.isArray(error?.error)) {
      return error.error.join(', ');
    }
    if (typeof error?.error === 'string') {
      return error.error;
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return defaultMessage;
  }


  goBack(): void {
    void this.router.navigate(['/admin/dossier-eleve/absences']);
  }

}