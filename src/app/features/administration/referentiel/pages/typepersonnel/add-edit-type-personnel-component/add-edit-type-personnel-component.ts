import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TypePersonnelRequest } from '../../../../../../core/models/rh/type-personnel-request.model';
import { RhResourceService } from '../../../../../rh/services/rh-resource-service';



@Component({
  selector: 'app-add-edit-type-personnel-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-edit-type-personnel-component.html',
  styleUrl: './add-edit-type-personnel-component.css',
})
export class AddEditTypePersonnelComponent {

  errorMessage?: string;
  typePersonnelId: string;
  typePersonnelFormGroup!: FormGroup;
  typePersonnel: any;
  isEdit: boolean = false;

  title = "Ajouter un type de contrat";

  private readonly rhService = inject(RhResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.typePersonnelId = this.activeRoute.snapshot.params['uuid'];
  }

  ngOnInit(): void {
    this.initializeForm(null);

    if (this.typePersonnelId != null && this.typePersonnelId != undefined) {
      this.getTypePersonnel(this.typePersonnelId);
      this.title = 'Modifier type de personnel';
      this.isEdit = true;
    }

  }

  getTypePersonnel(typePersonnelUuid: string) {
    this.rhService.recupererUneResource('types-personnel', typePersonnelUuid).subscribe({
      next: (data) => {
        this.typePersonnel = data;
        this.initializeForm(this.typePersonnel);
      }
    });
  }

  initializeForm(typeContrat: TypePersonnelRequest | null) {
    this.typePersonnelFormGroup = this._formBuilder.group({
      libelle: [typeContrat?.libelle ? typeContrat.libelle : '', Validators.required],
    });
  }


  ajoutEditTypeContrat() {
    const payload = this.typePersonnelFormGroup.value;
    if (!this.isEdit) {
      this.rhService.creerUneRessource('types-personnel', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le types personnel a été enregistrées avec succès !!! ');
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
      this.rhService.modifierUneRessource('types-personnel', this.typePersonnelId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le types personnel a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/type-personnels'])
  }



}
