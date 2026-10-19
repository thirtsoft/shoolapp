import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsDemandeAvanceSalaireResponse } from '../../../../../core/models/rh/details-demande-avance-salaire-response';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { RhResourceService } from '../../../services/rh-resource-service';

@Component({
  selector: 'app-details-demande-avance-salaire-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './details-demande-avance-salaire-component.html',
  styleUrl: './details-demande-avance-salaire-component.css',
})
export class DetailsDemandeAvanceSalaireComponent {
  errorMessage?: string;
  demandeUuid?: string;
  isEdit: boolean = false;
  detailsDemande?: DetailsDemandeAvanceSalaireResponse;
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
    this.demandeUuid = this.activeRoute.snapshot.params['uuid'];
    this.initActionForm();
    if (this.demandeUuid != null && this.demandeUuid != undefined) {
      this.getDetailsDemandes(this.demandeUuid);
    }
  }

  getInitials(name?: string | null): string {
    if (!name) {
      return '?';
    }
    return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }
  /* 
    getDureeConge(): number {
      const debut = this.parseDateFrancaise(this.detailsConges.dateDebut);
      const fin = this.parseDateFrancaise(this.detailsConges.dateFin);
  
      if (!debut || !fin) {
        return 0;
      }
  
      const difference = fin.getTime() - debut.getTime();
  
      return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
    } */

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

  getDetailsDemandes(demandeUuid: string): void {
    this.rhResource.getDetailsBonSalairee(demandeUuid).subscribe({
      next: (data: any) => {
        this.detailsDemande = data;
      },
      error: (data: any) => {
        console.log(
          'error',
          'Erreur lors de la récupération des information de la demande : ' + data.error
        );

        this.toastService.error(
          'Erreur',
          'Erreur lors de la récupération : ' + data.error
        );
      }
    });
  }

  openEtatModal(content: any, action: 'envoyer' | 'approuver' | 'rejeter'): void {
    this.modalActionLabel = action;
    this.isMotifRequired = action === 'rejeter';

    const motifControl = this.actionForm.get('motifRejet');

    if (this.isMotifRequired) {
      motifControl?.setValidators([Validators.required, Validators.minLength(5)]);
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

  private executerAction(action: 'envoyer' | 'approuver' | 'rejeter'): void {
    if (this.demandeUuid == null) {
      this.toastService.error(
        'Erreur',
        'Impossible d\'identifier la demande de congé.'
      );
      return;
    }

    switch (action) {

      case 'envoyer':
        this.soumettreDemande(this.demandeUuid);
        break;

      case 'approuver':
        this.approuverDemande(this.demandeUuid);
        break;

      case 'rejeter':
        this.rejeterDemande(this.demandeUuid);
        break;
    }
  }

  private soumettreDemande(demandeUuid: string): void {
    this.rhResource.soumettreDemande(demandeUuid).subscribe({
      next: (data: any) => {
        this.toastService.success('Succès', 'La demande a été soumis avec succès.');
        this.getDetailsDemandes(demandeUuid);
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

  private approuverDemande(demandeUuid: string): void {

    this.rhResource.approuverDemande(demandeUuid).subscribe({
      next: (data: any) => {

        this.toastService.success(
          'Succès',
          'La demande a été approuvé avec succès.'
        );

        this.getDetailsDemandes(demandeUuid);
      },

      error: (err: any) => {

        this.toastService.error(
          'Erreur',
          'Impossible d\'approuver la demande : ' +
          (err.error?.message || err.message)
        );
      }
    });
  }

  private rejeterDemande(demandeUuid: string): void {

    const motifRejet = this.actionForm.get('motifRejet')?.value?.trim();

    if (!motifRejet) {
      this.actionForm.get('motifRejet')?.markAsTouched();
      this.toastService.warning(
        'Attention',
        'Le motif du rejet est obligatoire.'
      );

      return;
    }

    this.rhResource
      .refuserDemande(demandeUuid, motifRejet)
      .subscribe({
        next: (data: any) => {

          this.toastService.success(
            'Succès',
            'La demande a été rejeté avec succès.'
          );

          this.getDetailsDemandes(demandeUuid);
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
    const etat = this.detailsDemande?.etat;

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

  openConfirmationDialog(action: 'envoyer' | 'accepter' | 'rejeter'): void {
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
      envoyer: 'Êtes-vous sûr de vouloir soumettre cette demande de bon de salaire ?',
      accepter: 'Êtes-vous sûr de vouloir approuver cette demande de bon de salaire ?',
      rejeter: 'Êtes-vous sûr de vouloir rejeter cette demande de bon de salaire ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {

        if (result && this.demandeUuid != null) {

          switch (action) {

            case 'envoyer':
              this.soumettreDemande(this.demandeUuid);
              break;

            case 'accepter':
              this.approuverDemande(this.demandeUuid);
              break;

            case 'rejeter':
              this.rejeterDemande(this.demandeUuid);
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
