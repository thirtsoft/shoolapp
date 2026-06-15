import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NoteEdit } from '../../../../../core/models/dossiereleve/note/note-edit-request';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';

@Component({
  selector: 'app-editer-une-note-component',
   standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './editer-une-note-component.html',
  styleUrl: './editer-une-note-component.css',
})
export class EditerUneNoteComponent implements OnInit {

  errorMessage?: string;
  noteId!: number;
  noteFormGroup!: FormGroup;
  note: NoteEdit = {};
  title = "Modifier une note";
  disableAddButton = false;
  userId?: number;
  ecoleId: any;
  classeId?: number;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  ngOnInit(): void {
    this.noteId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
    this.classeId = Number(localStorage.getItem('id'));
    this.initialiserFormGroup();
    if (this.noteId != null && this.noteId != undefined) {
      this.getNoteByID(this.noteId);
      this.title = 'Modifier une note';
    }
  }

  initialiserFormGroup() {
    this.noteFormGroup = this._formBuilder.group({
      id: [''],
      eleve: ['', Validators.required],
      nomCompletEleve: ['', Validators.required],
      classe: ['', Validators.required],
      libelleClasse: ['', Validators.required],
      evaluation: ['', Validators.required],
      evaluationTitre: ['', Validators.required],
      note: ['', Validators.required],
      type: ['', Validators.required],
      appreciation: ['', Validators.required]
    });
  }

  getNoteByID(noteId: number) {
    this.dossierResource.getSingleResource('note', noteId).subscribe({
      next: (data: any) => {
        this.note = data;
        this.noteFormGroup = this._formBuilder.group({
          id: [this.note?.id ?? ''],
          eleve: [this.note?.eleve ?? '', Validators.required],
          nomCompletEleve: [this.note?.nomCompletEleve ?? '', Validators.required],
          //      classe: [this.note?.classe ?? '', Validators.required],
          libelleClasse: [this.note?.libelleClasse ?? '', Validators.required],
          evaluation: [this.note?.evaluation ?? '', Validators.required],
          evaluationTitre: [this.note?.evaluationTitre ?? '', Validators.required],
          note: [this.note?.note ?? '', Validators.required],
          type: [this.note?.type ?? '', Validators.required],
          appreciation: [this.note?.appreciation ?? '', Validators.required],
        });
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  editerUneNote() {
    if (this.noteFormGroup?.invalid) {
      this.noteFormGroup?.markAllAsTouched();
      return;
    }

    const payload = this.noteFormGroup?.value;
    payload.createur = this.userId;
    payload.dateCreation = this.note.dateCreation;
    payload.ecole = this.ecoleId;

    this.dossierResource.updateUneReource('note', this.noteId, payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'La note a été modifiée avec succès !!! ');
          this.router.navigate(['/enseignant/notes']);
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
      }
    });

  }

  goBack() {
    this.router.navigate(['/enseignant/notes'])
  }


}
