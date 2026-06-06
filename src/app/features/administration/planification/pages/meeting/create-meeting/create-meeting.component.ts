import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Meeting } from '../../../../../../core/models/planification/meeting';
import { Salle } from '../../../../../../core/models/referentiels/salle';
import { TypeReunion } from '../../../../../../core/models/referentiels/type-reunion';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-create-meeting',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent implements OnInit {
  errorMessage?: string;
  meetingId: number;
  meeting: any;
  meetingFormGroup!: FormGroup;

  isEdit?: boolean = false;
  ecoleId: any;
  userId?: number;
  utilisateur: Utilisateur = {};
  salleList: Salle[] = [];
  typeReunionList: TypeReunion[] = [];

  title = "Programmer une réunion";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly destroyRef = inject(DestroyRef);


  constructor(
  ) {
    this.meetingId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.chargerLesDonnees();
    this.initializeForm(null);
    if (this.meetingId != null && this.meetingId != undefined) {
      this.getMeeting(this.meetingId);
      this.title = 'Modifier une réunion';
      this.isEdit = true;
    }
  }

  private chargerLesDonnees() {
    this.utilisateurService.getUtilisateur(this.userId!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.utilisateur = data
    });
    this.referentielService.getResourceList('typereunion').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.typeReunionList = data
    });
    this.referentielService.getResourceList('salle').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.salleList = data
    });
  }

  get selectedSalleNom(): string {
    const salleId = this.meetingFormGroup.get('salleId')?.value;
    const salle = this.salleList.find(s => s.id === +salleId);
    return salle ? salle.libelle! : '';
  }

  get selectedTypeReunionLibelle(): string {
    const typeId = this.meetingFormGroup.get('typeReunionId')?.value;
    const type = this.typeReunionList.find(t => t.id === +typeId);
    return type ? type.libelle! : '';
  }

  getMeeting(meetingId: number) {
    this.planificationService.getMeetingById(meetingId).subscribe({
      next: (data) => {
        this.meeting = data;
        this.initializeForm(this.meeting);
      }
    });
  }

  initializeForm(meeting: Meeting | null) {
    this.meetingFormGroup = this._formBuilder.group({
      id: [meeting?.id ?? ''],
      libelle: [meeting?.libelle ?? '', Validators.required],
      dateMeeting: [meeting?.dateMeeting ?? '', Validators.required],
      heureDebut: [meeting?.heureDebut ?? '', Validators.required],
      heureFin: [meeting?.heureFin ?? '', Validators.required],
      typeReunionId: [meeting?.typeReunionId ?? '', Validators.required],
      salleId: [meeting?.salleId ?? ''],
      description: [meeting?.description ?? ''],
    });

  }

  ajoutereditMeeting() {
    const payload = this.meetingFormGroup.value;
    payload.createurId = this.userId;
    payload.ecole = this.ecoleId;
    console.log('payload', payload);

    if (!this.isEdit) {
      this.planificationService.createMeeting(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La renion a été enregistrées avec succès !!! ');
            this.goBack();
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
      this.planificationService.updateMeeting(this.meetingId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La reunion a été modifiées avec succès !!! ');
            this.goBack();
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la mofication : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la mofication : ' + data.error);
        }
      });

    }

  }

  goBack() {
    this.router.navigate(['admin/planification/reunion'])
  }

}