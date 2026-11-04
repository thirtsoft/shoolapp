import { Location } from '@angular/common';
import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EntreeFicheEmargementResponse } from '../../../../../core/models/ficheemargement/entree-fiche-emargement-response.model';
import { FicheEmargementDetailResponseResponse } from '../../../../../core/models/ficheemargement/fiche-emargement-details-response.model';
import { RhResourceService } from '../../../services/rh-resource-service';

type ActionFicheEmargement = 'VALIDER' | 'REJETER';


@Component({
  selector: 'app-details-fiche-emargement-component',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './details-fiche-emargement-component.html',
  styleUrl: './details-fiche-emargement-component.css',
})
export class DetailsFicheEmargementComponent implements OnInit {

  private readonly location = inject(Location);
  private readonly rhService = inject(RhResourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastrService);
  private readonly modalService = inject(NgbModal);

  fiche!: FicheEmargementDetailResponseResponse;

  entrees: EntreeFicheEmargementResponse[] = [];

  errorMessage?: string;
  successMessage?: string;

  isLoading = false;
  ficheUuid?: string;

  modalAction: ActionFicheEmargement = 'VALIDER';
  motifRetour = '';
  isProcessing = false;

  ngOnInit(): void {

    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (!uuid) {
      this.toastService.error(
        'Fiche introuvable',
        'Aucun identifiant de fiche d’émargement n’a été fourni.'
      );

      this.errorMessage = 'Aucun identifiant de fiche d’émargement n’a été fourni.';
      return;
    }

    this.ficheUuid = uuid;

    this.chargerDetailsFicheEmargement(uuid);
  }

  chargerDetailsFicheEmargement(ficheUuid: string): void {

    this.isLoading = true;
    this.errorMessage = undefined;

    this.rhService
      .getDetailsFicheEmargement(ficheUuid)
      .subscribe({
        next: (response: FicheEmargementDetailResponseResponse) => {

          this.fiche = response;

          this.entrees = response.entrees ?? [];

          this.isLoading = false;
        },

        error: error => {

          console.error('Erreur chargement détail fiche émargement :', error);

          this.errorMessage = 'Impossible de charger le détail de la fiche d’émargement.';

          this.isLoading = false;

          this.toastService.error(
            'Erreur',
            'Impossible de charger le détail de la fiche d’émargement.'
          );
        }
      });
  }

  get nombreSeancesPrevues(): number {
    return this.fiche?.nombreSeancesPrevues ?? 0;
  }

  get nombreSeancesEffectuees(): number {
    return this.fiche?.nombreSeancesEffectuees ?? 0;
  }

  get nombreSeancesNonEffectuees(): number {
    return this.fiche?.nombreSeancesNonEffectuees ?? 0;
  }

  get nombreSeancesAnnulees(): number {
    return this.fiche?.nombreSeancesAnnulees ?? 0;
  }

  //
  get nombreHeuresPrevu(): number {
    return this.fiche?.nombreHeuresPrevu ?? 0;
  }

  get nombreHeuresEffectue(): number {
    return this.fiche?.nombreHeuresEffectue ?? 0;
  }

