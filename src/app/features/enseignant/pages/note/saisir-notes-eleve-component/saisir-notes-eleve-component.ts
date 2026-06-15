import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListeEleve } from '../../../../../core/models/dossiereleve/liste-eleve';
import { EvaluationEditNote } from '../../../../../core/models/dossiereleve/evaluation/evaluation-edit-note';
import { Classe } from '../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../core/models/referentiels/semestre';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { Router } from '@angular/router';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-saisir-notes-eleve-component',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './saisir-notes-eleve-component.html',
  styleUrl: './saisir-notes-eleve-component.css',
})
export class SaisirNotesEleveComponent implements OnInit {

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
  classeId?: number;
  enseignementId?: number;
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
  private readonly classeContext = inject(EnseignementContextService);

  readonly classIdActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.classId;
  });

  readonly enseignementIdActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.id;
  });

  constructor() {
    this.userId = Number(localStorage.getItem('id'));

    effect(() => {
      const activeClassId = this.classIdActive();
      if (activeClassId) {
        console.log('Mode création - Enseignement ID appliqué automatiquement :', activeClassId);
        this.classeId = activeClassId;

        this.getEleveList(this.classeId);
        this.loadEvaluationsForClasse(this.classeId);
      }

      const activeEnseignementId = this.enseignementIdActive();
      if (activeEnseignementId) {
        this.enseignementId = Number(activeEnseignementId);
      }
    });
  }

  ngOnInit(): void {
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
