import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeDepense } from '../../../../../../core/models/referentiels/type-depense';
import { Banque } from '../../../../../../core/models/referentiels/banque';

@Component({
  selector: 'app-create-edit-banque-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-edit-banque-component.html',
  styleUrl: './create-edit-banque-component.css',
})
export class CreateEditBanqueComponent implements OnInit {

  errorMessage?: string;
  baqnueUuId?: string;
  banqueFormGroup!: FormGroup;
  banque: any;
  isEdit: boolean = false;

  title = "Ajouter une banque";

  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.baqnueUuId = this.activeRoute.snapshot.params['uuid'];
  }

  ngOnInit(): void {
    this.initializeForm(null);
    if (this.baqnueUuId != null && this.baqnueUuId != undefined) {
      this.getBanque(this.baqnueUuId);
      this.title = 'Modifier une banque';
      this.isEdit = true;
    }
  }

  getBanque(baqnueUuId: string) {
    this.referentielResource.recupererUneResourceUuId('baqnue', baqnueUuId).subscribe({
      next: (data) => {
        this.banque = data;
        this.initializeForm(this.banque);
      }
    });
  }

  initializeForm(banque: Banque | null) {
    this.banqueFormGroup = this._formBuilder.group({
      code: [banque?.code ?? '', Validators.required],
      libelle: [banque?.libelle ?? '', Validators.required],
      description: [banque?.description ?? '', Validators.required],
    });
  }


  ajoutEditBanque() {
    const payload = this.banqueFormGroup.value;
    if (!this.isEdit) {
      this.referentielResource.creerUneRessource('banque', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La banque a été enregistrées avec succès !!! ');
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
      this.referentielResource.modifierUneRessourceUuid('banque', this.baqnueUuId!, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La banque a été modifiées avec succès !!! ');
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
    void this.router.navigate(['admin/referentiel/banques'])
  }


}

