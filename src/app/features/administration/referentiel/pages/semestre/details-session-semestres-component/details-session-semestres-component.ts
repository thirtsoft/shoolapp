import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsSessionSemestre } from '../../../../../../core/models/referentiels/details-tsession-semestre';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';

@Component({
  selector: 'app-details-session-semestres-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, TitleCasePipe],
  templateUrl: './details-session-semestres-component.html',
  styleUrl: './details-session-semestres-component.css',
})
export class DetailsSessionSemestresComponent implements OnInit {

  errorMessage?: string;
  sessionSemestreId?: number;
  isEdit: boolean = false;
  detailsSessionSemestre: DetailsSessionSemestre = {};
  isEditMode = false;
  etatLibelle = EtatLibelle;
  title = "Détails session semestre";

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  targetEtatCode: string = '';
  isMotifRequired: boolean = false;

  disableAddButton = false;

  private readonly modalService = inject(NgbModal);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.sessionSemestreId = this.activeRoute.snapshot.params['id'];
    if (this.sessionSemestreId != null && this.sessionSemestreId != undefined) {
      this.getDetailsSessionSemestre(this.sessionSemestreId);
    }
  }

  initActionForm() {
    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });
  }

  getDetailsSessionSemestre(sessionsemestreId: number) {
    this.referentielResourceService.recupererDetailsUneResource('sessionsemestre', sessionsemestreId).subscribe({
      next: (data: any) => {
        this.detailsSessionSemestre = data;
        console.log('Detail session', this.detailsSessionSemestre);
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information session semestre : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  openEtatModal(content: any, action: 'demarrer' | 'clôturer' | 'reactiver', etatCode: string): void {
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
          this.changerEtat(action, Number(this.sessionSemestreId), payload);
        }
      },
      () => { }
    );
  }

  changerEtat(action: string, evalId: number, payload: any) {
    this.referentielResourceService.modifierEtatResource('anneescolaire', evalId, payload).subscribe({
      next: (data: any) => {
        const successMessages: { [key: string]: string } = {
          demarrer: `L\'année scolaire a été démarrée avec succès.`,
          clôturer: `L\'année scolaire a été clôturée avec succès.`,
          reactiver: `L\'année scolaire a été réactivée avec succès.`,
        };
        this.toastService.success('Succès', successMessages[action] || 'Action effectuée.');
        this.getDetailsSessionSemestre(Number(this.sessionSemestreId));
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Impossible de modifier l\'état : ' + (err.error?.message || err.message));
      }
    });
  }

  getStatusClass(): string {
    const etat = this.detailsSessionSemestre.libelleEtat;
    if (['Réactivation'].includes(etat!)) return 'status-validated';
    if (['En cours'].includes(etat!)) return 'status-sent';
    if (['Clôturé'].includes(etat!)) return 'status-remise';
    return '';
  }

  openConfirmationDialog(action: 'demarrer' | 'clôturer' | 'reactiver'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider cette réunion ?',
    };

    const payload = null;

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, Number(this.sessionSemestreId), payload);
        }
      })
      .catch(() => { });
  }

  goBack() {
    window.history.back();
  }
}
