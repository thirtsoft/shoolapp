import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Serie } from '../../../../../../core/models/referentiels/serie';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-create-edit-serie-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-edit-serie-component.html',
  styleUrl: './create-edit-serie-component.css',
})
export class CreateEditSerieComponent {
  errorMessage?: string;
  serieId?: number;
  serieFormGroup!: FormGroup;
  serie: any;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;

  utilisateur: Utilisateur = {};

  title = "Ajouter une série";

  private readonly referentielService = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.serieId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);

    if (this.serieId != null && this.serieId != undefined) {
      this.getSerie(this.serieId);
      this.title = 'Modifier une série';
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

  getSerie(serieId: number) {
    this.referentielService.recupererUneResource('serie', serieId).subscribe({
      next: (data) => {
        this.serie = data;
        this.initializeForm(this.serie);
      }
    });
  }

  initializeForm(serie: Serie | null) {
    this.serieFormGroup = this._formBuilder.group({
      id: [serie?.id ?? null],
      code: [serie?.code ?? '', Validators.required],
      libelle: [serie?.libelle ? serie.libelle : '', Validators.required],
    });
  }


  ajoutEditSerie() {
    const payload = this.serieFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.referentielService.creerUneRessource('serie', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La série a été enregistrées avec succès !!! ');
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
      this.referentielService.modifierUneRessource('serie', Number(this.serieId), payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La série a été modifiées avec succès !!! ');
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
    this.router.navigate(['admin/referentiel/series'])
  }

}
