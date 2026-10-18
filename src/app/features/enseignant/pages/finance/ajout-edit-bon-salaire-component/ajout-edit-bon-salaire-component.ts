import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeAvanceSalaireResponse } from '../../../../../core/models/rh/demande-avance-salaire-response.model';
import { DemandeBonSalaireRequest } from '../../../../../core/models/rh/demande-bon-salaire-request.model';
import { RhResourceService } from '../../../../rh/services/rh-resource-service';

@Component({
  selector: 'app-ajout-edit-bon-salaire-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-edit-bon-salaire-component.html',
  styleUrl: './ajout-edit-bon-salaire-component.css',
})
export class AjoutEditBonSalaireComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly demandeService = inject(RhResourceService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isSending = signal(false);

  readonly demande = signal<DemandeAvanceSalaireResponse | null>(null);

  uuid: string | null = null;

  readonly form = this.fb.nonNullable.group({
    montant: ['', Validators.required],
    motif: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  get isEditMode(): boolean {
    return !!this.uuid;
  }

  get isBrouillon(): boolean {
    return this.demande()?.etatCode === 'BROUILLON';
  }

  ngOnInit(): void {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    if (this.uuid) {
      this.chargerDemande(this.uuid);
    }
  }

  onMontantInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const formatted = digits
      ? Number(digits).toLocaleString('fr-FR')
      : '';

    input.value = formatted;

    this.form.controls.montant.setValue(
      formatted,
      { emitEvent: false }
    );
  }

  chargerDemande(uuid: string): void {
    this.isLoading.set(true);

    this.demandeService.getDemandeBonSalaire(uuid).subscribe({
      next: (demande) => {

        this.demande.set(demande);

        this.form.patchValue({
          montant: this.formatMontant(demande.montant),
          motif: demande.motif ?? ''
        });

        if (demande.etatCode !== 'BROUILLON') {
          this.form.disable();
        }

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error(
          'Erreur lors du chargement de la demande',
          error
        );

        this.isLoading.set(false);
      }
    });
  }

  private formatMontant(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return Number(value).toLocaleString('fr-FR');
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const montant = this.parseMontant(raw.montant);

    if (montant <= 0) {
      this.form.controls.montant.setErrors({ min: true });
      this.form.controls.montant.markAsTouched();
      return;
    }

    const request: DemandeBonSalaireRequest = {
      montant,
      motif: raw.motif
    };

    this.isSaving.set(true);

    const operation = this.uuid
      ? this.demandeService.modifierMaDemande(this.uuid, request)
      : this.demandeService.creerMaDemande(request);

    operation.subscribe({
      next: (demande) => {
        this.demande.set(demande);
        this.uuid = demande.uuid;

        this.isSaving.set(false);

        if (!this.route.snapshot.paramMap.get('uuid')) {
          void this.router.navigate(
            [
              '/enseignant/bon-salaire/edit',
              demande.uuid
            ],
            { replaceUrl: true }
          );
        }


      },

      error: (error) => {
        console.error(
          'Erreur lors de l’enregistrement',
          error
        );

        this.isSaving.set(false);
      }
    });
  }

  private parseMontant(value: string): number {
    return Number(value.replace(/\s/g, '').replace(/\u00A0/g, ''));
  }

  envoyer(): void {

    if (!this.uuid) {
      return;
    }

    if (!this.isBrouillon) {
      return;
    }

    const confirmation = window.confirm(
      'Voulez-vous envoyer cette demande pour traitement par l’administration ?'
    );

    if (!confirmation) {
      return;
    }

    this.isSending.set(true);

    this.demandeService.envoyerMaDemande(this.uuid).subscribe({

      next: (demande) => {

        this.demande.set(demande);

        this.isSending.set(false);

        this.form.disable();
      },

      error: (error) => {

        console.error(
          'Erreur lors de l’envoi de la demande',
          error
        );

        this.isSending.set(false);
      }
    });
  }

  retour(): void {
    void this.router.navigate(['/enseignant/bon-salaires']);
  }
}
