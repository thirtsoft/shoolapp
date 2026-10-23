import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { CongesAddEdit } from '../../../../../core/models/planification/conge-add-edit';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { RhResourceService } from '../../../../rh/services/rh-resource-service';
import { CongesRequest } from '../../../../../core/models/rh/conges-request.model';

@Component({
  selector: 'app-demander-un-conge-component',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule],
  templateUrl: './demander-un-conge-component.html',
  styleUrl: './demander-un-conge-component.css',
})
export class DemanderUnCongeComponent implements OnInit, OnDestroy {

  errorMessage?: string;

  congeId?: number;

  conge: any;

  congeFormGroup!: FormGroup;

  editor!: Editor;

  isEdit = false;

  personnelUuid?: string;

  title = 'Enregistrer une demande de congé';

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  private readonly rhResouce = inject(RhResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.congeId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm(null);

    if (this.congeId != null && this.congeId !== undefined) {

      this.getCongeById(this.congeId);

      this.title = 'Modifier une demande de congé';

      this.isEdit = true;
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  getCongeById(congeId: number): void {
    this.rhResouce.getCongesById(congeId).subscribe({

      next: (data) => {

        this.conge = data;

        this.congeFormGroup.patchValue({
          id: this.conge?.id ?? '',
          objet: this.conge?.objet ?? '',
          motif: this.conge?.motif ?? '',
          description: this.conge?.description ?? '',
          dateDebut: this.conge?.dateDebut ?? '',
          dateFin: this.conge?.dateFin ?? ''
        });
        if (this.conge?.personnelUuid) {
          this.personnelUuid = this.conge.personnelUuid;
        }
      },

      error: (error) => {
        console.error('Erreur lors du chargement du congé', error);

        this.toastService.error(
          'Erreur',
          'Impossible de récupérer la demande de congé.'
        );

        this.goBack();
      }
    });
  }

  initializeForm(conges: CongesRequest | null): void {
    this.congeFormGroup = this._formBuilder.group({
      objet: [conges?.objet ?? '', Validators.required],
      motif: [conges?.motif ?? '', Validators.required],
      description: [conges?.description ?? '', Validators.required],
      dateDebut: [conges?.dateDebut ?? '', Validators.required],
      dateFin: [conges?.dateFin ?? '', Validators.required]
    });
  }

  ajouterEditUneDemandeConge(): void {

    if (this.congeFormGroup.invalid) {
      this.congeFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.congeFormGroup.getRawValue();

    const payload: CongesRequest = {
      objet: formValue.objet,
      motif: formValue.motif,
      description: formValue.description,
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin
    };

    if (!this.isEdit) {

      this.creerDemande(payload);

    } else {

      this.modifierDemande(payload);
    }
  }

  private creerDemande(payload: CongesRequest): void {

    this.rhResouce.createConges(payload).subscribe({
      next: (data) => {

        if (data.id != null) {
          this.toastService.success('Succès', 'La demande de congés a été enregistrée avec succès.');

          this.goBack();

        } else {

          this.toastService.error(
            'Erreur',
            'Erreur lors de la création : ' +
            'Error lors de l\'ajout de demande de congés'
          );
        }
      },

      error: (error) => {

        console.error(
          'Erreur création congé',
          error
        );

        this.toastService.error(
          'Erreur',
          error?.error?.message || 'Erreur lors de la création de la demande.'
        );
      }
    });
  }

  private modifierDemande(payload: CongesRequest): void {

    this.rhResouce.updateConges(Number(this.congeId), payload).subscribe({
      next: (data) => {

        if (data.personnelUuid != null) {

          this.toastService.success('Succès', 'La demande de congés a été modifiée avec succès.');

          this.goBack();

        } else {

          this.toastService.error(
            'Erreur',
            'Erreur lors de la modification : ' +
            'error modification'
          );
        }
      },

      error: (error) => {

        console.error('Erreur modification congé', error);

        this.toastService.error(
          'Erreur',
          error?.error?.message || 'Erreur lors de la modification de la demande.'
        );
      }
    });
  }

  goBack(): void {
    void this.router.navigate(['enseignant/mes-conges']);
  }
}