import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  EntreeFicheEmargementResponse,
  StatutSeanceEmargement
} from '../../../../../core/models/ficheemargement/entree-fiche-emargement-response.model';

import { FicheEmargementDetailResponseResponse } from '../../../../../core/models/ficheemargement/fiche-emargement-details-response.model';

import { forkJoin } from 'rxjs';
import { ModifierEntreeEmargementRequest } from '../../../../../core/models/ficheemargement/modifier-entree-emargement-request.model';
import { RhResourceService } from '../../../../rh/services/rh-resource-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-remplir-fiche-emargements-component',
  imports: [FormsModule],
  templateUrl: './remplir-fiche-emargements-component.html',
  styleUrl: './remplir-fiche-emargements-component.css',
})
export class RemplirFicheEmargementsComponent implements OnInit {

  private readonly rhService = inject(RhResourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastrService);
  private readonly modalService = inject(NgbModal);

  isSaving = false;

  messageSucces = '';
  messageErreur = '';

  ficheEmargement!: FicheEmargementDetailResponseResponse;

  entreesFiche: EntreeFicheEmargementResponse[] = [];

  errorMessage?: string;

  isLoading = false;

  ficheUuid?: string;

  @ViewChild('confirmationSoumissionModal')
  confirmationSoumissionModal!: TemplateRef<any>;

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
    this.messageErreur = '';
    this.messageSucces = '';

