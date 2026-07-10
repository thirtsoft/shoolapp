import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Tarif } from '../../../../../../core/models/referentiels/tarif';
import { TypeServiceOffert } from '../../../../../../core/models/referentiels/type-service-offert';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';

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

  niveauList: Niveau[] = [];
  typeServiceList: TypeServiceOffert[] = [];
  anneeScolaireList: AnneeScolaire[] = [];

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter un tarif";

  private readonly referentielResource = inject(ReferentielResourceService);
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
    this.getNiveauList();
    this.getTypeServiceList();
    this.getAnneeScolaireList();
    this.initializeForm(null);
    if (this.tarifId != null && this.tarifId != undefined) {
      this.getTarif(this.tarifId);
      this.title = 'Modifier un tarif';
      this.isEdit = true;
    }
  }


  getNiveauList() {
    this.referentielResource.getResourceList('niveau').subscribe({
      next: (data: any) => {
        this.niveauList = data;
      }
    });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.tarifFormGroup.get('niveau')?.value;
    const niveau = this.niveauList.find(c => Number(c.id) === Number(niveauId));
    return niveau?.libelle || '';
  }

  getAnneeScolaireList() {
    this.referentielResource.getResourceList('anneescolaire').subscribe({
      next: (data: any) => {
        this.anneeScolaireList = data;
      }
    });
  }

  getSelectedAnneeScolaire(): string {
    const anneeScolaireId = this.tarifFormGroup.get('anneeScolaire')?.value;
    const anneeScolaire = this.anneeScolaireList.find(c => Number(c.id) === Number(anneeScolaireId));
    return anneeScolaire?.libelle || '';
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
      id: [tarif?.id ?? ''],
      niveau: [tarif?.niveau ?? '', Validators.required],
      typeService: [tarif?.typeService ?? '', Validators.required],
      anneeScolaire: [tarif?.anneeScolaire ?? '', Validators.required],
      montant: [tarif?.montant ?? '', Validators.required],
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
      this.referentielResource.modifierUneRessource('tarif', this.tarifId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le tarif a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/tarifs'])
  }


}
