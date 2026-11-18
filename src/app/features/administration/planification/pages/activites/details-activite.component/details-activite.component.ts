import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { EtatCode } from '../../../../../../core/constants/etat-code';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { ActiviteScolaireDetail } from '../../../../../../core/models/planification/activite-details.model';
import { PlanificationResourceService } from '../../../services/planification-resource.service';


@Component({
  selector: 'app-details-activite',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './details-activite.component.html',
  styleUrl: './details-activite.component.css'
})
export class DetailsActiviteComponent implements OnInit {

  errorMessage?: string;

  activiteId?: number;

  activite?: ActiviteScolaireDetail;

  title = 'Détails activité';

  disableAddButton = false;

  actionForm!: FormGroup;

  modalActionLabel = '';

  targetEtatCode = '';

  isMotifRequired = false;

  libelleEtat = EtatLibelle;

  codeEtat = EtatCode;


  private readonly planification =
    inject(PlanificationResourceService);

  private readonly modalService =
    inject(NgbModal);

  private readonly toastService =
    inject(ToastrService);

  private readonly activeRoute =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly fb =
    inject(FormBuilder);


  constructor() {

    const id =
      this.activeRoute.snapshot.params['id'];

    if (id != null) {
      this.activiteId = Number(id);
    }

  }


  ngOnInit(): void {

    this.initActionForm();

    if (this.activiteId != null) {
      this.getDetailsActivite(this.activiteId);
    }

  }


