import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-create-annee-scolaire',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './create-annee-scolaire.component.html',
  styleUrls: ['./create-annee-scolaire.component.css']
})
export class CreateAnneeScolaireComponent implements OnInit {

  errorMessage?: string;

  anneeScolaireId: number;
  anneeScolairesFormGroup!: FormGroup;
  anneeScolaire: AnneeScolaire | null = null;

  isEdit = false;
  creationAutorisee = true;
  verificationEnCours = false;

  anneeScolaireEnCours: any = null;
  messageCreation?: string;

  title = 'Ajouter une année scolaire';

  private readonly referentielService = inject(ReferentielService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.anneeScolaireId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.initializeForm(null);

    if (this.anneeScolaireId !== null && this.anneeScolaireId !== undefined) {
      this.isEdit = true;
      this.title = 'Modifier une année scolaire';

      this.getAnneeScolaireById(this.anneeScolaireId);

    } else {
      this.verifierCreationAnneeScolaire();
    }
  }

  verifierCreationAnneeScolaire(): void {
    this.verificationEnCours = true;
    this.referentielService.verificationCreationAnneeScolaire().subscribe({
      next: (response) => {
        this.verificationEnCours = false;
        const data = response.data ?? response;
        this.creationAutorisee = data.creationAutorisee;
        if (!this.creationAutorisee) {
          this.anneeScolaireEnCours = data;
          this.messageCreation = data.message;
        }
      },

      error: (error) => {
        this.verificationEnCours = false;
        console.error(
          'Erreur lors de la vérification de création de l’année scolaire',
          error
        );
        this.toastService.error(
          'Impossible de vérifier si une nouvelle année scolaire peut être créée.',
          'Erreur'
        );
      }
    });
  }

  getAnneeScolaireById(anneeScolaireId: number): void {

    this.referentielService.getAnneeScolaireById(anneeScolaireId)
      .subscribe({
        next: (data) => {
          this.anneeScolaire = data;
          this.initializeForm(this.anneeScolaire);
        },

        error: (error) => {
          console.error(
            'Erreur lors du chargement de l’année scolaire',
            error
          );
          this.toastService.error(
            'Impossible de charger l’année scolaire.',
            'Erreur'
          );
        }
      });
  }

  initializeForm(anneeScolaire: AnneeScolaire | null): void {
    this.anneeScolairesFormGroup = this._formBuilder.group({
      id: [anneeScolaire?.id ?? ''],
      libelle: [anneeScolaire?.libelle ?? '', Validators.required],
      dateDebut: [anneeScolaire?.dateDebut ?? '', Validators.required],
      dateFin: [anneeScolaire?.dateFin ?? '']
    });
  }

  ajouteditAnneeScolaire(): void {
    if (this.anneeScolairesFormGroup.invalid) {
      this.anneeScolairesFormGroup.markAllAsTouched();
      return;
    }
    if (!this.isEdit && !this.creationAutorisee) {

      this.toastService.warning(this.messageCreation ??
        'Une année scolaire est déjà en cours.',
        'Création impossible');

      return;
    }

    const payload = this.anneeScolairesFormGroup.value;

    if (!this.isEdit) {

      this.referentielService.initierNouvelleAnneeScolaire(payload).subscribe({

        next: (data) => {

          if (data.statut === 'OK') {
            this.toastService.success(
              'Les informations de l’année scolaire ont été enregistrées avec succès.',
              'Succès'
            );
            this.goBack();

          } else if (data.statut === 'FAILED') {
            this.toastService.error(
              data.message,
              'Erreur lors de la création'
            );
          }
        },

        error: (error) => {
          console.error(
            'Erreur lors de la création de l’année scolaire',
            error
          );

          this.toastService.error(
            error?.error?.message ??
            'Une erreur est survenue lors de la création de l’année scolaire.',
            'Erreur'
          );
        }
      });

    } else {

      this.referentielService.updateAnneeScolaire(this.anneeScolaireId, payload)
        .subscribe({

          next: (data) => {

            if (data.statut === 'OK') {

              this.toastService.success(
                'Les informations de l’année scolaire ont été modifiées avec succès.',
                'Succès'
              );

              this.goBack();

            } else if (data.statut === 'FAILED') {

              this.toastService.error(
                data.message,
                'Erreur lors de la modification'
              );
            }
          },

          error: (error) => {

            console.error(
              'Erreur lors de la modification de l’année scolaire',
              error
            );

            this.toastService.error(
              error?.error?.message ??
              'Une erreur est survenue lors de la modification de l’année scolaire.',
              'Erreur'
            );
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['admin/referentiel/annee-scolaires']);
  }

}