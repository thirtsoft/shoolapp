import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Salle } from '../../../../../../core/models/referentiels/salle';
import { TypeReunion } from '../../../../../../core/models/referentiels/type-reunion';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ajout-edit-activite-scolaire.component',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './ajout-edit-activite-scolaire.component.html',
  styleUrl: './ajout-edit-activite-scolaire.component.css',
})
export class AjoutEditActiviteScolaireComponent implements OnInit {

  errorMessage?: string;

  activiteId: number = 0;

  activite: any;

  activiteFormGroup!: FormGroup;

  isEdit: boolean = false;

  salleList: Salle[] = [];

  typeReunionList: TypeReunion[] = [];

  ciblesReunion: string[] = ['ADMINISTRATION', 'ENSEIGNANTS', 'PARENTS', 'TOUS'];

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly destroyRef = inject(DestroyRef);


  ngOnInit(): void {
    const id = this.activeRoute.snapshot.params['id'];
    if (id) {
      this.activiteId = Number(id);
      this.isEdit = true;
    }
    this.chargerLesDonnees();
    this.initializeForm();
    if (this.isEdit) {
      this.getActivite(this.activiteId);
    }
  }


  get title(): string {
    if (!this.isEdit) {
      return 'Programmer une activité';
    }
    if (this.typeActivite === 'REUNION') {
      return 'Modifier une réunion';
    }
    return 'Modifier un événement';
  }

  get typeActivite(): string {
    return this.activiteFormGroup?.get('typeActivite')?.value ?? '';
  }

  get isReunion(): boolean {
    return this.typeActivite === 'REUNION';
  }

  get isEvenement(): boolean {
    return this.typeActivite === 'EVENEMENT';
  }

