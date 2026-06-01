import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EvaluationEditNote } from '../../../../../../core/models/dossiereleve/evaluation/evaluation-edit-note';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';


@Component({
  selector: 'app-ajout-note',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './ajout-note.component.html',
  styleUrls: ['./ajout-note.component.css']
})
export class AjoutNoteComponent implements OnInit {
  errorMessage?: string;
  noteFormGroup!: FormGroup;
  note?: any;
  noteId?: number;
  eleveList: ListeEleve[] = [];
  evaluationList: EvaluationEditNote[] = [];
  classeList: Classe[] = [];
  semestreList: Semestre[] = [];

  typeNoteList: string[] = ['DEVOIR', 'COMPOSITION'];
  selectedClass: any;

  title = "Ajouter une note";
  userId?: number;
  ecoleId: any;
  utilisateur?: Utilisateur;
  selectedClasseId: any;
  selectedEvaluationForNotes: any = null;
  notesData = signal<any[]>([]);

  moyenneClasse: number = 0;
  noteMaximale: number = 0;
  noteMinimale: number = 0;

  private readonly router = inject(Router);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id'));
    this.getConnectedUserInfos();
    this.getClasseList();
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(Number(this.userId)).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });
  }

  getClasseList() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classeList = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  onClasseChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedClasseId = Number(select.value);
    this.selectedEvaluationForNotes = null;

    if (this.selectedClasseId) {
      this.getEleveList(this.selectedClasseId);
      this.loadEvaluationsForClasse(this.selectedClasseId);

    }
  }

  loadEvaluationsForClasse(classId: number) {
    this.dossierResource.getResourceListByElement('evaluation/by-classe', classId).subscribe({
      next: (data: any[]) => {
        this.evaluationList = data;
        console.log('Évaluations chargées:', this.evaluationList);
      },
      error: (error) => {
        console.error('Erreur chargement évaluations:', error);
        this.toastService.error('Erreur', 'Impossible de charger les évaluations');
      }
    });
  }

  onEvaluationChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const evaluationId = Number(select.value);

    const evaluationComplete = this.evaluationList.find(e => e.id === evaluationId);

    if (evaluationComplete) {
      this.selectedEvaluationForNotes = {
        id: evaluationComplete.id,
        titre: evaluationComplete.titre,
        description: evaluationComplete.description,
        dateEvaluation: evaluationComplete.dateEvaluation,
        evaluationType: evaluationComplete.evaluationType,
        coefficient: evaluationComplete.coefficient || 1,
        noteMax: evaluationComplete.noteMax || 20,
        classeId: evaluationComplete.classeId
      };
      this.loadNotesFromEvaluation(evaluationComplete);
    }
  }

  loadNotesFromEvaluation(evaluation: any) {
    if (!evaluation.noteEditRequestDTOList || evaluation.noteEditRequestDTOList.length === 0) {
      console.warn('Aucune note trouvée pour cette évaluation');
      this.notesData.set([]);
      this.calculerStatistiques();
      return;
    }

    const eleveMap = new Map();
    this.eleveList.forEach((eleve: any) => {
      eleveMap.set(eleve.eleve, {
        nom: eleve.nomEleve,
        prenom: eleve.prenomEleve,
        id: eleve.id
      });
    });

    console.log('Map des élèves:', eleveMap);

    const notesFormatees = evaluation.noteEditRequestDTOList.map((note: any) => {

      const eleveInfo = eleveMap.get(note.eleve);

      return {
        id: note.id,
        eleveId: note.eleve,
        noteValue: note.note,
        appreciation: note.appreciation || '',
        nom: eleveInfo?.nom || `Élève ${note.eleve}`,
        prenom: eleveInfo?.prenom || ''
      };
    });

    this.notesData.set(notesFormatees);
    this.calculerStatistiques();

    console.log('Notes chargées:', this.notesData());
  }

  updateNote(eleveId: number, newNote: number) {
    const notes = this.notesData();
    const index = notes.findIndex(n => n.eleveId === eleveId);
    if (index !== -1) {
      notes[index].noteValue = newNote;
      this.notesData.set([...notes]);
      this.calculerStatistiques();
    }
  }

  updateAppreciation(eleveId: number, appreciation: string) {
    const notes = this.notesData();
    const index = notes.findIndex(n => n.eleveId === eleveId);
    if (index !== -1) {
      notes[index].appreciation = appreciation;
      this.notesData.set([...notes]);
    }
  }

  calculerStatistiques() {
    const notes = this.notesData();
    const notesValues = notes.map(n => n.noteValue).filter(n => n !== null && n !== undefined);

    if (notesValues.length > 0) {
      this.moyenneClasse = parseFloat((notesValues.reduce((a, b) => a + b, 0) / notesValues.length).toFixed(2));
      this.noteMaximale = Math.max(...notesValues);
      this.noteMinimale = Math.min(...notesValues);
    } else {
      this.moyenneClasse = 0;
      this.noteMaximale = 0;
      this.noteMinimale = 0;
    }
  }

  private updateEvaluationNotesInList() {
    const index = this.evaluationList.findIndex(e => e.id === this.selectedEvaluationForNotes.id);
    if (index !== -1) {
      this.evaluationList[index].noteEditRequestDTOList = this.notesData().map(note => ({
        id: note.id,
        eleve: note.eleveId,
        note: note.noteValue,
        appreciation: note.appreciation,
        type: this.selectedEvaluationForNotes.evaluationType
      }));
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

  sauvegarderNotes() {
    if (!this.selectedEvaluationForNotes) {
      this.toastService.warning('Attention', 'Veuillez sélectionner une évaluation');
      return;
    }
    const evaluationComplete = this.evaluationList.find(e => e.id === this.selectedEvaluationForNotes.id);

    if (!evaluationComplete) {
      this.toastService.error('Erreur', 'Évaluation non trouvée');
      return;
    }

    const formatLocalDateTime = (dateValue: string | Date | undefined): string | null => {
      if (!dateValue) return null;

      if (dateValue instanceof Date) {
        return dateValue.toISOString();
      }

      if (typeof dateValue === 'string') {
        if (dateValue.includes('T')) {
          return dateValue;
        }
        return `${dateValue}T00:00:00`;
      }

      return null;
    };

    const payload: any = {
      id: evaluationComplete.id,
      titre: evaluationComplete.titre,
      description: evaluationComplete.description,
      dateEvaluation: evaluationComplete.dateEvaluation instanceof Date
        ? evaluationComplete.dateEvaluation.toISOString().split('T')[0]
        : evaluationComplete.dateEvaluation,
      dateRemise: evaluationComplete.dateRemise,
      dateCreation: formatLocalDateTime(evaluationComplete.dateCreation),
      enseignementId: evaluationComplete.enseignementId,
      createur: this.userId,
      evaluationType: evaluationComplete.evaluationType,
      evaluationMode: evaluationComplete.evaluationMode || 'NORMAL',
      etatId: evaluationComplete.etatId || 1,
      classeId: evaluationComplete.classeId,
      heureDebut: evaluationComplete.heureDebut,
      heureFin: evaluationComplete.heureFin,
      ecole: this.ecoleId,
      actif: evaluationComplete.actif !== undefined ? evaluationComplete.actif : 1,
      noteEditRequestDTOList: this.notesData().map(note => ({
        id: note.id,
        eleve: note.eleveId,
        note: note.noteValue,
        type: evaluationComplete.evaluationType || 'DEVOIR',
        dateCreation: formatLocalDateTime(new Date()),
        appreciation: note.appreciation || '',
        createur: this.userId,
        ecole: this.ecoleId,
        actif: 1
      }))
    };

    console.log('Payload:', payload);

    delete payload.noteEditRequestDTOListOld; // si existe

    console.log('Payload:', payload);

    this.dossierResource.updateUneReource('evaluation', this.selectedEvaluationForNotes.id, payload).subscribe({
      next: (response) => {
        console.log('response:', response);
        this.toastService.success('Succès', 'Notes sauvegardées avec succès');
        this.updateEvaluationNotesInList();
        this.router.navigate(['/admin/dossier-eleve/notes']);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error('Erreur', 'Échec de la sauvegarde');
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/dossier-eleve/notes']);
  }

}
