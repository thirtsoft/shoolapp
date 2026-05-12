import { CommonModule, SlicePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogModalComponent } from '../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsExercice } from '../../../../../core/models/planification/details-exercice';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-details-exercice',
  standalone: true,
  imports: [CommonModule, SlicePipe],
  templateUrl: './details-exercice.component.html',
  styleUrls: ['./details-exercice.component.css']
})
export class DetailsExerciceComponent implements OnInit {

  errorMessage?: string;
  evaluationId: number;
  isEdit: boolean = false;
  detailsEexercice: any = {};
  isEditMode = false;
  title: string = ''

  disableAddButton = false;

  libelleEvaluation: string = '';

  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService)
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly modalService = inject(NgbModal);

  constructor(
  ) {
    this.evaluationId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getDetailsEexercice(this.evaluationId);
    }
  }

  getDetailsEexercice(evalId: number) {
    this.planification.getDetailsResource('planification/exercice', evalId).subscribe({
      next: (data: any) => {
        this.detailsEexercice = data;
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
          /*     soumettre: `Evaluation ${this.detailsEvaluation?.titre} envoyée avec succès.`,
              valider: `Evaluation ${this.detailsEvaluation?.titre} validée avec succès.`, */
        };
        this.toastService.success('succès', successMessages[action]);
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  getFileIcon(filename: string): string {
    if (!filename) return '../../assets/img/defaultFile.png';

    const extension = filename.split('.').pop()?.toLowerCase() || '';

    switch (extension) {
      case 'pdf':
        return '../../assets/img/filePdf.png';
      case 'doc':
      case 'docx':
        return '../../assets/img/fileWord.png';
      case 'xls':
      case 'xlsx':
        return '../../assets/img/fileExcel.png';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return '../../assets/img/fileImage.png';
      case 'txt':
        return '../../assets/img/fileText.png';
      case 'zip':
      case 'rar':
      case '7z':
        return '../../assets/img/fileArchive.png';
      default:
        return '../../assets/img/defaultFile.png';
    }
  }

  goBack() {
    window.history.back();
  }


}
