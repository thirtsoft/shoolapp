import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { Evenement } from '../../../../../../core/models/planification/evenement';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-detail-evenement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detail-evenement.component.html',
  styleUrls: ['./detail-evenement.component.css']
})
export class DetailEvenementComponent implements OnInit {

  errorMessage?: string;
  evenementId: number;
  isEdit: boolean = false;
  detailsEvenement?: Evenement;
  isEditMode = false;
  title = "Détails événement";

  disableAddButton = false;

  private readonly planification = inject(PlanificationResourceService);
  private readonly modalService = inject(NgbModal);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.evenementId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.evenementId != null && this.evenementId != undefined) {
      this.getDetailsEvenement(this.evenementId);
    }
  }

  getDetailsEvenement(evenementId: number) {
    this.planification.getEvenementById(evenementId).subscribe({
      next: (data) => {
        this.detailsEvenement = data;
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  openConfirmationDialog(action: 'publier' | 'depublier'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      publier: 'Confirmer la publication',
      depublier: 'Confirmer la dépublication',
    };

    const messages: { [key: string]: string } = {
      publier: 'Êtes-vous sûr de vouloir valider cette évaluation ?',
      depublier: 'Êtes-vous sûr de vouloir valider cette évaluation ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.evenementId);
        }
      })
      .catch(() => { });
  }

  changerEtat(action: 'publier' | 'depublier', evalId: number) {
    this.planification.changerEtatResource('evenement', evalId).subscribe({
      next: (data) => {
        console.log('response', data);

        const successMessages: { [key: string]: string } = {
          publier: `Evenement ${this.detailsEvenement?.libelle} validée avec succès.`,
          depublier: `Evenement ${this.detailsEvenement?.libelle} validée avec succès.`,
        };
        this.toastService.success('succès', successMessages[action]);
        this.getDetailsEvenement(this.evenementId);
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  imprimerUneEvaluation(event: any) {

  }

  goBack() {
    window.history.back();
  }


}
