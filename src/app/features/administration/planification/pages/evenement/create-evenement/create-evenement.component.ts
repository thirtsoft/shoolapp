import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Evenement } from '../../../../../../core/models/planification/evenement';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-create-evenement',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './create-evenement.component.html',
  styleUrls: ['./create-evenement.component.css']
})
export class CreateEvenementComponent implements OnInit {
  errorMessage?: string;
  evenementId: number;
  evenement: any;
  evenementFormGroup!: FormGroup;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};


  title = "Programmer un évenement";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.evenementId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.evenementId != null && this.evenementId != undefined) {
      this.getEvenement(this.evenementId);
      this.title = 'Reprogrammer un événement';
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


  getEvenement(evenementId: number) {
    this.planificationService.getEvenementById(evenementId).subscribe({
      next: (data) => {
        this.evenement = data;
        this.initializeForm(this.evenement);
      }
    });
  }

  initializeForm(evenement: Evenement | null) {
    this.evenementFormGroup = this._formBuilder.group({
      id: [evenement?.id ? evenement.id : ''],
      libelle: [evenement?.libelle ? evenement.libelle : '', Validators.required],
      dateEvenement: [evenement?.dateEvenement ? evenement?.dateEvenement : '', Validators.required],
      heureDebut: [evenement?.heureDebut ? evenement.heureDebut : '', Validators.required],
      heureFin: [evenement?.heureFin ? evenement.heureFin : '', Validators.required],
      description: [evenement?.description ? evenement.description : ''],
    });
  }

  ajoutereditEvenement() {
    const payload = this.evenementFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.planificationService.createEvenement(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Evénement a été enregistrées avec succès !!! ');
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
      this.planificationService.updateEvenement(this.evenementId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Evénement a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/planification/evenement'])
  }


}
