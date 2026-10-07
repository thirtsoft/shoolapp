import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TypeContratRequest } from '../../../../../../core/models/rh/type-contrat-request.model';
import { RhResourceService } from '../../../../../rh/services/rh-resource-service';


@Component({
  selector: 'app-add-edit-type-contrat-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-edit-type-contrat-component.html',
  styleUrl: './add-edit-type-contrat-component.css',
})
export class AddEditTypeContratComponent {

  errorMessage?: string;
  typeContratId: string;
  typeContratFormGroup!: FormGroup;
  typeContrat: any;
  isEdit: boolean = false;

  title = "Ajouter un type de contrat";

  private readonly rhService = inject(RhResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.typeContratId = this.activeRoute.snapshot.params['uuid'];
  }

  ngOnInit(): void {
    this.initializeForm(null);

    if (this.typeContratId != null && this.typeContratId != undefined) {
      this.getTypeContrat(this.typeContratId);
      this.title = 'Modifier type de contrat';
      this.isEdit = true;
    }

  }

  getTypeContrat(typeContratUuid: string) {
    this.rhService.recupererUneResource('types-contrat', typeContratUuid).subscribe({
      next: (data) => {
        this.typeContrat = data;
        this.initializeForm(this.typeContrat);
      }
    });
  }

  initializeForm(typeContrat: TypeContratRequest | null) {
    this.typeContratFormGroup = this._formBuilder.group({
      code: [typeContrat?.code ?? '', Validators.required],
      libelle: [typeContrat?.libelle ? typeContrat.libelle : '', Validators.required],
    });
  }


  ajoutEditTypeContrat() {
    const payload = this.typeContratFormGroup.value;
    if (!this.isEdit) {
      this.rhService.creerUneRessource('types-contrat', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le types-contrat a été enregistrées avec succès !!! ');
            this.goBack();
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.rhService.modifierUneRessource('types-contrat', this.typeContratId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le types-contrat a été modifiées avec succès !!! ');
            this.goBack();
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
        }
      });

    }
  }

  goBack() {
    this.router.navigate(['admin/referentiel/type-contrats'])
  }


}