    this.rhService.getDetailsFicheEmargement(ficheUuid)
      .subscribe({

        next: (response: FicheEmargementDetailResponseResponse) => {

          this.ficheEmargement = response;

          this.entreesFiche = response.entrees ?? [];

          this.isLoading = false;
        },

        error: error => {

          console.error(
            'Erreur chargement détail fiche émargement :',
            error
          );

          this.errorMessage = 'Impossible de charger le détail de la fiche d’émargement.';
          this.isLoading = false;

          this.toastService.error(
            'Erreur',
            'Impossible de charger le détail de la fiche d’émargement.'
          );
        }
      });
  }

  get entrees(): EntreeFicheEmargementResponse[] {
    return this.entreesFiche;
  }

  get nombreSeancesPrevues(): number {
    return this.ficheEmargement?.nombreSeancesPrevues
      ?? this.entreesFiche.length;
  }

  get nombreSeancesEffectuees(): number {
    return this.entreesFiche.filter(entree =>
      entree.statutSeance === 'SEANCE_EFFECTUEE').length;
  }

  get nombreSeancesNonEffectuees(): number {
    return this.entreesFiche.filter(entree =>
      entree.statutSeance === 'SEANCE_NON_EFFECTUEE').length;
  }

  get nombreSeancesAnnulees(): number {
    return this.entreesFiche.filter(entree =>
      entree.statutSeance === 'SEANCE_ANNULEE').length;
  }

  get nombreSeancesPlanifiees(): number {
    return this.entreesFiche.filter(entree =>
      entree.statutSeance === 'SEANCE_PLANIFIEE').length;
  }

  get pourcentageAvancement(): number {
    if (this.nombreSeancesPrevues === 0) {
      return 0;
    }
    const renseignees =
      this.nombreSeancesEffectuees +
      this.nombreSeancesNonEffectuees +
      this.nombreSeancesAnnulees;

    return Math.round((renseignees / this.nombreSeancesPrevues) * 100);
  }

  get ficheComplete(): boolean {
    return this.nombreSeancesPlanifiees === 0;
  }

  get peutSoumettre(): boolean {
    return (
      !this.isSaving &&
      this.entreesFiche.some(
        entree => entree.statutSeance === 'SEANCE_EFFECTUEE'
      )
    );
  }

  modifierStatut(entree: EntreeFicheEmargementResponse): void {
    if (entree.statutSeance === 'SEANCE_PLANIFIEE') {
      entree.dateReelleEffectuee = null;
      entree.heureDebutReelle = null;
      entree.heureFinReelle = null;
      entree.observation = null;

      this.messageErreur = '';

      return;
    }

    if (entree.statutSeance === 'SEANCE_EFFECTUEE') {

      if (!entree.dateReelleEffectuee) {
        entree.dateReelleEffectuee = entree.dateCours;
      }

      if (!entree.heureDebutReelle) {
        entree.heureDebutReelle = entree.heureDebutPrevue ?? null;
      }

      if (!entree.heureFinReelle) {
        entree.heureFinReelle = entree.heureFinPrevue ?? null;
      }
    }

    if (entree.statutSeance === 'SEANCE_NON_EFFECTUEE' ||
      entree.statutSeance === 'SEANCE_ANNULEE') {

      entree.dateReelleEffectuee = null;
      entree.heureDebutReelle = null;
      entree.heureFinReelle = null;
    }

    this.messageErreur = '';
  }

  getStatutLibelle(statut: StatutSeanceEmargement): string {

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

  getStatutClass(statut: StatutSeanceEmargement): string {

    switch (statut) {

      case 'SEANCE_EFFECTUEE':
        return 'status-effectuee';

      case 'SEANCE_NON_EFFECTUEE':
        return 'status-non-effectuee';

      case 'SEANCE_ANNULEE':
        return 'status-annulee';

      case 'SEANCE_PLANIFIEE':
      default:
        return 'status-planifiee';
    }
  }

  getStatutIcon(statut: StatutSeanceEmargement): string {

    switch (statut) {

      case 'SEANCE_EFFECTUEE':
        return '✓';

      case 'SEANCE_NON_EFFECTUEE':
        return '!';

      case 'SEANCE_ANNULEE':
        return '×';

      case 'SEANCE_PLANIFIEE':
      default:
        return '◷';
    }
  }

  getDateLibelle(date: string): string {
    const dateObj = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(dateObj);
  }

  capitaliserPremiereLettre(value: string): string {
    if (!value) {
      return value;
    }
    return (value.charAt(0).toUpperCase() + value.slice(1));
  }

  validerHeures(entree: EntreeFicheEmargementResponse): void {
    this.messageErreur = '';

    if (entree.statutSeance !== 'SEANCE_EFFECTUEE') {
      return;
    }

    if (!entree.heureDebutReelle || !entree.heureFinReelle) {
      return;
    }

    if (entree.heureFinReelle <= entree.heureDebutReelle) {

      this.messageErreur = `L'heure de fin doit être supérieure à l'heure de début pour la séance du ${this.getDateLibelle(entree.dateCours)}.`;
      return;
    }
  }

  modifierObservation(entree: EntreeFicheEmargementResponse, value: string): void {
    entree.observation = value || null;
  }

  estObservationObligatoire(entree: EntreeFicheEmargementResponse): boolean {
    return (
      entree.statutSeance === 'SEANCE_NON_EFFECTUEE' ||
      entree.statutSeance === 'SEANCE_ANNULEE'
    );
  }

  estHeureObligatoire(entree: EntreeFicheEmargementResponse): boolean {
    return (entree.statutSeance === 'SEANCE_EFFECTUEE');
  }

  estDateReelleObligatoire(entree: EntreeFicheEmargementResponse): boolean {
    return (entree.statutSeance === 'SEANCE_EFFECTUEE');
  }

  peutEnregistrerEntree(entree: EntreeFicheEmargementResponse): boolean {

    // Une séance encore planifiée est valide pour un simple enregistrement.
    if (entree.statutSeance === 'SEANCE_PLANIFIEE') {
      return true;
    }

    // Séance effectuée
    if (entree.statutSeance === 'SEANCE_EFFECTUEE') {

      if (
        !entree.dateReelleEffectuee ||
        !entree.heureDebutReelle ||
        !entree.heureFinReelle
      ) {
        return false;
      }

      return entree.heureFinReelle > entree.heureDebutReelle;
    }

    // Séance non effectuée ou annulée
    if (
      entree.statutSeance === 'SEANCE_NON_EFFECTUEE' ||
      entree.statutSeance === 'SEANCE_ANNULEE'
    ) {
      return !!entree.observation?.trim();
    }

    return false;
  }

  enregistrerMaFiche(): void {

    this.messageErreur = '';
    this.messageSucces = '';

    if (!this.ficheEmargement) {
      this.messageErreur =
        'La fiche d’émargement n’est pas encore chargée.';
      return;
    }

    if (this.isSaving) {
      return;
    }

    /*
     * On vérifie uniquement les séances qui ont été renseignées.
     *
     * Une séance PLANIFIÉE est autorisée :
     * elle signifie simplement que l'enseignant ne l'a
     * pas encore renseignée.
     */
    const entreeInvalide = this.entreesFiche.find(
      entree => !this.peutEnregistrerEntree(entree)
    );

    if (entreeInvalide) {

      this.messageErreur =
        'Veuillez compléter les informations de la séance avant de l’enregistrer.';

      return;
    }

    /*
     * Double vérification des heures réelles.
     */
    for (const entree of this.entreesFiche) {

      if (
        entree.statutSeance === 'SEANCE_EFFECTUEE' &&
        entree.heureDebutReelle &&
        entree.heureFinReelle &&
        entree.heureFinReelle <= entree.heureDebutReelle
      ) {

        this.messageErreur =
          `L'heure de fin doit être supérieure à l'heure de début pour la séance du ${this.getDateLibelle(entree.dateCours)}.`;

        return;
      }
    }

    this.isSaving = true;

    /*
     * Le backend accepte également SEANCE_PLANIFIEE.
     *
     * On peut donc envoyer toutes les entrées.
     * Les entrées encore planifiées seront envoyées
     * avec leurs valeurs réelles à null.
     */
    const sauvegardes = this.entreesFiche.map(entree => {

      const request: ModifierEntreeEmargementRequest = {

        statutSeance: entree.statutSeance,

        dateReelleEffectuee:
          entree.dateReelleEffectuee ?? null,

        heureDebutReelle:
          entree.heureDebutReelle ?? null,

        heureFinReelle:
          entree.heureFinReelle ?? null,

        observation:
          entree.observation?.trim() || null
      };

      return this.rhService.modifierEntreeFicheEmargement(
        this.ficheEmargement.ficheUuid,
        entree.uuid,
        request
      );
    });

    forkJoin(sauvegardes).subscribe({

      next: () => {

        this.isSaving = false;

        this.messageSucces =
          'Votre fiche d’émargement a été enregistrée avec succès.';

        this.toastService.success(
          'Enregistrement réussi',
          'Les informations saisies ont été enregistrées.'
        );

      },

      error: error => {

        console.error(
          'Erreur lors de l’enregistrement de la fiche :',
          error
        );

        this.isSaving = false;

        this.messageErreur =
          'Une erreur est survenue lors de l’enregistrement de la fiche.';

        this.toastService.error(
          'Erreur',
          'La fiche n’a pas pu être entièrement enregistrée.'
        );

      }

    });
  }

  soumettreMaFiche(): void {
    this.messageErreur = '';
    this.messageSucces = '';

    if (!this.ficheEmargement) {
      this.messageErreur =
        'La fiche d’émargement n’est pas encore chargée.';
      return;
    }

    if (this.isSaving) {
      return;
    }

    const nombreSeancesEffectuees = this.entreesFiche.filter(
      entree => entree.statutSeance === 'SEANCE_EFFECTUEE'
    ).length;

    if (nombreSeancesEffectuees === 0) {
      this.messageErreur =
        'Vous devez renseigner au moins une séance comme effectuée avant de soumettre la fiche.';
      return;
    }

    /*
     * On vérifie uniquement les séances déclarées comme effectuées.
     */
    for (const entree of this.entreesFiche) {

      if (entree.statutSeance !== 'SEANCE_EFFECTUEE') {
        continue;
      }

      if (
        !entree.dateReelleEffectuee ||
        !entree.heureDebutReelle ||
        !entree.heureFinReelle
      ) {
        this.messageErreur =
          `Veuillez renseigner la date réelle ainsi que les heures de début et de fin pour la séance du ${this.getDateLibelle(entree.dateCours)}.`;
        return;
      }

      if (entree.heureFinReelle <= entree.heureDebutReelle) {
        this.messageErreur =
          `L'heure de fin doit être supérieure à l'heure de début pour la séance du ${this.getDateLibelle(entree.dateCours)}.`;
        return;
      }
    }

    /*
     * Toutes les vérifications sont OK :
     * on ouvre maintenant le modal de confirmation.
     */
    this.ouvrirConfirmationSoumission();
  }

ouvrirConfirmationSoumission(): void {
  const modalRef = this.modalService.open(
    this.confirmationSoumissionModal,
    {
      centered: true,
      backdrop: 'static',
      keyboard: false
    }
  );

  modalRef.result.then(
    result => {
      if (result === 'confirm') {
        this.confirmerSoumission();
      }
    },
    () => {
      // Fermeture sans confirmation
    }
  );
}

confirmerSoumission(): void {
  if (!this.ficheEmargement || this.isSaving) {
    return;
  }

  this.isSaving = true;
  this.messageErreur = '';
  this.messageSucces = '';

  this.rhService
    .soumettreFicheEmargement(this.ficheEmargement.ficheUuid)
    .subscribe({

      next: () => {

        this.isSaving = false;

        this.messageSucces =
          'Votre fiche d’émargement a été soumise à l’administration.';

        this.toastService.success(
          'Fiche soumise',
          'Votre fiche a été soumise à l’administration.'
        );

        this.chargerDetailsFicheEmargement(
          this.ficheEmargement!.ficheUuid
        );
      },

      error: error => {

        console.error(
          'Erreur lors de la soumission de la fiche :',
          error
        );

        this.isSaving = false;

        this.messageErreur =
          'Impossible de soumettre la fiche d’émargement.';

        this.toastService.error(
          'Erreur',
          'La fiche n’a pas pu être soumise.'
        );
      }
    });
}

  retour(): void {
    window.history.back();
  }
}