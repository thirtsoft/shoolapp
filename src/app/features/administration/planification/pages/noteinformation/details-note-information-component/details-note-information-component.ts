import { Component, inject, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { NoteInformation } from '../../../../../../core/models/planification/note-information';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-details-note-information-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgxEditorModule,
    NgbModalModule
  ],
  templateUrl: './details-note-information-component.html',
  styleUrl: './details-note-information-component.css',
})
export class DetailsNoteInformationComponent implements OnInit, OnDestroy {

  errorMessage?: string;

  noteId!: number;
  noteInformation: any;
  noteInformationFormGroup!: FormGroup;

  editor!: Editor;

  title = "Détails d'une note d'information";

  modalRef?: NgbModalRef;

  actionEnCours = false;

  actionPublication: 'publier' | 'depublier' | null = null;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  private readonly planificationResouce = inject(PlanificationResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);

  constructor() {
    this.noteId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.editor = new Editor();

    this.initializeForm(null);

    if (this.noteId !== null && this.noteId !== undefined) {
      this.getNoteInformation(this.noteId);
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  getNoteInformation(noteId: number): void {

    this.planificationResouce
      .getSingleResource('planification/noteinformation', noteId)
      .subscribe({
        next: (data) => {

          this.noteInformation = data;

          console.log('Note info', this.noteInformation);

          this.initializeForm(this.noteInformation);

          this.noteInformationFormGroup.disable();
        },

        error: (error) => {
          console.error('Erreur chargement note information', error);

          this.errorMessage =
            "Impossible de charger les détails de la note d'information.";

          this.toastService.error(
            this.errorMessage,
            'Erreur'
          );
        }
      });
  }

  initializeForm(note: NoteInformation | null): void {

    this.noteInformationFormGroup = this._formBuilder.group({
      id: [
        note?.id
          ? note.id
          : ''
      ],

      description: [
        note?.description
          ? note.description
          : '',
        Validators.required
      ]
    });
  }

  isPublished(): boolean {
    return this.noteInformation?.etat === EtatLibelle.LIBELLE_ETAT_PUBLIE;
  }

  isDepublished(): boolean {
    return this.noteInformation?.etat === EtatLibelle.LIBELLE_ETAT_DEPUBLIE;
  }

  isEnCours(): boolean {
    return this.noteInformation?.etat === EtatLibelle.LIBELLE_ETAT_ENCOURS;
  }

  ouvrirConfirmation(template: TemplateRef<any>, action: 'publier' | 'depublier'): void {
    this.actionPublication = action;

    const modalRef = this.modalService.open(template, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.confirmerPublication();
        }
      },
      () => { }
    );
  }

  confirmerPublication(): void {
    if (!this.actionPublication || this.actionEnCours) {
      return;
    }

    this.actionEnCours = true;

    if (this.actionPublication === 'publier') {
      this.publier();
    } else {
      this.depublier();
    }
  }

  private publier(): void {
    this.planificationResouce
      .publierNoteInfo(this.noteId)
      .subscribe({
        next: () => {

          this.actionEnCours = false;

          if (this.noteInformation) {
            this.noteInformation.etat = 'Publié';
          }

          this.modalRef?.close();
          this.actionPublication = null;

          this.toastService.success(
            "La note d’information " +
            this.noteInformation?.reference +
            " a été publiée avec succès.",
            "Publication effectuée"
          );
        },

        error: (error) => {

          console.error(
            "Erreur publication note information",
            error
          );

          this.actionEnCours = false;

          this.toastService.error(
            error?.error?.message ??
            "La publication de la note d’information a échoué.",
            "Erreur"
          );
        }
      });
  }

  private depublier(): void {
    this.planificationResouce
      .dePublierNoteInfo(this.noteId)
      .subscribe({
        next: () => {

          this.actionEnCours = false;

          if (this.noteInformation) {
            this.noteInformation.etat = 'Dépublié';
          }

          this.modalRef?.close();
          this.actionPublication = null;

          this.toastService.success(
            "La note d’information " +
            this.noteInformation?.reference +
            " a été dépubliée avec succès.",
            "Dépublication effectuée"
          );
        },

        error: (error) => {

          console.error(
            "Erreur dépublication note information",
            error
          );

          this.actionEnCours = false;

          this.toastService.error(
            error?.error?.message ??
            "La dépublication de la note d’information a échoué.",
            "Erreur"
          );
        }
      });
  }

  annulerConfirmation(): void {
    if (this.actionEnCours) {
      return;
    }
    this.modalRef?.dismiss();
    this.actionPublication = null;
  }

  goBack(): void {
    void this.router.navigate(['admin/planification/noteinformations']);
  }
}