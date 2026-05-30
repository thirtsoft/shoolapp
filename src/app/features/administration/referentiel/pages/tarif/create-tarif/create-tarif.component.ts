import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Tarif } from '../../../../../../core/models/referentiels/tarif';
import { TypeServiceOffert } from '../../../../../../core/models/referentiels/type-service-offert';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-tarif',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './create-tarif.component.html',
  styleUrls: ['./create-tarif.component.css']
})
export class CreateTarifComponent implements OnInit {

  errorMessage?: string;
  tarifId: number;
  tarifFormGroup!: FormGroup;
  tarif: any;
  isEdit: boolean = false;

  classList: ListeClasse[] = [];
  typeServiceList: TypeServiceOffert[] = [];

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter un tarif";

  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.tarifId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClassList();
    this.getTypeServiceList();
    this.initializeForm(null);
    if (this.tarifId != null && this.tarifId != undefined) {
      this.getTarif(this.tarifId);
      this.title = 'Modifier un tarif';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
        //    this.ecoleId = this.utilisateur.ecoleId;
      },
      error: error => { console.log(error) },
    });

  }

  getClassList() {
    this.referentielResource.getResourceList('classe').subscribe({
      next: (data: any) => {
        this.classList = data;
      }
    });
  }

  getSelectedClasseName(): string {
    const classeId = this.tarifFormGroup.get('classe')?.value;
    const classe = this.classList.find(c => Number(c.id) === Number(classeId));
    return classe?.libelle || '';
  }

  getTypeServiceList() {
    this.referentielResource.getResourceList('typeserviceoffert').subscribe({
      next: (data: any) => {
        this.typeServiceList = data;
      }
    });
  }

  getSelectedTypeServiceName(): string {
    const serviceId = this.tarifFormGroup.get('typeService')?.value;
    const service = this.typeServiceList.find(s => Number(s.id) === Number(serviceId));
    return service?.libelle || '';
  }



  getTarif(tarifId: number) {
    this.referentielResource.recupererUneResource('tarif', tarifId).subscribe({
      next: (data) => {
        this.tarif = data;
        this.initializeForm(this.tarif);
      }
    });
  }


  initializeForm(tarif: Tarif | null) {
    this.tarifFormGroup = this._formBuilder.group({
      id: [tarif?.id ? tarif.id : ''],
      classe: [tarif?.classe ? tarif.classe : '', Validators.required],
      typeService: [tarif?.typeService ? tarif.typeService : '', Validators.required],
      montant: [tarif?.montant ? tarif.montant : '', Validators.required],
    });
  }


  ajouteditTarif() {
    const payload = this.tarifFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielResource.creerUneRessource('tarif', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le tarif a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/referentiels/tarif'])
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
      this.referentielResource.modifierUneRessource('tarif', this.tarifId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le tarif a été modifiées avec succès !!! ');
            this.router.navigate(['admin/referentiels/tarif'])
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
    this.router.navigate(['admin/referentiels/tarif'])
  }


}
