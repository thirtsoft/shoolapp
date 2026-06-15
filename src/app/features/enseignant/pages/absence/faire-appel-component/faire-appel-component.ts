import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PieceJointeService } from '../../../../../core/services/piece-jointe';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { EnseignantService } from '../../../service/enseignant.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';
import { ListeEleve } from '../../../../../core/models/dossiereleve/liste-eleve';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';


interface Absence {
  id?: number;
  eleveId: string;
  eleveNom: string;
  elevePrenom: string;
  dateAbsence: string;
  semestre: number;
  anneeScolaire: string;
  justifiee: boolean;  // Statut: true = justifiée, false = non justifiée
  motif: string;
  typeSignalement: string; // 'ENSEIGNANT'
  createur: number; // ID de l'enseignant
}


@Component({
  selector: 'app-faire-appel-component',
  standalone: true,
  imports: [RouterModule, FormsModule, DatePipe],
  templateUrl: './faire-appel-component.html',
  styleUrl: './faire-appel-component.css',
})
export class FaireAppelComponent implements OnInit {



  isLoading = signal(false);
  eleves = signal<any[]>([]);
  eleveList = signal<ListeEleve[]>([]);

  classeId?: number;
  //  classe: Classe = {};

  private readonly dossierResource = inject(DossierResourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly referentielService = inject(ReferentielService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly toastService = inject(ToastrService)
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly classeContext = inject(EnseignementContextService);


  readonly libelleClasse = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.classe || '5ème A';
  });

  readonly anneeScolaireActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.anneeScolaire || '2025-2026';
  });

  readonly matiereActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.matiere || 'Matière';
  });

  constructor(
  ) {
    effect(() => {
      const activeId = Number(this.classeContext.activeClasseId());
      console.log('active classe is', activeId);
      if (activeId) {
        this.chargerListeElevesPourAppel(activeId);
      } else {
        this.chargerDonnees()
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
    });
    this.chargerDonnees();
  }

  chargerListeElevesPourAppel(classId: number) {
    this.dossierResource.getResourceListByElement('inscription/classe', classId)?.subscribe({
      next: (data: any) => {
        this.eleveList = data;
        console.log('Liste eleves {}', this.eleveList);
      }
    });
  }

  chargerDonnees(): void {
    this.eleves.set([
      { id: '1', nom: 'Dupont', prenom: 'Marie', sexe: 'F', absent: true, motif: 'Maladie' },
      { id: '2', nom: 'Martin', prenom: 'Lucas', sexe: 'M', absent: false },
      { id: '3', nom: 'Bernard', prenom: 'Chloé', sexe: 'F', absent: false },
      { id: '4', nom: 'Petit', prenom: 'Thomas', sexe: 'M', absent: true, motif: 'Absence non justifiée' },
      { id: '5', nom: 'Robert', prenom: 'Emma', sexe: 'F', absent: false },
      { id: '6', nom: 'Richard', prenom: 'Hugo', sexe: 'M', absent: false },
      { id: '7', nom: 'Durand', prenom: 'Léa', sexe: 'F', absent: false },
      { id: '8', nom: 'Moreau', prenom: 'Nathan', sexe: 'M', absent: true, motif: 'Retard' },
    ]);
  }

  // ─── Onglets actif ──────────────────────────────────
  activeTab = signal<string>('appel');

  // Dans le composant
  showAbsenceFormModal = signal<boolean>(false);
  currentEleveForAbsence: any | null = null;

  absenceForm = {
    dateAbsence: new Date().toISOString().split('T')[0],
    semestre: 1,
    anneeScolaire: this.anneeScolaireActive(),
    justifiee: true,
    motif: '',
    typeSignalement: 'ENSEIGNANT'
  };


  ouvrirFormulaireAbsence(eleve: any) {
    this.currentEleveForAbsence = eleve;
    this.showAbsenceFormModal.set(true);
  }

  sauvegarderAbsence() {
    if (!this.absenceForm.motif.trim()) {
      alert('Veuillez saisir un motif');
      return;
    }

    const absence: Absence = {
      eleveId: this.currentEleveForAbsence!.id,
      eleveNom: this.currentEleveForAbsence!.nom,
      elevePrenom: this.currentEleveForAbsence!.prenom,
      dateAbsence: this.absenceForm.dateAbsence,
      semestre: this.absenceForm.semestre,
      anneeScolaire: this.absenceForm.anneeScolaire,
      justifiee: this.absenceForm.justifiee,
      motif: this.absenceForm.motif,
      typeSignalement: 'ENSEIGNANT',
      createur: 1 // ID de l'enseignant connecté
    };

    console.log('Absence enregistrée:', absence);
    alert(`Absence enregistrée pour ${this.currentEleveForAbsence!.prenom} ${this.currentEleveForAbsence!.nom}`);

    // Marquer l'élève comme absent dans la liste
    const eleve = this.eleves().find(e => e.id === this.currentEleveForAbsence!.id);
    if (eleve) {
      eleve.absent = true;
      eleve.motif = this.absenceForm.motif;
    }

    this.fermerFormulaireAbsence();
  }

  fermerFormulaireAbsence() {
    this.showAbsenceFormModal.set(false);
    this.currentEleveForAbsence = null;
    this.absenceForm = {
      dateAbsence: new Date().toISOString().split('T')[0],
      semestre: 1,
      anneeScolaire: this.anneeScolaireActive(),
      justifiee: true,
      motif: '',
      typeSignalement: 'ENSEIGNANT'
    };
  }

  sauvegarderAppel(): void {
    const absences = this.eleves().filter(e => e.absent);
    if (absences.length === 0) {
      alert('Aucune absence enregistrée');
      return;
    }
    alert(`Appel sauvegardé ! ${absences.length} absence(s) enregistrée(s)`);
  }


  today(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    };
    return new Date().toLocaleDateString('fr-FR', options);
  }
}

