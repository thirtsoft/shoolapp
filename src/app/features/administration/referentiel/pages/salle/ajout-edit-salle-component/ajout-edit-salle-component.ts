import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Batiment } from '../../../../../../core/models/referentiels/batiment';
import { SalleAddEdit } from '../../../../../../core/models/referentiels/salle';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-ajout-edit-salle-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-edit-salle-component.html',
  styleUrl: './ajout-edit-salle-component.css',
})
export class AjoutEditSalleComponent implements OnInit {

  errorMessage?: string;
  salleFormGroup!: FormGroup;
  salle?: any;
  salleId?: number;
  batimentList: Batiment[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};
  typeSalles?: string[] = ["Ordinaire", "Spécialisée", "Extérieure"];

  title = "Gestion salle";

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.salleId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getBatimentList();
    this.initializeForm(null);
    if (this.salleId != null && this.salleId != undefined) {
      this.getSalleById(this.salleId);
      this.title = 'Reprogrammer le cours';
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

  getBatimentList() {
    this.referentielService.getAllBatiments().subscribe(
      (data: any[]) => {
        this.batimentList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  getSelectedBatimentName(): string {
    const batimentId = this.salleFormGroup.get('batimentId')?.value;
    const batiment = this.batimentList.find(b => Number(b.id) === Number(batimentId));
    return batiment?.libelle || '';
  }

  getSalleById(salleId: number) {
    this.referentielService.getSalleById(salleId).subscribe({
      next: (data) => {
        this.salle = data;
        this.initializeForm(this.salle);
      }
    });
  }

  initializeForm(salle: SalleAddEdit | null) {
    this.salleFormGroup = this._formBuilder.group({
      id: [salle?.id ? salle.id : ''],
      libelle: [salle?.libelle ? salle.libelle : '', Validators.required],
      type_salle: [salle?.type_salle ? salle.type_salle : '', Validators.required],
      capacite: [salle?.capacite ? salle.capacite : '', Validators.required],
      batimentId: [salle?.batimentId ? salle.batimentId : '', Validators.required],
    });
  }

  ajouterEditSalle() {
    const payload: SalleAddEdit = {
      id: this.salleFormGroup.get("id")!.value,
      libelle: this.salleFormGroup.get("libelle")!.value,
      type_salle: this.salleFormGroup.get("type_salle")!.value,
      capacite: this.salleFormGroup.get("capacite")!.value,
      batimentId: this.salleFormGroup.get("batimentId")!.value,
    }

    if (this.salleId === null || this.salleId === undefined) {
      this.referentielService.createSalle(payload).subscribe({
        next: (data) => {
          console.log('payload after : ', data);
          this.toastService.success('success', 'La salle a été ajoutée avec succès.');
          this.router.navigate(['/admin/planification/cours']);
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.referentielService.updateSalle(this.salleId, payload).subscribe({
        next: data => {
          this.toastService.success('success', 'La salle a été modifié avec succès.');
          this.router.navigate(['/admin/planification/cours']);

        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }

  }

  goBack() {
    this.router.navigate(['/admin/planification/cours']);
  }

}
