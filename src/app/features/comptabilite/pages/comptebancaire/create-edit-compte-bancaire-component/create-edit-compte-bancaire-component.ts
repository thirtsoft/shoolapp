import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Banque } from '../../../../../core/models/referentiels/banque';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { CompteBancaireProjection } from '../../../../../core/models/comptabilite/tresorerie/compte-bancaire-projection-model';


@Component({
  selector: 'app-create-edit-compte-bancaire-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-edit-compte-bancaire-component.html',
  styleUrl: './create-edit-compte-bancaire-component.css',
})
export class CreateEditCompteBancaireComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef)
  private readonly comptabResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly banques = signal<Banque[]>([]);

  readonly compteId = signal<number | null>(null);

  get isEditMode(): boolean {
    return this.compteId() !== null;
  }

  readonly form = this.fb.nonNullable.group({
    banqueUuId: ['', Validators.required],
    libelle: ['', [Validators.required, Validators.maxLength(100)]],
    numeroCompte: ['', [Validators.required, Validators.maxLength(100)]],
    soldeInitial: [0, [Validators.required, Validators.min(0)]],
    dateSoldeInitial: ['', Validators.required]
  });

  ngOnInit(): void {
    this.chargerBanques();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const compteId = Number(id);
      if (!Number.isNaN(compteId)) {
        this.compteId.set(compteId);
        this.chargerCompte(compteId);
      }
    }
  }

  chargerBanques(): void {
    this.loading.set(true);
    this.referentielResource.getResourceList('banque')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.banques.set(response as Banque[]);
          this.loading.set(false);
        },
        error: error => {
          console.error(error);
          this.errorMessage.set('Impossible de charger la liste des banques.');
          this.loading.set(false);
        }
      });
  }

  chargerCompte(id: number): void {
    this.loading.set(true);
    this.comptabResource.recupererUneResource('comptes-bancaires', id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const compte = response as CompteBancaireProjection;
          this.form.patchValue({
            banqueUuId: compte.banqueUuId,
            libelle: compte.libelle,
            numeroCompte: compte.numeroCompte,
            soldeInitial: compte.soldeInitial,
            dateSoldeInitial: compte.dateSoldeInitial
          });

          this.loading.set(false);
        },
        error: error => {
          console.error(error);
          this.errorMessage.set(
            error?.error?.message ?? 'Impossible de charger le compte bancaire.'
          );
          this.loading.set(false);
        }
      });
  }

  enregistrer(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const request = {
      banqueUuId: this.form.controls.banqueUuId.value,
      libelle: this.form.controls.libelle.value.trim(),
      numeroCompte: this.form.controls.numeroCompte.value.trim(),
      soldeInitial: this.form.controls.soldeInitial.value,
      dateSoldeInitial: this.form.controls.dateSoldeInitial.value
    };

    const id = this.compteId();

    const request$ = id === null
      ? this.comptabResource.creerUneRessource('comptes-bancaires', request)
      : this.comptabResource.modifierUneRessource(`comptes-bancaires`, id, request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.saving.set(false);
          this.successMessage.set(
            id === null
              ? 'Compte bancaire créé avec succès.'
              : 'Compte bancaire modifié avec succès.'
          );

          setTimeout(() => {
            this.retourListe();
          }, 700);
        },
        error: error => {
          console.error(error);

          this.saving.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'Une erreur est survenue lors de l’enregistrement du compte bancaire.'
          );
        }
      });
  }

  retourListe(): void {
    void this.router.navigate(['/admin/comptabilite/compte-bancaires']);
  }

  annuler(): void {
    this.retourListe();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
