import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { NoteInformation } from '../../../../../core/models/planification/note-information';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';

@Component({
  selector: 'app-details-note-information-componenent',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule, RouterLink],
  templateUrl: './details-note-information-componenent.html',
  styleUrl: './details-note-information-componenent.css',
})
export class DetailsNoteInformationComponenent implements OnInit, OnDestroy {

  errorMessage?: string;
  noteId: number;
  noteInformation: any;
  noteInformationFormGroup!: FormGroup;
  editor!: Editor;

  title = "Détails d'une note d'information";

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];


  private readonly planificationResouce = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.noteId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm(null);
    if (this.noteId != null && this.noteId != undefined) {
      this.getNoteInformation(this.noteId);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  getNoteInformation(noteId: number) {
    this.planificationResouce.getSingleResource('planification/noteinformation', noteId).subscribe({
      next: (data) => {
        this.noteInformation = data;
        console.log('Note info', this.noteInformation);
        this.initializeForm(this.noteInformation);

        this.noteInformationFormGroup.disable();
      }
    });
  }

  initializeForm(note: NoteInformation | null) {
    this.noteInformationFormGroup = this._formBuilder.group({
      id: [note?.id ? note.id : ''],
      description: [note?.description ? note.description : '', Validators.required],
    });
  }


  goBack() {
    this.router.navigate(['admin/planification/noteinformations'])
  }


}

