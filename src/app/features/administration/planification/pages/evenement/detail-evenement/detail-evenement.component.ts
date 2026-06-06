import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  evenementId?: number;
  isEdit: boolean = false;
  detailsEvenement?: Evenement;
  isEditMode = false;
  title = "Détails événement";
  disableAddButton = false;

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  targetEtatCode: string = '';
  isMotifRequired: boolean = false;

  private readonly planification = inject(PlanificationResourceService);
  private readonly modalService = inject(NgbModal);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  constructor(
  ) {
    this.evenementId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.evenementId != null && this.evenementId != undefined) {
      this.getDetailsEvenement(this.evenementId);
    }
  }

  initActionForm() {
    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });
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


  openEtatModal(content: any, action: 'publier' | 'dépublier' | 'annuler' | 'terminer' | 'reprogrammer', etatCode: string): void {
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
          this.changerEtat(action, this.evenementId!, payload);
        }
      },
      () => { }
    );
  }

  changerEtat(action: string, evalId: number, payload: any) {
    this.planification.changeEtatResource('planification/evenement', evalId, payload).subscribe({
      next: (data: any) => {
        const successMessages: { [key: string]: string } = {
          publier: `La réunion a été publiée avec succès.`,
          dépublier: `La réunion a été dépubliée.`,
          annuler: `La réunion a été annulée.`,
          terminer: `La réunion est désormais marquée comme terminée.`,
          reprogrammer: `La réunion a été remise en planification.`
        };
        this.toastService.success('Succès', successMessages[action] || 'Action effectuée.');
        this.getDetailsEvenement(this.evenementId!);
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Impossible de modifier l\'état : ' + (err.error?.message || err.message));
      }
    });
  }

  getStatusClass(): string {
    const etat = this.detailsEvenement?.etat;
    if (['Publié', 'Validée'].includes(etat!)) return 'status-validated';
    if (['Programmé', 'Envoyée'].includes(etat!)) return 'status-sent';
    if (['Annulé', 'Dépublié'].includes(etat!)) return 'status-remise';
    return '';
  }

  imprimerUneEvaluation(event: any) {

  }

  goBack() {
    window.history.back();
  }


}
