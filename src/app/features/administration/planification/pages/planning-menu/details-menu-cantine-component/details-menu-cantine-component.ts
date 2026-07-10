import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { DetailsPlanningRepas } from '../../../../../../core/models/planification/details-planning-repas';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-details-menu-cantine-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, TitleCasePipe],
  templateUrl: './details-menu-cantine-component.html',
  styleUrl: './details-menu-cantine-component.css',
})
export class DetailsMenuCantineComponent implements OnInit {

  errorMessage?: string;
  planningId?: number;
  isEdit: boolean = false;
  detailsPlanningRepas: DetailsPlanningRepas = {};
  title = "Détails réunion";
  disableAddButton = false;

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  targetEtatCode: string = '';
  isMotifRequired: boolean = false;

  libelleEtat = EtatLibelle;

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.planningId = this.activeRoute.snapshot.params['id'];
    if (this.planningId != null && this.planningId != undefined) {
      this.getDetailsPlanningRepas(this.planningId);
    }
  }

  initActionForm() {
    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });
  }

  getDetailsPlanningRepas(planningId: number) {
    this.planification.getDetailsResource('planification/planningrepas', planningId).subscribe({
      next: (data: any) => {
        this.detailsPlanningRepas = data;
        console.log('Details planningrepas', this.detailsPlanningRepas);
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du planning repas : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  openEtatModal(content: any, action: 'publier' | 'dépublier' | 'annuler' | 'cloturer' | 'reprogrammer', etatCode: string): void {
    this.modalActionLabel = action;
    this.targetEtatCode = etatCode;

    this.isMotifRequired = ['annuler', 'dépublier'].includes(action);

    if (!this.actionForm) {
      this.initActionForm();
    }

    const motifControl = this.actionForm.get('motifAnnulation');

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
          const payload = {
            nouvelEtatCode: this.targetEtatCode,
            motifAnnulation: this.actionForm.value.motifAnnulation || null
          };
          this.changerEtat(action, this.planningId!, payload);
        }
      },
      () => { }
    );
  }

  changerEtat(action: string, evalId: number, payload: any) {
    this.planification.changeEtatResource('planification/meeting', evalId, payload).subscribe({
      next: (data: any) => {
        const successMessages: { [key: string]: string } = {
          publier: `Le repas a été publiée avec succès.`,
          dépublier: `Le repas a été dépubliée.`,
          annuler: `Le repas a été annulée.`,
          cloturer: `Le repas est désormais marquée comme terminée.`,
          reprogrammer: `Le repas a été remise en planification.`
        };
        this.toastService.success('Succès', successMessages[action] || 'Action effectuée.');
        this.getDetailsPlanningRepas(this.planningId!);
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Impossible de modifier l\'état : ' + (err.error?.message || err.message));
      }
    });
  }

  getStatusClass(): string {
    const etat = this.detailsPlanningRepas.etat;
    if (['Publié', 'Validée'].includes(etat!)) return 'status-validated';
    if (['Programmé', 'Envoyée'].includes(etat!)) return 'status-sent';
    if (['Annulé', 'Dépublié'].includes(etat!)) return 'status-remise';
    return '';
  }

  openConfirmationDialog(action: 'publier' | 'valider' | 'deplublier' | 'annuler' | 'cloturer'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider ce repas ?',
    };
    const payload = null;

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.planningId!, payload);
        }
      })
      .catch(() => { });
  }


  goBack() {
    window.history.back();
  }


}


