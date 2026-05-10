import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { ListeEvaluation } from '../../../../../../core/models/dossiereleve/evaluation/liste-evaluation';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { NoteEdit } from '../../../../../../core/models/dossiereleve/note';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-ajout-note',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-note.component.html',
  styleUrls: ['./ajout-note.component.css']
})
export class AjoutNoteComponent implements OnInit {
  errorMessage?: string;
  noteFormGroup!: FormGroup;
  note?: any;
  noteId?: number;
  eleveList: ListeEleve[] = [];
  evaluationList: ListeEvaluation[] = [];
  classeList: Classe[] = [];
  semestreList: Semestre[] = [];

  typeNoteList: string[] = ['DEVOIR', 'COMPOSITION'];
  selectedClass: any;

  title = "Ajouter une note";
  userId?: number;


  ecoleId: any;

  utilisateur?: Utilisateur;

  private readonly router = inject(Router);
  private readonly dossierResource = inject(DossierResourceService);
  //  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);




  ngOnInit(): void {
    this.noteId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
    this.getConnectedUserInfos();
    //    this.getClasseList();
    //    this.getSemestresList();
    this.initializeForm(null);
    if (this.noteId != null && this.noteId != undefined) {
      this.getNoteById(this.noteId);
      this.title = 'Modifier une note';
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(Number(this.userId)).subscribe({
      next: data => {
        this.utilisateur = data;
        //      this.ecoleId = this.utilisateur.ecoleId!;
      },
      error: error => { console.log(error) },
    });

  }

  /*
  getSemestresList() {
    this.referentielService.getAllSemestres().subscribe(
      (data: any[]) => {
        this.semestreList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }*/

  chargerEvaluationsParClasse(classeId: number) {
    this.dossierResource.getResourceList(`evaluation/list-by-classe/${classeId}`).subscribe({
      next: (data: any) => {
        this.evaluationList = data;
        console.log('Eval', this.evaluationList);
      },
      error: (err) => {
        console.error('Erreur chargement enseignements:', err);
      }
    })
  }

  /*
  getClasseList() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classeList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }*/

  onClasseSelected() {
    if (this.selectedClass) {
      this.getEleveList(this.selectedClass);
      this.chargerEvaluationsParClasse(this.selectedClass);
    }
  }

  getEleveList(classId: number) {
    this.dossierResource.getResourceListByElement('inscription/classe', classId)?.subscribe({
      next: (data: any) => {
        this.eleveList = data;
        console.log('Liste eleves {}', this.eleveList);
      }
    });
  }

  initializeForm(note: NoteEdit | null) {
    this.noteFormGroup = this._formBuilder.group({
      id: [note?.id ? note.id : ''],
      eleve: [note?.eleve ? note.eleve : '', Validators.required],
      evaluation: [note?.evaluation ? note.evaluation : '', Validators.required],
      classe: [note?.classe ? note.classe : '', Validators.required],
      appreciation: [note?.appreciation ? note.appreciation : '', Validators.required],
      type: [note?.type ? note.type : '', Validators.required],
      note: [note?.note ? note.note : '', Validators.required]
    });
  }


  getNoteById(noteId: number) {
    this.dossierResource.getSingleResource('note', noteId).subscribe({
      next: (data) => {
        this.note = data;
        this.getEleveList(this.note.classe);
        this.initializeForm(this.note);
      }
    });
  }

  ajoutereditNote() {
    const payload: NoteEdit = {
      id: this.noteFormGroup.get("id")!.value,
      eleve: this.noteFormGroup.get("eleve")!.value,
      evaluation: this.noteFormGroup.get("evaluation")!.value,
      classe: this.noteFormGroup.get("classe")!.value,
      appreciation: this.noteFormGroup.get("appreciation")!.value,
      type: this.noteFormGroup.get("type")!.value,
      note: this.noteFormGroup.get("note")!.value,
    }
    console.log('Ajout edit note {}', payload);
    payload.createur = this.userId;
    payload.ecole = this.ecoleId;
    if (this.noteId === null || this.noteId === undefined) {
      this.dossierResource.createEditRessource('note', payload).subscribe({
        next: (data) => {
          this.toastService.success('success', 'La note a été ajoutée avec succès.');
          this.router.navigate(['/admin/dossier-eleve/notes']);
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.dossierResource.createEditRessource('note', payload).subscribe({
        next: data => {
          this.toastService.success('success', 'La note a été modifié avec succès.');
          this.router.navigate(['/admin/dossier-eleve/notes']);

        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }

  }

  goBack() {
    this.router.navigate(['/admin/dossier-eleve/notes']);
  }

}
