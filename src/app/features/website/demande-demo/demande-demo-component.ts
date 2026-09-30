import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  DemandeDemoService
} from '../../website/services/demande-demo.service';

import {
  DemandeDemoRequest
} from '../../../core/models/website/demande-demo-request';


@Component({
  selector: 'app-demande-demo-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './demande-demo-component.html',
  styleUrl: './demande-demo-component.css',
})
export class DemandeDemoComponent {


  private readonly demandeDemoService = inject(DemandeDemoService);
  private fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isSubmitting = false;
  submitted = false;
  errorMessage = '';
  submitting = false;
  success = false;

  demandeForm = this.fb.group({

    etablissement: this.fb.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      cycle: ['', Validators.required],
      ville: ['', Validators.required],
      nombreEleves: ['', Validators.required]
    }),

    responsable: this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      fonction: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.email]]
    }),

    besoins: this.fb.group({
      gestionEleves: [false],
      facturation: [false],
      paiements: [false],
      notesBulletins: [false],
      absences: [false],
      enseignants: [false],
      emploiDuTemps: [false],
      espaceParent: [false]
    }),

    message: [''],

    consentement: [false, Validators.requiredTrue]
  });


  submit(): void {

    this.errorMessage = '';

    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      return;
    }

    const formValue = this.demandeForm.getRawValue();

    const request: DemandeDemoRequest = {
      etablissement: {
        nom: formValue.etablissement.nom!,
        type: formValue.etablissement.type!,
        cycle: formValue.etablissement.cycle!,
        ville: formValue.etablissement.ville!,
        nombreEleves: formValue.etablissement.nombreEleves!
      },

      responsable: {
        prenom: formValue.responsable.prenom!,
        nom: formValue.responsable.nom!,
        fonction: formValue.responsable.fonction!,
        telephone: formValue.responsable.telephone!,
        email: formValue.responsable.email!
      },

      besoin: {
        gestionEleves: formValue.besoins.gestionEleves ?? false,
        facturation: formValue.besoins.facturation ?? false,
        paiements: formValue.besoins.paiements ?? false,
        notesBulletins: formValue.besoins.notesBulletins ?? false,
        absences: formValue.besoins.absences ?? false,
        enseignants: formValue.besoins.enseignants ?? false,
        emploiDuTemps: formValue.besoins.emploiDuTemps ?? false,
        espaceParent: formValue.besoins.espaceParent ?? false
      },

      message: formValue?.message!,

      consentement: formValue.consentement ?? false
    };

    this.isSubmitting = true;

    this.demandeDemoService.creer(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitted = true;

        console.log('Demande envoyée :', response);

        this.demandeForm.reset({
          etablissement: {
            nom: '',
            type: '',
            ville: '',
            nombreEleves: ''
          },
          responsable: {
            prenom: '',
            nom: '',
            fonction: '',
            telephone: '',
            email: ''
          },
          besoins: {
            gestionEleves: false,
            facturation: false,
            paiements: false,
            notesBulletins: false,
            absences: false,
            enseignants: false,
            emploiDuTemps: false,
            espaceParent: false
          },
          message: '',
          consentement: false
        });
      },

      error: (error) => {
        this.isSubmitting = false;

        console.error('Erreur lors de l’envoi de la demande :', error);

        this.errorMessage =
          error?.error?.message ??
          'Une erreur est survenue lors de l’envoi de votre demande. Veuillez réessayer.';
      }
    });
  }
 

  goBackHome(): void {
    this.router.navigate(['/']);
  }



}