  private chargerLesDonnees(): void {
    this.referentielService
      .getResourceList('typereunion')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.typeReunionList = data ?? [];
        },
        error: () => {
          this.typeReunionList = [];
        }
      });

    this.referentielService
      .getResourceList('salle')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.salleList = data ?? [];
        },
        error: () => {
          this.salleList = [];
        }
      });
  }

  private initializeForm(): void {
    this.activiteFormGroup = this.formBuilder.group({
      id: [''],
      typeActivite: ['', Validators.required],
      libelle: ['', Validators.required],
      dateActivite: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      description: [''],
      typeReunionId: [''],
      salleId: [''],
      cible: ['']
    });


    this.activiteFormGroup
      .get('typeActivite')
      ?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type: string) => {

        this.updateValidators(type);

      });
  }

  private updateValidators(type: string): void {
    const typeReunionControl = this.activiteFormGroup.get('typeReunionId');
    const salleControl = this.activiteFormGroup.get('salleId');
    const cibleControl = this.activiteFormGroup.get('cible');

    if (type === 'REUNION') {
      typeReunionControl?.setValidators([Validators.required]);
      cibleControl?.setValidators([Validators.required]);

      salleControl?.clearValidators();

    } else {
      typeReunionControl?.clearValidators();
      cibleControl?.clearValidators();
      salleControl?.clearValidators();
      typeReunionControl?.setValue('', { emitEvent: false });
      salleControl?.setValue('', { emitEvent: false });
      cibleControl?.setValue('', { emitEvent: false });
    }

    typeReunionControl?.updateValueAndValidity({ emitEvent: false });
    salleControl?.updateValueAndValidity({ emitEvent: false });
    cibleControl?.updateValueAndValidity({ emitEvent: false });
  }


  private getActivite(id: number): void {
    this.planificationService.getDetailsResource('planification/activites-administration', id)
      .subscribe({
        next: (data: any) => {
          this.activite = data;
          this.chargerActiviteDansFormulaire(data);
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l’activité :', error);

          this.toastService.error(
            'Erreur', 'Impossible de charger l’activité.'
          );

          this.goBack();
        }
      });
  }

  private chargerActiviteDansFormulaire(data: any): void {
    const type = data?.type === 'REUNION' ? 'REUNION' : 'EVENEMENT';

    this.activiteFormGroup.patchValue({
      id: data?.id ?? '',
      typeActivite: type,
      libelle: data?.libelle ?? '',
      dateActivite: data?.dateActivite ?? '',
      heureDebut: this.formatTime(data?.heureDebut),
      heureFin: this.formatTime(data?.heureFin),
      description: data?.description ?? '',
      typeReunionId: data?.typeReunionId ?? '',
      salleId: data?.salleId ?? '',
      cible: data?.cible ?? ''
    });

    this.updateValidators(type);

    this.activiteFormGroup.get('typeActivite')?.disable();
  }

  private formatTime(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.substring(0, 5);
  }

  get selectedSalleNom(): string {
    const salleId = this.activiteFormGroup?.get('salleId')?.value;
    if (!salleId) {
      return '';
    }
    const salle = this.salleList.find(salle => salle.id === +salleId);
    return salle ? salle.libelle! : '';
  }

  get selectedTypeReunionLibelle(): string {
    const typeId = this.activiteFormGroup?.get('typeReunionId')?.value;
    if (!typeId) {
      return '';
    }
    const type = this.typeReunionList.find(item => item.id === +typeId);
    return type ? type.libelle! : '';
  }

  onTypeActiviteChange(): void {
    if (this.isReunion) {
      this.updateValidators('REUNION');

    } else if (this.isEvenement) {
      this.updateValidators('EVENEMENT');

    }
  }

  ajoutereditActivite(): void {
    if (!this.activiteFormGroup) {
      return;
    }

    if (this.activiteFormGroup.invalid) {
      this.activiteFormGroup.markAllAsTouched();
      return;
    }

    const type = this.typeActivite;

    if (type === 'EVENEMENT') {
      this.enregistrerEvenement();
      return;
    }

    if (type === 'REUNION') {
      this.enregistrerMeeting();
      return;
    }
  }

  private enregistrerEvenement(): void {
    const formValue = this.activiteFormGroup.getRawValue();

    const payload = {
      id: formValue.id,
      libelle: formValue.libelle,
      dateEvenement: formValue.dateActivite,
      heureDebut: formValue.heureDebut,
      heureFin: formValue.heureFin,
      description: formValue.description
    };

    if (!this.isEdit) {

      this.planificationService.createEvenement(payload)
        .subscribe({

          next: (data: any) => {

            if (data.statut === 'OK') {

              this.toastService.success(
                'Succès', 'L’événement a été enregistré avec succès.'
              );
              this.goBack();

            } else if (data.statut === 'FAILED') {

              this.toastService.error(
                'Erreur', 'Erreur lors de la création : ' +
              data.message
              );
            }
          },

          error: (data) => {

            console.error(
              'Erreur lors de la création :', data);

            this.toastService.error(
              'Erreur', 'Erreur lors de la création de l’événement.'
            );
          }
        });
      return;
    }

    this.planificationService.updateEvenement(this.activiteId, payload)
      .subscribe({

        next: (data: any) => {

          if (data.statut === 'OK') {

            this.toastService.success(
              'Succès', 'L’événement a été modifié avec succès.'
            );

            this.goBack();

          } else if (data.statut === 'FAILED') {

            this.toastService.error(
              'Erreur', 'Erreur lors de la modification : ' +
            data.message
            );
          }
        },

        error: (data) => {

          console.error('Erreur lors de la modification :', data);

          this.toastService.error(
            'Erreur', 'Erreur lors de la modification de l’événement.'
          );
        }
      });
  }

  private enregistrerMeeting(): void {
    const formValue = this.activiteFormGroup.getRawValue();

    const payload = {
      id: formValue.id,
      libelle: formValue.libelle,
      dateMeeting: formValue.dateActivite,
      heureDebut: formValue.heureDebut,
      heureFin: formValue.heureFin,
      typeReunionId: formValue.typeReunionId,
      salleId: formValue.salleId,
      cible: formValue.cible,
      description: formValue.description
    };

    if (!this.isEdit) {
      this.planificationService
        .createMeeting(payload)
        .subscribe({
          next: (data: any) => {

            if (data.statut === 'OK') {

              this.toastService.success(
                'Succès', 'La réunion a été enregistrée avec succès.'
              );

              this.goBack();

            } else if (data.statut === 'FAILED') {

              this.toastService.error(
                'Erreur', 'Erreur lors de la création : ' +
              data.message
              );
            }
          },

          error: (data) => {

            console.error(
              'Erreur lors de la création :',
              data
            );

            this.toastService.error(
              'Erreur',
              'Erreur lors de la création de la réunion.'
            );
          }
        });

      return;
    }

    this.planificationService.updateMeeting(this.activiteId, payload)
      .subscribe({

        next: (data: any) => {

          if (data.statut === 'OK') {

            this.toastService.success(
              'Succès', 'La réunion a été modifiée avec succès.'
            );

            this.goBack();

          } else if (data.statut === 'FAILED') {

            this.toastService.error(
              'Erreur', 'Erreur lors de la modification : ' +
            data.message
            );
          }
        },

        error: (data) => {

          console.error(
            'Erreur lors de la modification :',
            data
          );

          this.toastService.error(
            'Erreur', 'Erreur lors de la modification de la réunion.'
          );
        }
      });
  }

  goBack(): void {
    void this.router.navigate(['admin/planification/activites']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.activiteFormGroup.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
