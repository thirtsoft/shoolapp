import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsConges } from '../../../../../../core/models/planification/details-conge';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-details-conges-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, TitleCasePipe],
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
  targetEtatCode: string = '';
  isMotifRequired: boolean = false;

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.congesId = this.activeRoute.snapshot.params['id'];
    if (this.congesId != null && this.congesId != undefined) {
      this.getDetailsConges(this.congesId);
    }
  }

  initActionForm() {
    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });
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


  openEtatModal(content: any, action: 'envoyer' | 'accepter' | 'rejeter', etatCode: string): void {
    this.modalActionLabel = action;
    this.targetEtatCode = etatCode;

    this.isMotifRequired = ['rejeter'].includes(action);

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
          this.changerEtat(action, this.congesId!, payload);
        }
      },
      () => { }
    );
  }

  changerEtat(action: string, evalId: number, payload: any) {
    this.planification.changeEtatResource('conges', evalId, payload).subscribe({
      next: (data: any) => {
        const successMessages: { [key: string]: string } = {
          envoyer: `Le congé a été envoyé avec succès.`,
          accepter: `Le congé a été accpeté.`,
          rejeter: `Le congé a été rejeté.`,
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
    if (['Accepte'].includes(etat!)) return 'status-validated';
    if (['Rejete'].includes(etat!)) return 'status-remise';
    return '';
  }

  openConfirmationDialog(action: 'envoyer' | 'accepter' | 'rejeter'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider ce congé ?',
    };
    const payload = null;

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.congesId!, payload);
        }
      })
      .catch(() => { });
  }


  goBack() {
    window.history.back();
  }


}