  formaterHeures(heures: number | null | undefined): string {
    const totalMinutes = Math.round(Number(heures ?? 0) * 60);
    const heuresEntieres = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heuresEntieres}h${String(minutes).padStart(2, '0')}`;
  }

  get progressionHeures(): number {
    if (this.nombreHeuresPrevu <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.nombreHeuresEffectue / this.nombreHeuresPrevu) * 100));
  }
  //

  get progression(): number {
    if (this.nombreSeancesPrevues <= 0) {
      return 0;
    }
    return Math.round((this.nombreSeancesEffectuees / this.nombreSeancesPrevues) * 100);
  }

  getInitiales(): string {

    if (!this.fiche) {
      return '';
    }

    const prenom = this.fiche.enseignantPrenom?.trim() ?? '';
    const nom = this.fiche.enseignantNom?.trim() ?? '';

    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getEtatClass(): string {

    if (!this.fiche) {
      return 'progress';
    }

    switch (this.fiche.etatCode) {

      case 'E4':
        return 'validated';

      case 'E3':
        return 'submitted';

      case 'E16':
        return 'returned';

      case 'E8':
      default:
        return 'progress';
    }
  }

  getEtatIcon(): string {
    if (!this.fiche) {
      return '●';
    }
    switch (this.fiche.etatCode) {

      case 'E4':
        return '✓';

      case 'E3':
        return '!';

      case 'E16':
        return '↻';

      case 'E8':
      default:
        return '●';
    }
  }

  getEtatLibelle(): string {

    if (!this.fiche) {
      return '';
    }
    return this.fiche.etatLibelle;
  }

  getStatutClass(statut: string): string {

    switch (statut) {

      case 'SEANCE_EFFECTUEE':
        return 'effectuee';

      case 'SEANCE_NON_EFFECTUEE':
        return 'non-effectuee';

      case 'SEANCE_ANNULEE':
        return 'annulee';

      case 'SEANCE_PLANIFIEE':
      default:
        return 'planifiee';
    }
  }

  getStatutIcon(statut: string): string {

    switch (statut) {

      case 'SEANCE_EFFECTUEE':
        return '✓';

      case 'SEANCE_NON_EFFECTUEE':
        return '!';

      case 'SEANCE_ANNULEE':
        return '×';

      case 'SEANCE_PLANIFIEE':
      default:
        return '○';
    }
  }

  getStatutLibelle(statut: string): string {

    switch (statut) {

      case 'SEANCE_EFFECTUEE':
        return 'Effectuée';

      case 'SEANCE_NON_EFFECTUEE':
        return 'Non effectuée';

      case 'SEANCE_ANNULEE':
        return 'Annulée';

      case 'SEANCE_PLANIFIEE':
      default:
        return 'Planifiée';
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '—';
    }

    const value = new Date(`${date}T00:00:00`);

    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value);
  }

  formatDateLongue(date: string | null | undefined): string {

    if (!date) {
      return '—';
    }

    const value = new Date(`${date}T00:00:00`);

    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(value);
  }

  formatDateTime(dateTime: string | null | undefined): string {

    if (!dateTime) {
      return '—';
    }

    const value = new Date(dateTime);

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(value);
  }

  ouvrirModalDecision(content: TemplateRef<any>, action: ActionFicheEmargement): void {
    if (!this.fiche || this.fiche.etatCode !== 'E3' || this.isProcessing) {
      return;
    }
    this.modalAction = action;
    this.motifRetour = '';
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'md'
    });
  }

  confirmerDecision(modal: NgbModalRef): void {

    if (this.isProcessing || !this.fiche?.ficheUuid) {
      return;
    }

    const motif = this.motifRetour.trim();

    if (this.modalAction === 'REJETER' && motif.length < 5) {
      return;
    }

    this.isProcessing = true;

    const ficheUuid = this.fiche.ficheUuid;

    const requete$ = this.modalAction === 'VALIDER'
      ? this.rhService.validerFicheEmargement(ficheUuid)
      : this.rhService.retournerFicheEmargement(ficheUuid, {
        motifRetour: motif
      });

    requete$.subscribe({

      next: () => {

        this.isProcessing = false;

        modal.close('success');

        if (this.modalAction === 'VALIDER') {
          this.toastService.success(
            'La fiche d’émargement a été validée avec succès.',
            'Validation réussie'
          );
        } else {
          this.toastService.success(
            'La fiche a été retournée à l’enseignant.',
            'Fiche retournée'
          );
        }
        this.chargerDetailsFicheEmargement(ficheUuid);
      },

      error: (error) => {

        this.isProcessing = false;

        const message =
          error?.error?.message ||
          'Une erreur est survenue lors du traitement de la fiche.';

        this.toastService.error(message, 'Opération impossible');
      }
    });
  }

  retour(): void {
    this.location.back();
  }
}