import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
import { DashboardStatsEleve } from '../../../../core/models/statistique/eleve/dashboard-stats-eleve';
import { DashboardStatsEleveList } from '../../../../core/models/statistique/eleve/dashboard-stats-eleve-list';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { DataService } from '../../../../shared/data.service';
import { DashboardParentService } from '../../service/dashboard-parent.service';
import { ParentService } from '../../service/parent.service';

interface FactureLocal {
  id: string;
  libelle: string;
  montant: number;
  dateEmission: string;
  echeance: string;
  statut: 'payé' | 'en_attente' | 'en_retard';
}

interface EvenementLocal {
  titre: string;
  date: string;
  type: 'examen' | 'reunion' | 'conseil' | 'sortie' | 'sport';
  description: string;
}

interface MessageLocal {
  id: string;
  expediteur: string;
  role: string;
  sujet: string;
  date: string;
  nonLu: boolean;
  contenu: string;
}

@Component({
  selector: 'app-dashboard-parent-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-parent-component.html',
  styleUrl: './dashboard-parent-component.css',
})
export class DashboardParentComponent implements OnInit {

  protected readonly Math = Math;
  private readonly ds = inject(DataService);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);
  private readonly parentService = inject(ParentService);
  private readonly dashboardService = inject(DashboardParentService);
  private readonly destroyRef = inject(DestroyRef);

  eleveId?: number;
  moyenneGeneraleEleve: number = 0;
  classementGeneralEleve: number = 0;
  nombreAbsenceEleve: number = 0;
  nombreAbsenceJustifieEleve: number = 0;
  nombreRetardEleve: number = 0;
  montantTotalEnAttanteEleve: number = 0;
  montantTotalEnRetardEleve: number = 0;
  montantTotalImpayeEleve: number = 0;

  coursEleveDTOList: any[] = [];
  semaine: string = "Cette semaine";

  private fallbackNotesEleve: any[] = [];
  private fallbackListFacture: FactureLocal[] = [];
  private fallbackCousEleve: any[] = [];
  private fallbackEvenements: EvenementLocal[] = [];

  parentDetails = signal<ParentDetails>({});
  parent = signal({ nom: '', prenom: '', email: '', telephone: '', profession: '' });

  enfants = signal([
    { id: 1, nom: 'Moussa Diop', classe: 'Terminale S2', anneeScolaire: '2025-2026', photo: '👦', moyenne: 14.5, absences: 3, retards: 2 },
    { id: 2, nom: 'Fatima Diop', classe: 'Quatrième B', anneeScolaire: '2025-2026', photo: '👧', moyenne: 16.2, absences: 1, retards: 0 },
    { id: 3, nom: 'Ibrahim Diop', classe: 'CP', anneeScolaire: '2025-2026', photo: '🧒', moyenne: 17.8, absences: 0, retards: 1 }
  ]);

  enfantActifId = signal(1);
  enfantActif = computed(() => this.enfants().find(e => e.id === this.enfantActifId()) ?? this.enfants()[0]);

  private readonly bulletinsParEnfant: Record<number, any> = {};
  dernierBulletin = computed(() => this.bulletinsParEnfant[this.enfantActifId()] || { trimestre: 'En attente', notes: [] });

  factures = signal<FactureLocal[]>([]);
  totalFactures = computed(() => this.factures().reduce((s, f) => s + f.montant, 0));
  facturesEnRetard = computed(() => this.factures().filter(f => f.statut === 'en_retard').length);

  evenements = signal<EvenementLocal[]>([]);
  messages = signal<MessageLocal[]>([]);
  messagesNonLus = computed(() => this.messages().filter(m => m.nonLu).length);

  ngOnInit() {
    this.chargerParentEtEleves();
    this.initLesListeDashboardParDefaut();
    this.chargerLesStatistiqueEleves();
  }

  private initLesListeDashboardParDefaut() {
    this.fallbackNotesEleve = [
      {
        trimestre: '2ème Trimestre',
        moyenne: 14.5,
        notes: [
          { matiere: 'Mathématiques', note: 16, coefficient: 5, moyenneClasse: 12, appreciation: 'Excellent travail', professeur: 'M. Sall' },
          { matiere: 'Physique-Chimie', note: 14, coefficient: 4, moyenneClasse: 11.5, appreciation: 'Bon niveau', professeur: 'Mme Diouf' },
          { matiere: 'SVT', note: 15.5, coefficient: 3, moyenneClasse: 13, appreciation: 'Très bien', professeur: 'M. Ndiaye' },
          { matiere: 'Français', note: 13, coefficient: 3, moyenneClasse: 10.5, appreciation: 'Progrès constants', professeur: 'Mme Fall' }
        ],
      },
      {
        trimestre: '2ème Trimestre',
        moyenne: 16.2,
        notes: [
          { matiere: 'Mathématiques', note: 17, coefficient: 4, moyenneClasse: 12, appreciation: 'Excellent', professeur: 'Mme Sow' },
          { matiere: 'Français', note: 16, coefficient: 4, moyenneClasse: 11, appreciation: 'Très bon travail', professeur: 'M. Dieng' }
        ]
      },
      {
        trimestre: '2ème Trimestre',
        moyenne: 17.8,
        notes: [
          { matiere: 'Mathématiques', note: 18, coefficient: 3, moyenneClasse: 14, appreciation: 'Excellent !', professeur: 'Mme Thiam' }
        ]
      }
    ];

    this.fallbackListFacture = [
      { id: 'FAC-2026-001', libelle: 'Frais de scolarité - 2ème trimestre', montant: 250000, dateEmission: '2026-01-15', echeance: '2026-03-15', statut: 'en_retard' },
      { id: 'FAC-2026-002', libelle: 'Demi-pension - Mars 2026', montant: 50000, dateEmission: '2026-03-01', echeance: '2026-03-30', statut: 'en_attente' },
    ];

    this.fallbackCousEleve = [
      {
        jour: 'Mardi',
        creneaux: [
          { heure: '08:00 - 10:00', matiere: 'Mathématiques', professeur: 'M. Sall', salle: 'Salle 12' },
          { heure: '10:00 - 10:15', matiere: 'Récréation', professeur: '-', salle: 'Cour' },
          { heure: '10:15 - 12:15', matiere: 'Physique-Chimie', professeur: 'Mme Diouf', salle: 'Labo 3' }
        ]
      }
    ];

    this.fallbackEvenements = [
      { titre: 'Conseil de classe 2ème trimestre', date: '25 Mars 2026', type: 'conseil', description: 'Décision d\'orientation' },
      { titre: 'Réunion parents-professeurs', date: '28 Mars 2026 à 17h', type: 'reunion', description: 'Bilan du trimestre' }
    ];

    this.messages.set([
      { id: 'MSG-001', expediteur: 'M. Sall', role: 'Prof. Maths', sujet: 'Progrès en mathématiques', date: '15 Mars 2026', nonLu: true, contenu: 'Votre enfant montre de réels progrès...' },
      { id: 'MSG-002', expediteur: 'Administration', role: 'Admin', sujet: 'Rappel paiement frais scolarité', date: '14 Mars 2026', nonLu: true, contenu: 'Nous vous rappelons que...' }
    ]);

    this.factures.set(this.fallbackListFacture);
    this.evenements.set(this.fallbackEvenements);
    this.bulletinsParEnfant[1] = this.fallbackNotesEleve[0];
    this.bulletinsParEnfant[2] = this.fallbackNotesEleve[1];
    this.bulletinsParEnfant[3] = this.fallbackNotesEleve[2];
  }

  private chargerParentEtEleves() {
    const userId = this.localStorage.getItem('id');
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.parentService.getDetailsParent(Number(userId)).subscribe({
      next: (res) => {
        this.parentDetails.set(res);
        this.parent.set({
          nom: res.nom || '',
          prenom: res.prenom || '',
          email: res.email || '',
          telephone: res.telephone || '',
          profession: res.profession || '',
        });
      },
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  private chargerLesStatistiqueEleves() {
    const eleveId = this.localStorage.getItem('eleveId');
    if (!eleveId) return;

    this.dashboardService.afficherLesStatsGlobaleEleve(eleveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => this.mettreAJourDataStatsEleve(data) });

    this.dashboardService.afficherLesListDeStatsGlobaleEleve(eleveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => this.mettreAJourLesListe(data) });
  }

  private mettreAJourDataStatsEleve(stats: DashboardStatsEleve) {
    this.moyenneGeneraleEleve = stats.moyenneGeneraleEleve || 14.5;
    this.classementGeneralEleve = stats.classementGeneralEleve || 5;
    this.nombreAbsenceEleve = stats.nombreAbsenceEleve || 2;
    this.nombreAbsenceJustifieEleve = stats.nombreAbsenceJustifieEleve || 2;
    this.nombreRetardEleve = stats.nombreRetardEleve || 2;
    this.montantTotalEnAttanteEleve = stats.montantTotalEnAttanteEleve || 20000;
    this.montantTotalEnRetardEleve = stats.montantTotalEnRetardEleve || 20000;
    this.montantTotalImpayeEleve = stats.montantTotalImpayeEleve || 40000;
  }

  private mettreAJourLesListe(data: DashboardStatsEleveList) {
    // 1. Événements
    if (data.quatreDernierEvenementDTOList && data.quatreDernierEvenementDTOList.length > 0) {
      this.evenements.set(data.quatreDernierEvenementDTOList.map(e => ({
        titre: e.libelle || '',
        date: e.date || '',
        type: (e.type as any) || 'conseil',
        description: e.libelle || ''
      })));
    } else {
      this.evenements.set(this.fallbackEvenements);
    }

    // 2. Emploi du temps
    const premierSemaine = data.coursEleveDashboardDTOList?.[0];
    const coursApi = premierSemaine?.coursEleveDTOList;
    this.semaine = premierSemaine?.semaine || "Cette semaine";

    if (coursApi && coursApi.length > 0) {
      this.coursEleveDTOList = coursApi.map(c => ({
        heure: c.heure,
        matiere: c.matiere,
        professeur: c.professeur,
        salle: c.salle
      }));
    } else {
      this.semaine = "Mardi (Données Démo)";
      this.coursEleveDTOList = this.fallbackCousEleve[0]?.creneaux || [];
    }

    // 3. Factures
    const factureGroup = data.listFactureEleveStatutDTOList?.[0];
    const facturesApi = factureGroup?.factureEleveStatutDTOList;

    if (facturesApi && facturesApi.length > 0) {
      this.factures.set(facturesApi.map((f, index) => ({
        id: f.numeroFacture || `FAC-${index}`,
        libelle: `Frais de scolarité - ${f.mois} ${f.annee}`,
        montant: f.montant || 0,
        dateEmission: '',
        echeance: f.echeance || '',
        statut: f.statut === 'Payé' ? 'payé' : f.statut === 'En attente' ? 'en_attente' : 'en_retard'
      })));
    } else {
      this.factures.set(this.fallbackListFacture);
    }

    // 4. Bulletins
    if (data.noteEleveDashboardDTOList && data.noteEleveDashboardDTOList.length > 0) {
      const bulletinApi = data.noteEleveDashboardDTOList[0];
      this.bulletinsParEnfant[this.enfantActifId()] = {
        trimestre: bulletinApi.trimestre || 'Trimestre Actuel',
        moyenne: bulletinApi.moyenne || 0,
        rang: bulletinApi.rang || 0,
        effectif: (bulletinApi as any).effectif || 0,
        decision: bulletinApi.decision || '',
        notes: (bulletinApi.noteEleveDTOList || []).map(n => ({
          matiere: n.matiere || '',
          note: n.note || 0,
          coefficient: n.coefficient || 1,
          moyenneClasse: 12,
          appreciation: n.appreciation || '',
          professeur: n.professeur || '-'
        }))
      };
    } else {
      this.bulletinsParEnfant[1] = this.fallbackNotesEleve[0];
      this.bulletinsParEnfant[2] = this.fallbackNotesEleve[1];
      this.bulletinsParEnfant[3] = this.fallbackNotesEleve[2];
    }
  }

  changerEnfant(id: number) {
    this.enfantActifId.set(id);
  }

  getNoteColor(note: number): string {
    if (note >= 16) return 'vert';
    if (note >= 12) return 'bleu';
    if (note >= 10) return 'or';
    return 'rouge';
  }

  getStatusClass(statut: string): string {
    return statut === 'payé' ? 'succes' : statut === 'en_attente' ? 'attente' : 'retard';
  }

  getEventIcon(type: string): string {
    const icones: Record<string, string> = { examen: '📝', reunion: '👥', conseil: '📋', sortie: '🎒', sport: '⚽' };
    return icones[type] ?? '📅';
  }

  formatFCFA(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  toutVoir(url: string): void {
    this.router.navigate([url]);
  }
}