  /**
   * Initialise le formulaire utilisé
   * uniquement pour l'annulation.
   */
  initActionForm(): void {

    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });

  }


  /**
   * Récupère le détail de l'activité.
   *
   * L'API détermine elle-même s'il s'agit
   * d'un événement ou d'une réunion.
   */
  getDetailsActivite(activiteId: number): void {

    this.planification
      .getDetailsResource(
        'planification/activites-administration',
        activiteId
      )
      .subscribe({

        next: (data) => {

          this.activite =
            data as ActiviteScolaireDetail;

        },

        error: (error) => {

          console.error(
            'Erreur lors de la récupération de l’activité :',
            error
          );

          this.errorMessage =
            'Erreur lors de la récupération des informations de l’activité.';

          this.toastService.error(
            'Erreur',
            this.errorMessage
          );

        }

      });

  }


  /**
   * Convertit le libellé retourné par l'API
   * vers le code métier frontend.
   *
   * Exemple :
   * "Publié"    -> E5
   * "Brouillon" -> E1
   * "Dépublié"  -> E6
   * "Terminé"   -> E9
   * "Annulé"    -> E11
   */
  getEtatCode(): string {

    const etatLibelle =
      this.activite?.etat?.trim();

    if (!etatLibelle) {
      return '';
    }

    switch (etatLibelle) {

      case this.libelleEtat.LIBELLE_ETAT_BROUILLON:
        return this.codeEtat.ETAT_BROUILLON;

      case this.libelleEtat.LIBELLE_ETAT_PUBLIE:
        return this.codeEtat.ETAT_PUBLIE;

      case this.libelleEtat.LIBELLE_ETAT_DEPUBLIE:
        return this.codeEtat.ETAT_DEPUBLIE;

      case this.libelleEtat.LIBELLE_ETAT_TERMINE:
        return this.codeEtat.ETAT_TERMINE;

      case this.libelleEtat.LIBELLE_ETAT_ANNULE:
        return this.codeEtat.ETAT_ANNULE;

      default:
        return '';

    }

  }


  /**
   * Vérifie si l'activité possède
   * l'état métier demandé.
   */
  isEtat(code: string): boolean {

    return this.getEtatCode() === code;

  }


  /**
   * Classe CSS correspondant à l'état.
   */
  getEtatClass(): string {

    const etat =
      this.getEtatCode();

    switch (etat) {

      case this.codeEtat.ETAT_PUBLIE:
        return 'status-validated';

      case this.codeEtat.ETAT_BROUILLON:
        return 'status-sent';

      case this.codeEtat.ETAT_DEPUBLIE:
        return 'status-remise';

      case this.codeEtat.ETAT_ANNULE:
        return 'status-remise';

      case this.codeEtat.ETAT_TERMINE:
        return 'status-validated';

      default:
        return '';

    }

  }


  /**
   * Libellé de l'état retourné par l'API.
   */
  getEtatLabel(): string {

    return this.activite?.etat || '—';

  }


  /**
   * Formatage de la date.
   *
   * 2026-06-05 -> 05/06/2026
   */
  formatDate(date?: string | null): string {

    if (!date) {
      return '—';
    }

    const parts =
      date.split('-');

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

  }


  /**
   * Formatage de l'heure.
   *
   * 16:00:00 -> 16:00
   */
  formatHeure(heure?: string | null): string {

    if (!heure) {
      return '—';
    }

    return heure.substring(0, 5);

  }

  openEtatModal(
    content: any,
    action:
      | 'publier'
      | 'dépublier'
      | 'annuler'
      | 'terminer'
      | 'reprogrammer',
    etatCode: string
  ): void {

    this.modalActionLabel = action;
    this.targetEtatCode = etatCode;
    this.isMotifRequired = action === 'annuler';

    const motifControl =
      this.actionForm.get('motifAnnulation');

    if (this.isMotifRequired) {
      motifControl?.setValidators([
        Validators.required,
        Validators.minLength(5)
      ]);
    } else {
      motifControl?.clearValidators();
    }

    motifControl?.reset();
    motifControl?.updateValueAndValidity();

    this.modalService
      .open(content, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'etat-activite-modal'
      })
      .result
      .then(
        (result) => {

          if (result !== 'confirm') {
            return;
          }

          const motif =
            this.actionForm
              .get('motifAnnulation')
              ?.value
              ?.trim();

          const payload = {
            nouvelEtatCode: this.targetEtatCode,
            motifAnnulation:
              this.isMotifRequired
                ? motif || null
                : null
          };

          this.changerEtat(
            action,
            this.activiteId!,
            payload
          );
        },
        () => { }
      );
  }


  changerEtat(
    action: string,
    activiteId: number,
    payload: {
      nouvelEtatCode: string;
      motifAnnulation: string | null;
    }
  ): void {

    const endpoint =
      this.activite?.type === 'REUNION'
        ? 'planification/meeting'
        : 'planification/evenement';


    this.planification
      .changeEtatResource(
        endpoint,
        activiteId,
        payload
      )
      .subscribe({

        next: () => {

          const type =
            this.activite?.type === 'REUNION'
              ? 'réunion'
              : 'événement';


          const successMessages: {
            [key: string]: string;
          } = {

            publier:
              `La ${type} a été publiée avec succès.`,

            dépublier:
              `La ${type} a été dépubliée avec succès.`,

            annuler:
              `La ${type} a été annulée avec succès.`,

            terminer:
              `La ${type} est désormais marquée comme terminée.`,

            reprogrammer:
              `La ${type} a été republiée avec succès.`

          };


          this.toastService.success(
            'Succès',
            successMessages[action]
            || 'Action effectuée avec succès.'
          );


          /*
           * Recharge le détail afin d'actualiser :
           *
           * - l'état
           * - la date de publication
           * - la date de dépublication
           * - le motif d'annulation
           */
          this.getDetailsActivite(
            activiteId
          );

        },


        error: (err: any) => {

          console.error(
            'Erreur lors du changement d’état :',
            err
          );


          const message =
            err?.error?.message
            || err?.message
            || 'Une erreur est survenue lors de la modification de l’état.';


          this.toastService.error(
            'Erreur',
            message
          );

        }

      });

  }


  /**
   * Message affiché dans la card Actions.
   */
  getActionMessage(): string {

    if (!this.activite) {
      return '';
    }


    if (
      this.isEtat(
        this.codeEtat.ETAT_BROUILLON
      )
    ) {

      return 'Cette activité est en brouillon et peut être publiée.';

    }


    if (
      this.isEtat(
        this.codeEtat.ETAT_PUBLIE
      )
    ) {

      return 'Cette activité est actuellement publiée.';

    }


    if (
      this.isEtat(
        this.codeEtat.ETAT_DEPUBLIE
      )
    ) {

      return 'Cette activité est dépubliée et peut être republiée.';

    }


    if (
      this.isEtat(
        this.codeEtat.ETAT_TERMINE
      )
    ) {

      return 'Cette activité est terminée.';

    }


    if (
      this.isEtat(
        this.codeEtat.ETAT_ANNULE
      )
    ) {

      return 'Cette activité a été annulée.';

    }


    return '';

  }


  /**
   * Retour à la liste des activités.
   */
  goBack(): void {

    void this.router.navigate([
      'admin/planification/activites'
    ]);

  }


  /**
   * Alias conservé si utilisé ailleurs
   * dans le composant ou le template.
   */
  retour(): void {

    this.goBack();

  }

}