import { TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsConges } from '../../../../../core/models/planification/details-conge';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-details-conge-component',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './details-conge-component.html',
  styleUrl: './details-conge-component.css',
})
export class DetailsCongeComponent implements OnInit {

  errorMessage?: string;
  congesId?: number;
  detailsConges: DetailsConges = {};
  isEditMode = false;
  title = "Détails congés";
  modalActionLabel: string = '';


  disableAddButton = false;

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.congesId = this.activeRoute.snapshot.params['id'];
    if (this.congesId != null && this.congesId != undefined) {
      this.getDetailsConges(this.congesId);
    }
  }

  getDetailsConges(congesId: number) {
    this.planification.getDetailsResource('conges', congesId).subscribe({
      next: (data: any) => {
        this.detailsConges = data;
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du congé : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la récupération : ' + data.error);
      }
    }
    );
  }

  openEtatModal(content: any, action: 'envoyer'): void {
    this.modalActionLabel = action;
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.changerEtat(action, Number(this.congesId));
        }
      },
      () => { }
    );
  }

  changerEtat(action: string, evalId: number) {
    this.planification.envoyerUneDemande('conges', evalId).subscribe({
      next: (data: any) => {
        const successMessages: { [key: string]: string } = {
          envoyer: `La demande de congé est envoyée avec succès.`,
        };
        this.toastService.success('Succès', successMessages[action] || 'Action effectuée.');
        this.getDetailsConges(this.congesId!);
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Impossible de modifier l\'état : ' + (err.error?.message || err.message));
      }
    });
  }

  getStatusClass(): string {
    const etat = this.detailsConges.etat;
    if (['Envoyée'].includes(etat!)) return 'status-sent';
    return '';
  }

  openConfirmationDialog(action: 'envoyer'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      envoyer: 'Confirmer l\'envoi',
    };

    const messages: { [key: string]: string } = {
      envoyer: 'Êtes-vous sûr de vouloir envoyer cette demande ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.congesId!);
        }
      })
      .catch(() => { });
  }


  goBack() {
    window.history.back();
  }


}

