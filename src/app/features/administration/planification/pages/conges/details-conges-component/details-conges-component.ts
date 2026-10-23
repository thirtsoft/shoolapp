import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsConges } from '../../../../../../core/models/planification/details-conge';
import { RhResourceService } from '../../../../../rh/services/rh-resource-service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-details-conges-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './details-conges-component.html',
  styleUrl: './details-conges-component.css',
})
export class DetailsCongesComponent implements OnInit {

  errorMessage?: string;
  congesId?: number;
  isEdit: boolean = false;
  detailsConges: DetailsConges = {};
  title = "Détails congés";
  disableAddButton = false;

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  isMotifRequired: boolean = false;

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly rhResource = inject(RhResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.congesId = this.activeRoute.snapshot.params['id'];

    this.initActionForm();

    if (this.congesId != null && this.congesId != undefined) {
      this.getDetailsConges(this.congesId);
    }
  }

  getInitials(name?: string | null): string {
    if (!name) {
      return '?';
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getDureeConge(): number {
    const debut = this.parseDateFrancaise(this.detailsConges.dateDebut);
    const fin = this.parseDateFrancaise(this.detailsConges.dateFin);

    if (!debut || !fin) {
      return 0;
    }

    const difference = fin.getTime() - debut.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }

  private parseDateFrancaise(dateString?: string | null): Date | null {
    if (!dateString) {
      return null;
    }

    const mois: Record<string, number> = {
      janvier: 0,
      février: 1,
      fevrier: 1,
      mars: 2,
      avril: 3,
      mai: 4,
      juin: 5,
      juillet: 6,
      août: 7,
      aout: 7,
      septembre: 8,
      octobre: 9,
      novembre: 10,
      décembre: 11,
      decembre: 11
    };

    const match = dateString
      .toLowerCase()
      .trim()
      .match(
        /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+(\d{1,2})\s+([a-zàâçéèêëîïôûùüÿ]+)\s+(\d{4})/i
      );

    if (!match) {
      return null;
    }

    const jour = Number(match[1]);
    const moisNom = match[2];
    const annee = Number(match[3]);

    const moisIndex = mois[moisNom];

    if (
      Number.isNaN(jour) ||
      Number.isNaN(annee) ||
      moisIndex === undefined
    ) {
      return null;
    }

    return new Date(annee, moisIndex, jour);
  }

  initActionForm(): void {
    this.actionForm = this.fb.group({
      motifRejet: ['']
    });
  }

  getDetailsConges(congesId: number): void {
    this.planification.getDetailsResource('conges', congesId).subscribe({
      next: (data: any) => {
        this.detailsConges = data;
      },
      error: (data: any) => {
        console.log(
          'error',
          'Erreur lors de la récupération des information du congé : ' + data.error
        );

        this.toastService.error(
          'Erreur',
          'Erreur lors de la récupération : ' + data.error
        );
      }
    });
  }

  openEtatModal(
    content: any,
    action: 'envoyer' | 'approuver' | 'rejeter'
  ): void {

    this.modalActionLabel = action;
    this.isMotifRequired = action === 'rejeter';

    const motifControl = this.actionForm.get('motifRejet');

    if (this.isMotifRequired) {
      motifControl?.setValidators([
        Validators.required,
        Validators.minLength(5)
      ]);
    } else {
      motifControl?.clearValidators();
    }

    motifControl?.updateValueAndValidity();

    this.actionForm.reset();

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.executerAction(action);
        }
      },
      () => { }
    );
  }

  private executerAction(
    action: 'envoyer' | 'approuver' | 'rejeter'
  ): void {

    if (this.congesId == null) {
      this.toastService.error(
        'Erreur',
        'Impossible d\'identifier la demande de congé.'
      );
      return;
    }

    switch (action) {

      case 'envoyer':
        this.soumettreConges(this.congesId);
        break;

      case 'approuver':
        this.approuverConges(this.congesId);
        break;

      case 'rejeter':
        this.rejeterConges(this.congesId);
        break;
    }
  }

  private soumettreConges(congesId: number): void {

    this.rhResource.soumettreConges(congesId).subscribe({
      next: (data: any) => {

        this.toastService.success(
          'Succès',
          'Le congé a été soumis avec succès.'
        );

        this.getDetailsConges(congesId);
      },

      error: (err: any) => {

        this.toastService.error(
          'Erreur',
          'Impossible de soumettre le congé : ' +
          (err.error?.message || err.message)
        );
      }
    });
  }

  private approuverConges(congesId: number): void {

    this.rhResource.approuverConges(congesId).subscribe({
      next: (data: any) => {

        this.toastService.success(
          'Succès',
          'Le congé a été approuvé avec succès.'
        );

        this.getDetailsConges(congesId);
      },

      error: (err: any) => {

        this.toastService.error(
          'Erreur',
          'Impossible d\'approuver le congé : ' +
          (err.error?.message || err.message)
        );
      }
    });
  }

  private rejeterConges(congesId: number): void {

    const motifRejet = this.actionForm
      .get('motifRejet')
      ?.value
      ?.trim();

    if (!motifRejet) {

      this.actionForm.get('motifRejet')?.markAsTouched();

      this.toastService.warning(
        'Attention',
        'Le motif du rejet est obligatoire.'
      );

      return;
    }

    this.rhResource
      .refuserConges(congesId, motifRejet)
      .subscribe({
        next: (data: any) => {

          this.toastService.success(
            'Succès',
            'Le congé a été rejeté avec succès.'
          );

          this.getDetailsConges(congesId);
        },

        error: (err: any) => {

          this.toastService.error(
            'Erreur',
            'Impossible de rejeter le congé : ' +
            (err.error?.message || err.message)
          );
        }
      });
  }

  getStatusClass(): string {
    const etat = this.detailsConges.etat;

    if (['Envoyée'].includes(etat!)) {
      return 'status-sent';
    }

    if (['Accepte'].includes(etat!)) {
      return 'status-validated';
    }

    if (['Rejete'].includes(etat!)) {
      return 'status-remise';
    }

    if (['En Attente'].includes(etat!)) {
      return 'status-pending';
    }

    return '';
  }

  openConfirmationDialog(
    action: 'envoyer' | 'accepter' | 'rejeter'
  ): void {

    const modalRef = this.modalService.open(
      ConfirmationDialogModalComponent,
      {
        centered: true,
        backdrop: 'static',
      }
    );

    const titles: { [key: string]: string } = {
      envoyer: 'Confirmer la soumission',
      accepter: 'Confirmer l\'approbation',
      rejeter: 'Confirmer le rejet',
    };

    const messages: { [key: string]: string } = {
      envoyer: 'Êtes-vous sûr de vouloir soumettre cette demande de congé ?',
      accepter: 'Êtes-vous sûr de vouloir approuver cette demande de congé ?',
      rejeter: 'Êtes-vous sûr de vouloir rejeter cette demande de congé ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {

        if (result && this.congesId != null) {

          switch (action) {

            case 'envoyer':
              this.soumettreConges(this.congesId);
              break;

            case 'accepter':
              this.approuverConges(this.congesId);
              break;

            case 'rejeter':
              this.rejeterConges(this.congesId);
              break;
          }
        }
      })
      .catch(() => { });
  }

  goBack() {
    window.history.back();
  }

}