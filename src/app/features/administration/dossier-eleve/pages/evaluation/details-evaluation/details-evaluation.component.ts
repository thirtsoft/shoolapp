import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsEvaluation } from '../../../../../../core/models/dossiereleve/evaluation/details-evaluation';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';

@Component({
  selector: 'app-details-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './details-evaluation.component.html',
  styleUrls: ['./details-evaluation.component.css']
})
export class DetailsEvaluationComponent implements OnInit {

  errorMessage?: string;
  evaluationId?: number;
  isEdit: boolean = false;
  detailsEvaluation: DetailsEvaluation = {};
  isEditMode = false;
  title = "Détails évaluation";

  disableAddButton = false;

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.evaluationId = this.activeRoute.snapshot.params['id'];
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getDetailsEvaluation(this.evaluationId);
    }
  }

  getDetailsEvaluation(devoirId: number) {
    this.planification.getDetailsResource('evaluation', devoirId).subscribe({
      next: (data: any) => {
        this.detailsEvaluation = data;
        console.log('Details devoir', this.detailsEvaluation);
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  openConfirmationDialog(action: 'valider'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider cette évaluation ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.evaluationId!);
        }
      })
      .catch(() => { });
  }

  changerEtat(action: 'valider', evalId: number) {
    this.planification.changerEtatResource('evaluation', evalId).subscribe({
      next: (data: any) => {
        console.log('response', data);

        const successMessages: { [key: string]: string } = {
          valider: `Evaluation ${this.detailsEvaluation?.titre} validée avec succès.`,
        };
        this.toastService.success('succès', successMessages[action]);
        this.getDetailsEvaluation(this.evaluationId!);
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  getStatusClass(): string {
    const etat = this.detailsEvaluation.etat;
    if (etat === 'Validée') return 'status-validated';
    if (etat === 'Envoyée') return 'status-sent';
    if (etat === 'Remise') return 'status-remise';
    return '';
  }

  imprimerUneEvaluation(event: any) { }

  goBack() {
    window.history.back();
  }


}
