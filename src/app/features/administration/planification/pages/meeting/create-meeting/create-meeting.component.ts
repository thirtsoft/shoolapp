import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Meeting } from '../../../../../../core/models/planification/meeting';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
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

  isEdit: boolean = false;

  typeReunions: string[] = ['ADMINISTRATION', 'PARENT', 'ENSEIGNANT','SCOLAIRE'];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Programmer une réunion";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.meetingId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.meetingId != null && this.meetingId != undefined) {
      this.getMeeting(this.meetingId);
      this.title = 'Modifier une réunion';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });

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
      id: [meeting?.id ? meeting.id : ''],
      libelle: [meeting?.libelle ? meeting.libelle : '', Validators.required],
      dateMeeting: [meeting?.dateMeeting ? meeting?.dateMeeting : '', Validators.required],
      heureDebut: [meeting?.heureDebut ? meeting.heureDebut : '', Validators.required],
      heureFin: [meeting?.heureFin ? meeting.heureFin : '', Validators.required],
      typeReunion: [meeting?.typeReunion ? meeting.typeReunion : '', Validators.required],
      description: [meeting?.description ? meeting.description : ''],
    });
  }


  ajoutereditMeeting() {
    const payload = this.meetingFormGroup.value;
    payload.ecole = this.ecoleId;
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