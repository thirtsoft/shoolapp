import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TypeDepense } from '../../../../../../core/models/referentiels/type-depense';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-create-edit-type-depense-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-edit-type-depense-component.html',
  styleUrl: './create-edit-type-depense-component.css',
})
export class CreateEditTypeDepenseComponent implements OnInit {

  errorMessage?: string;
  typeDepenseId?: number;
  typeDepenseFormGroup!: FormGroup;
  typedepense: any;
  isEdit: boolean = false;
  ecoleId: any;

  title = "Ajouter une type dépense";

  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.typeDepenseId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.initializeForm(null);
    if (this.typeDepenseId != null && this.typeDepenseId != undefined) {
      this.getTypeDepense(this.typeDepenseId);
      this.title = 'Modifier un type de dépense';
      this.isEdit = true;
    }
  }

  getTypeDepense(typeDepenseId: number) {
    this.referentielResource.recupererUneResource('typedepense', typeDepenseId).subscribe({
      next: (data) => {
        this.typedepense = data;
        this.initializeForm(this.typedepense);
      }
    });
  }

  initializeForm(typeDepense: TypeDepense | null) {
    this.typeDepenseFormGroup = this._formBuilder.group({
      id: [typeDepense?.id ?? ''],
      libelle: [typeDepense?.libelle ?? '', Validators.required],
    });
  }


  ajoutEditTypeDepnse() {
    const payload = this.typeDepenseFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielResource.creerUneRessource('typedepense', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le type de dépense a été enregistrées avec succès !!! ');
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
      this.referentielResource.modifierUneRessource('typedepense', Number(this.typeDepenseId), payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le type de dépense a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/typedepense'])
  }


}
