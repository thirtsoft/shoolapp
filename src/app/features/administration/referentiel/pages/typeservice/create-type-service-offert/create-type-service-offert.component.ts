import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeServiceOffert } from '../../../../../../core/models/referentiels/type-service-offert';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-type-service-offert',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-type-service-offert.component.html',
  styleUrls: ['./create-type-service-offert.component.css']
})
export class CreateTypeServiceOffertComponent implements OnInit {

  errorMessage?: string;
  typeServiceId: number;
  typeServiceFormGroup!: FormGroup;
  typeService: any;
  isEdit: boolean = false;

  ecoleId: any;
  userId: number;

  utilisateur: Utilisateur = {};

  title = "Ajouter un service offert";


  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.typeServiceId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }


  ngOnInit(): void {

    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.typeServiceId != null && this.typeServiceId != undefined) {
      this.getTypeService(this.typeServiceId);
      this.title = 'Modifier un service offert';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
        //      this.ecoleId = this.utilisateur.ecoleId;
      },
      error: error => { console.log(error) },
    });

  }

  getTypeService(typeServiceId: number) {
    this.referentielResource.recupererUneResource('typeserviceoffert', typeServiceId).subscribe({
      next: (data) => {
        this.typeService = data;
        this.initializeForm(this.typeService);
      }
    });
  }

  initializeForm(typeService: TypeServiceOffert | null) {
    this.typeServiceFormGroup = this._formBuilder.group({
      id: [typeService?.id ? typeService.id : ''],
      libelle: [typeService?.libelle ? typeService.libelle : '', Validators.required],
    });
  }


  ajouteditTypeService() {
    const payload = this.typeServiceFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielResource.creerUneRessource('typeserviceoffert', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le service a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/typeservice'])
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
      this.referentielResource.modifierUneRessource('typeserviceoffert', this.typeServiceId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le service a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/typeservice'])
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
    this.router.navigate(['admin/referentiels/typeservice'])
  }


}
