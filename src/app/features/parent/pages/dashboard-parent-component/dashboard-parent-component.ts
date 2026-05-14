import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { DataService } from '../../../../shared/data.service';
import { ParentService } from '../../service/parent.service';

interface Note {
  matiere: string;
  note: number;
  coefficient: number;
  moyenneClasse: number;
  appreciation: string;
  professeur: string;
}

interface Bulletin {
  trimestre: string;
  moyenne: number;
  notes: Note[];
  rang: number;
  effectif: number;
  decision: string;
}

interface Absence {
  date: string;
  motif: string;
  justifie: boolean;
  heures: number;
}

interface Retard {
  date: string;
  duree: number;
  motif: string;
}

interface EmploiTemps {
  jour: string;
  creneaux: {
    heure: string;
    matiere: string;
    professeur: string;
    salle: string;
  }[];
}

interface Facture {
  id: string;
  libelle: string;
  montant: number;
  dateEmission: string;
  echeance: string;
  statut: 'payé' | 'en_attente' | 'en_retard';
}

interface Evenement {
  titre: string;
  date: string;
  type: 'examen' | 'reunion' | 'conseil' | 'sortie' | 'sport';
  description: string;
}

interface Message {
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
  ds = inject(DataService);

  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);
  private readonly parentService = inject(ParentService);

  parentDetails = signal<ParentDetails>({});
  parent = signal({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
  });


  ngOnInit() {
    this.chargerParentEtEleves();
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
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }


  // ── Liste des enfants du parent ──────────────────────
  enfants = signal([
    {
      id: 1,
      nom: 'Moussa Diop',
      classe: 'Terminale S2',
      anneeScolaire: '2025-2026',
      photo: '👦',
      moyenne: 14.5,
      absences: 3,
      retards: 2
    },
    {
      id: 2,
      nom: 'Fatima Diop',
      classe: 'Quatrième B',
      anneeScolaire: '2025-2026',
      photo: '👧',
      moyenne: 16.2,
      absences: 1,
      retards: 0
    },
    {
      id: 3,
      nom: 'Ibrahim Diop',
      classe: 'CP',
      anneeScolaire: '2025-2026',
      photo: '🧒',
      moyenne: 17.8,
      absences: 0,
      retards: 1
    }
  ]);

  // Enfant actuellement sélectionné
  enfantActifId = signal(1);

  // Computed pour l'enfant actif
  enfantActif = computed(() =>
    this.enfants().find(e => e.id === this.enfantActifId()) ?? this.enfants()[0]
  );

  private readonly bulletinsParEnfant: Record<number, Bulletin> = {
    1: {
      trimestre: '2ème Trimestre',
      moyenne: 14.5,
      notes: [
        { matiere: 'Mathématiques', note: 16, coefficient: 5, moyenneClasse: 12, appreciation: 'Excellent travail', professeur: 'M. Sall' },
        { matiere: 'Physique-Chimie', note: 14, coefficient: 4, moyenneClasse: 11.5, appreciation: 'Bon niveau', professeur: 'Mme Diouf' },
        { matiere: 'SVT', note: 15.5, coefficient: 3, moyenneClasse: 13, appreciation: 'Très bien', professeur: 'M. Ndiaye' },
        { matiere: 'Français', note: 13, coefficient: 3, moyenneClasse: 10.5, appreciation: 'Progrès constants', professeur: 'Mme Fall' },
        { matiere: 'Anglais', note: 14, coefficient: 2, moyenneClasse: 12, appreciation: 'Bien', professeur: 'M. Diallo' },
        { matiere: 'Histoire-Géo', note: 15, coefficient: 2, moyenneClasse: 13, appreciation: 'Très bon travail', professeur: 'Mme Bâ' },
        { matiere: 'Philosophie', note: 12, coefficient: 2, moyenneClasse: 10, appreciation: 'En progression', professeur: 'M. Sow' },
      ],
      rang: 5,
      effectif: 38,
      decision: 'Passage en classe supérieure'
    },
    2: {
      trimestre: '2ème Trimestre',
      moyenne: 16.2,
      notes: [
        { matiere: 'Mathématiques', note: 17, coefficient: 4, moyenneClasse: 12, appreciation: 'Excellent', professeur: 'Mme Sow' },
        { matiere: 'Français', note: 16, coefficient: 4, moyenneClasse: 11, appreciation: 'Très bon travail', professeur: 'M. Dieng' },
        { matiere: 'Anglais', note: 15, coefficient: 3, moyenneClasse: 12.5, appreciation: 'Bon niveau', professeur: 'Mme Dia' },
        { matiere: 'Histoire-Géo', note: 16.5, coefficient: 3, moyenneClasse: 12, appreciation: 'Très bien', professeur: 'M. Kane' },
        { matiere: 'SVT', note: 15, coefficient: 2, moyenneClasse: 11, appreciation: 'Bien', professeur: 'Mme Fall' },
        { matiere: 'Physique-Chimie', note: 17, coefficient: 2, moyenneClasse: 10.5, appreciation: 'Excellent', professeur: 'M. Seck' },
      ],
      rang: 2,
      effectif: 42,
      decision: 'Passage en classe supérieure'
    },
    3: {
      trimestre: '2ème Trimestre',
      moyenne: 17.8,
      notes: [
        { matiere: 'Mathématiques', note: 18, coefficient: 3, moyenneClasse: 14, appreciation: 'Excellent !', professeur: 'Mme Thiam' },
        { matiere: 'Français', note: 17, coefficient: 3, moyenneClasse: 13, appreciation: 'Très bon travail', professeur: 'M. Mbaye' },
        { matiere: 'Découverte du monde', note: 18.5, coefficient: 2, moyenneClasse: 15, appreciation: 'Excellent', professeur: 'Mme Diop' },
      ],
      rang: 1,
      effectif: 35,
      decision: 'Passage en classe supérieure'
    }
  };

  private readonly absencesParEnfant: Record<number, Absence[]> = {
    1: [
      { date: '2026-03-05', motif: 'Raison médicale', justifie: true, heures: 4 },
      { date: '2026-03-12', motif: 'Raison familiale', justifie: true, heures: 2 },
    ],
    2: [
      { date: '2026-03-10', motif: 'Maladie', justifie: true, heures: 3 },
    ],
    3: []
  };

  private readonly retardsParEnfant: Record<number, Retard[]> = {
    1: [
      { date: '2026-03-08', duree: 15, motif: 'Embouteillage' },
      { date: '2026-03-15', duree: 10, motif: 'Transport' },
    ],
    2: [],
    3: [
      { date: '2026-03-20', duree: 5, motif: 'Réveil tardif' },
    ]
  };

  dernierBulletin = computed(() => this.bulletinsParEnfant[this.enfantActifId()]);
  absencesMois = computed(() => this.absencesParEnfant[this.enfantActifId()] || []);
  retardsMois = computed(() => this.retardsParEnfant[this.enfantActifId()] || []);

  // Remplacer les signals simples par des computed
  totalAbsences = computed(() => this.absencesMois().length);
  totalRetards = computed(() => this.retardsMois().length);
  absencesJustifiees = computed(() => this.absencesMois().filter(a => a.justifie).length);

  // ── Méthode pour changer d'enfant ──────────────────
  changerEnfant(id: number) {
    this.enfantActifId.set(id);
    // Optionnel : recharger les données depuis le service
    // this.loadDonneesEnfant(id);
  }

  // ── Emploi du temps du jour ─────────────────────────
  edtJour = signal<EmploiTemps>({
    jour: 'Mardi',
    creneaux: [
      { heure: '08:00 - 10:00', matiere: 'Mathématiques', professeur: 'M. Sall', salle: 'Salle 12' },
      { heure: '10:00 - 10:15', matiere: 'Récréation', professeur: '-', salle: 'Cour' },
      { heure: '10:15 - 12:15', matiere: 'Physique-Chimie', professeur: 'Mme Diouf', salle: 'Labo 3' },
      { heure: '12:15 - 14:00', matiere: 'Pause déjeuner', professeur: '-', salle: 'Cantine' },
      { heure: '14:00 - 16:00', matiere: 'SVT', professeur: 'M. Ndiaye', salle: 'Salle 8' },
      { heure: '16:00 - 18:00', matiere: 'Français', professeur: 'Mme Fall', salle: 'Salle 5' },
    ]
  });

  // ── Factures ─────────────────────────────────────────
  factures = signal<Facture[]>([
    { id: 'FAC-2026-001', libelle: 'Frais de scolarité - 2ème trimestre', montant: 250000, dateEmission: '2026-01-15', echeance: '2026-03-15', statut: 'en_retard' },
    { id: 'FAC-2026-002', libelle: 'Demi-pension - Mars 2026', montant: 50000, dateEmission: '2026-03-01', echeance: '2026-03-30', statut: 'en_attente' },
  ]);

  totalFactures = computed(() => this.factures().reduce((s, f) => s + f.montant, 0));
  facturesEnRetard = computed(() => this.factures().filter(f => f.statut === 'en_retard').length);

  // ── Événements à venir ──────────────────────────────
  evenements = signal<Evenement[]>([
    { titre: 'Conseil de classe 2ème trimestre', date: '25 Mars 2026', type: 'conseil', description: 'Décision d\'orientation' },
    { titre: 'Réunion parents-professeurs', date: '28 Mars 2026 à 17h', type: 'reunion', description: 'Bilan du trimestre' },
    { titre: 'Bac blanc - Mathématiques', date: '3 Avril 2026', type: 'examen', description: 'Épreuve de 4h' },
    { titre: 'Sortie pédagogique', date: '10 Avril 2026', type: 'sortie', description: 'Musée des Civilisations' },
  ]);

  // ── Messages récents ────────────────────────────────
  messages = signal<Message[]>([
    { id: 'MSG-001', expediteur: 'M. Sall', role: 'Prof. Maths', sujet: 'Progrès en mathématiques', date: '15 Mars 2026', nonLu: true, contenu: 'Votre enfant montre de réels progrès...' },
    { id: 'MSG-002', expediteur: 'Administration', role: 'Admin', sujet: 'Rappel paiement frais scolarité', date: '14 Mars 2026', nonLu: true, contenu: 'Nous vous rappelons que...' },
    { id: 'MSG-003', expediteur: 'Mme Fall', role: 'Prof. Français', sujet: 'Remise des copies', date: '12 Mars 2026', nonLu: false, contenu: 'Les copies du dernier devoir...' },
  ]);

  messagesNonLus = computed(() => this.messages().filter(m => m.nonLu).length);

  // ── Méthodes ─────────────────────────────────────────
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
    const icones: Record<string, string> = {
      examen: '📝',
      reunion: '👥',
      conseil: '📋',
      sortie: '🎒',
      sport: '⚽'
    };
    return icones[type] ?? '📅';
  }

  formatFCFA(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  toutVoir(url: string): void {
    this.router.navigate([url]);
  }
}
