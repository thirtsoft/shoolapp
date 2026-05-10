import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsEcoleAdmin } from '../../../../../../core/models/admin/ecole/details-ecole-admin';

@Component({
  selector: 'app-details-ecole',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-ecole.component.html',
  styleUrls: ['./details-ecole.component.css']
})
export class DetailsEcoleComponent implements OnInit {

  errorMessage?: string;
  userId?: number;
  isEdit: boolean = false;
  detailsEcoleAdmin: DetailsEcoleAdmin = {};
  isEditMode = false;
  logoPreview: string | null = null;
  title = "Détails école";

  disableAddButton = false;

  //  private readonly planification = inject(PlanificationResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly modalService = inject(NgbModal);


  ngOnInit(): void {
    this.userId = this.activeRoute.snapshot.params['id'];
    if (this.userId != null && this.userId != undefined) {
      //  this.getDetailsEcoleAdmin(this.userId);
    }
  }

  /*
  getDetailsEcoleAdmin(devoirId: number) {
    this.planification.getDetailsResource('ecole', devoirId).subscribe({
      next: (data) => {
        this.detailsEcoleAdmin = data;
        this.logoPreview = this.detailsEcoleAdmin.logoBase64
        console.log('Details devoir', this.detailsEcoleAdmin);
      },
      error: (data:any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }*/

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
          //       this.changerEtat(action, this.userId!);
        }
      })
      .catch(() => { });
  }

  /*
  changerEtat(action: 'valider', evalId: number) {
    this.planification.changerEtatResource('evaluation', evalId).subscribe({
      next: (data) => {
        console.log('response', data);

        const successMessages: { [key: string]: string } = {
          valider: `Evaluation ${this.detailsEcoleAdmin?.nom} validée avec succès.`,
        };
        this.toastService.success('succès', successMessages[action]);
        this.getDetailsEcoleAdmin(this.userId);
      },
      error: (data:any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }*/

  imprimerUneEvaluation(event: any) { }

  goBack() {
    window.history.back();
  }


}
