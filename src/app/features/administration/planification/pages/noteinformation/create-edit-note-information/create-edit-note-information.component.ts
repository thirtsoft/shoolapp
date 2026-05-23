import { SlicePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { NoteInformation } from '../../../../../../core/models/planification/note-information';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-create-edit-note-information',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
  templateUrl: './create-edit-note-information.component.html',
  styleUrls: ['./create-edit-note-information.component.css']
})
export class CreateEditNoteInformationComponent implements OnInit {
  errorMessage?: string;
  noteId: number;
  noteInformation: any;
  noteInformationFormGroup!: FormGroup;

  isEdit: boolean = false;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Saisir une note d'information";


  private readonly planificationResouce = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.noteId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.noteId != null && this.noteId != undefined) {
      this.getNoteInformation(this.noteId);
      this.title = 'Modifier une note d\'information';
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

  getNoteInformation(noteId: number) {
    this.planificationResouce.getSingleResource('noteinformation', noteId).subscribe({
      next: (data) => {
        this.noteInformation = data;
        this.initializeForm(this.noteInformation);
      }
    });
  }

  initializeForm(note: NoteInformation | null) {
    this.noteInformationFormGroup = this._formBuilder.group({
      id: [note?.id ? note.id : ''],
      description: [note?.description ? note.description : '', Validators.required],
    });
  }

  ajoutereditNoteInformation() {
    const payload = this.noteInformationFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.planificationResouce.createRessource('planification/noteinformation', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La note information a été enregistrées avec succès !!! ');
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
      this.planificationResouce.updateResource('planification/noteinformation', this.noteId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La note onformation a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/planification/noteinformations'])
  }


}
