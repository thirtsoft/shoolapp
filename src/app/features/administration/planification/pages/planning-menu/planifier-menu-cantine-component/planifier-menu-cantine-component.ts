import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PlanningRepas } from '../../../../../../core/models/planification/planning-repas';
import { Menu } from '../../../../../../core/models/referentiels/menu';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-planifier-menu-cantine-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './planifier-menu-cantine-component.html',
  styleUrl: './planifier-menu-cantine-component.css',
})
export class PlanifierMenuCantineComponent implements OnInit {
  errorMessage?: string;
  planningRepasId?: number;
  planningRepas: any;
  planningRepasFormGroup!: FormGroup;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};
  menusList: Menu[] = [];
  joursSemaineList = [
    { code: 'LUNDI', libelle: 'Lundi' },
    { code: 'MARDI', libelle: 'Mardi' },
    { code: 'MERCREDI', libelle: 'Mercredi' },
    { code: 'JEUDI', libelle: 'Jeudi' },
    { code: 'VENDREDI', libelle: 'Vendredi' },
    { code: 'SAMEDI', libelle: 'Samedi' },
    { code: 'DIMANCHE', libelle: 'Dimanche' }
  ];


  title = "Programmer un menu plats";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.planningRepasId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getMenusList();
    this.initializeForm(null);
    if (this.planningRepasId != null && this.planningRepasId != undefined) {
      this.getPlanningRepas(this.planningRepasId);
      this.title = 'Reprogrammer un menu';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });

  }

  getMenusList() {
    this.referentielResource.getResourceList('menu').subscribe({
      next: (data: any) => {
        this.menusList = data;
      },
      error: error => { console.log(error) },
    });

  }

  getSelectedLibelleMenu(): string {
    const idMenu = this.planningRepasFormGroup.get('menuId')!.value;
    const menu = this.menusList?.find(a => Number(a.id) === Number(idMenu));
    return menu?.libelle || '';
  }


  getPlanningRepas(planningId: number) {
    this.planificationService.getSingleResource('planningrepas', planningId).subscribe({
      next: (data) => {
        this.planningRepas = data;
        this.initializeForm(this.planningRepas);
      }
    });
  }

  initializeForm(planning: PlanningRepas | null) {
    this.planningRepasFormGroup = this._formBuilder.group({
      id: [planning?.id ?? ''],
      menuId: [planning?.menuId ?? '', Validators.required],
      jourSemaine: [planning?.jourSemaine ?? '', Validators.required],
      dateConsommation: [planning?.dateConsommation ?? ''],
    });
  }

  ajouterEditPlanningRepas() {
    const payload = this.planningRepasFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.planificationService.createRessource('planification/planningrepas', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'palnning a été enregistrées avec succès !!! ');
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
      this.planificationService.updateResource('planification/planningrepas', Number(this.planningRepasId), payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Planning a été modifiées avec succès !!! ');
            this.goBack();
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la mofication : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la mofication : ' + data.error);
        }
      });

    }

  }

  goBack() {
    this.router.navigate(['admin/planification/cantine'])
  }


}

