import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { ParametrageEcole } from '../../../../../core/models/admin/ecole/parametrage-ecole';
import { ParametresEtablissement } from '../../../../../core/models/referentiels/parametre-etablissement';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { ImageService } from '../../../../../core/services/image.service';
import { UtilisateurService } from '../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../service/referentiel.service';

@Component({
  selector: 'app-config-etablissement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config-etablissement.component.html',
  styleUrls: ['./config-etablissement.component.css']
})
export class ConfigEtablissementComponent implements OnInit {

  parametreEtablissementFormGroup!: FormGroup;
  parametresEtablissement: ParametrageEcole = {};

  logoPreview: string | null = null;
  isLoading = false;

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Modifier les paramétrages";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly imageService = inject(ImageService);


  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getParametresEtablissement();
    this.parametreEtablissementFormGroup = this._formBuilder.group({
      id: [this.ecoleId],
      nom: ['', Validators.required],
      slogan: [''],
      ville: [''],
      adresse: ['', Validators.required],
      telephone: ['', Validators.required],
      email: [''],
      siteWeb: [''],
      logoBase64: [''],
    });
    this.getParametresEtablissement();

  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });

  }


  getParametresEtablissement(): void {
    this.isLoading = true;
    this.referentielService.getParametrageEtablissement(1).subscribe(
      (config: ParametresEtablissement) => {
        this.parametreEtablissementFormGroup.patchValue(config);
        this.logoPreview = config.logoBase64 || null;
        this.isLoading = false;
      },
      error => {
        console.error('Erreur chargement config', error);
        this.isLoading = false;
      }
    );
  }

  onLogoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imageService.redimensionnerEtCompressionImage(file, 200, 200, 0.7).then(base64 => {
        this.parametreEtablissementFormGroup.patchValue({ logoBase64: base64 });
        this.logoPreview = base64;
      }).catch(err => {
        console.error('Erreur conversion logo', err);
      });
    }
  }

  miseAJoutParametresEtablissement() {
    if (this.parametreEtablissementFormGroup.invalid) {
      this.parametreEtablissementFormGroup.markAllAsTouched();
      return;
    }

    const payload = this.parametreEtablissementFormGroup.value;
    console.log('pauyload send', payload);
    return;
    this.referentielService.miseAJouParametrageEtablissement(payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les paramètres ont été modifiées avec succès !!! ');
          this.isLoading = false;
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
        }
      },
      error: (data) => {
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['admin/referentiels/matiere'])
  }


}
