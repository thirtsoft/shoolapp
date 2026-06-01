import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsEvaluation } from '../../../../../core/models/dossiereleve/evaluation/details-evaluation';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
@Component({
  selector: 'app-detail-evaluation-enseignant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detail-evaluation-enseignant.component.html',
  styleUrls: ['./detail-evaluation-enseignant.component.css']
})
export class DetailEvaluationEnseignantComponent implements OnInit {

  errorMessage?: string;
  evaluationId: number;
  isEdit: boolean = false;
  detailsEvaluation: DetailsEvaluation = {};
  isEditMode = false;
  title: string = ''

  disableAddButton = false;
  libelleEvaluation: string = '';

  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService)
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly modalService = inject(NgbModal);

  constructor(
  ) {
    this.evaluationId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getDetailsEvaluation(this.evaluationId);
    }
  }

  getDetailsEvaluation(evalId: number) {
    this.planification.getDetailsResource('evaluation', evalId).subscribe({
      next: (data: any) => {
        this.detailsEvaluation = data;
        this.title = this.detailsEvaluation?.evaluationType!;
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  openConfirmationDialog(action: 'envoyer' | 'valider'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      envoyer: 'Confirmer l\'envoie',
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      envoyer: 'Êtes-vous sûr de vouloir envoyer cette évaluation ?',
      valider: 'Êtes-vous sûr de vouloir valider cette évaluation ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.evaluationId);
        }
      })
      .catch(() => { });
  }

  changerEtat(action: 'envoyer' | 'valider', evalId: number) {
    this.planification.changerEtatResource('evaluation', evalId).subscribe({
      next: (data) => {
        console.log('response', data);

        const successMessages: { [key: string]: string } = {
          envoyer: `Evaluation ${this.detailsEvaluation?.titre} envoyée avec succès.`,
          valider: `Evaluation ${this.detailsEvaluation?.titre} validée avec succès.`,
        };
        this.toastService.success('succès', successMessages[action]);
        this.getDetailsEvaluation(this.evaluationId);
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }


  goBack() {
    window.history.back();
  }


}
