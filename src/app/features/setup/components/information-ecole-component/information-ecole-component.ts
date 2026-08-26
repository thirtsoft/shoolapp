import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { OrganizationResponse } from '../../../../core/models/onboarding/organization/organization-response';
import { OnboardingReferentialService } from '../../../onboarding/service/onboarding-referential.service';

@Component({
  selector: 'app-information-ecole-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './information-ecole-component.html',
  styleUrl: './information-ecole-component.css',
})
export class InformationEcoleComponent implements OnInit {

  @Input({ required: true })
  organizationUuid!: string;

  @Output()
  formValidityChange = new EventEmitter<boolean>();

  readonly currentYear = new Date().getFullYear();

  readonly form: FormGroup;

  private readonly organizationService = inject(OnboardingReferentialService);

  loading = false;

  constructor(
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({

      code: ['', [Validators.required, Validators.minLength(2)]],
      libelle: ['', [Validators.required, Validators.minLength(2)]],
      sigle: ['', [Validators.maxLength(20)]],
      schoolType: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', Validators.required],
      mobile: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      siteWeb: [''],
      description: [''],
      boitePostale: [''],
      directeur: ['M. Abdoulaye Diallo'],
      anneeCreation: [null,
        [
          Validators.required,
          Validators.min(1800),
          Validators.max(new Date().getFullYear())
        ]
      ]

    });
  }

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => {
      this.formValidityChange.emit(
        this.form.valid
      );
    });

    this.chargerOrganisation();
  }

  private chargerOrganisation(): void {
    if (!this.organizationUuid) {
      console.error('organizationUuid est obligatoire pour charger l’organisation.');
      return;
    }

    this.loading = true;

    this.organizationService.getOrganizationByUUID(this.organizationUuid)

      .subscribe({

        next: (organization: OrganizationResponse) => {
          console.log('Organisation récupérer est {} ', organization);
          this.form.patchValue({
            code: organization.code,
            libelle: organization.libelle,
            sigle: organization.sigle,
            schoolType: organization.schoolType,
            boitePostale: organization.boitePostale,
            adresse: organization.adresse,
            telephone: organization.telephone,
            mobile: organization.mobile,
            email: organization.email,
            siteWeb: organization.siteWeb,
            description: organization.description,
            directeur: '',
            anneeCreation: organization.anneeCreation
          });

          this.loading = false;

        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement de l’organisation',
            error
          );

          this.loading = false;
        }
      }
      );

  }

  get code() {
    return this.form.get('code');
  }

  get libelle() {
    return this.form.get('libelle');
  }

  get sigle() {
    return this.form.get('sigle');
  }

  get schoolType() {
    return this.form.get('schoolType');
  }

  get adresse() {
    return this.form.get('adresse');
  }

  get telephone() {
    return this.form.get('telephone');
  }

  get mobile() {
    return this.form.get('mobile');
  }

  get email() {
    return this.form.get('email');
  }

  get siteWeb() {
    return this.form.get('siteWeb');
  }

  get description() {
    return this.form.get('description');
  }

  get boitePostale() {
    return this.form.get('boitePostale');
  }

  get directeur() {
    return this.form.get('directeur');
  }

  get anneeCreation() {
    return this.form.get('anneeCreation');
  }



}