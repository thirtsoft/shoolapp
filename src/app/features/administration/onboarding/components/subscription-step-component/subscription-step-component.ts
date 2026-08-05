import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingSubscriptionRequest } from '../../../../../core/models/onboarding/onboarding-subscription-request';

import { SubscriptionCatalogResponse } from '../../../../../core/models/onboarding/subscription-catalog-response';

import { OnboardingReferentialService } from '../../service/onboarding-referential.service';


@Component({
  selector: 'app-subscription-step-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe
  ],
  templateUrl: './subscription-step-component.html',
  styleUrl: './subscription-step-component.css',
})
export class SubscriptionStepComponent
  implements OnboardingStepComponent<OnboardingSubscriptionRequest> {


  private readonly fb = inject(FormBuilder);

  private readonly referential =
    inject(OnboardingReferentialService);


  readonly catalog =
    signal<SubscriptionCatalogResponse | null>(null);


  readonly loading =
    signal(true);


  readonly error =
    signal<string | null>(null);



  form = this.fb.group({

    planUid: [
      '',
      Validators.required
    ],

    planTarifUid: [
      '',
      Validators.required
    ],

    planTarifDetailUid: [
      '',
      Validators.required
    ],

    renouvellementAutomatique: [
      true
    ],

    commentaire: [
      ''
    ]

  });



  constructor() {

    this.loadCatalog();

  }



  private loadCatalog() {

    this.referential
      .getSubscriptionCatalog()
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe({

        next: response => {

          if (response.success) {

            this.catalog.set(
              response.data
            );

          }

          this.loading.set(false);

        },


        error: () => {

          this.error.set(
            "Impossible de charger les offres d'abonnement."
          );

          this.loading.set(false);

        }

      });

  }




  get value() {

    return this.form
      .getRawValue() as OnboardingSubscriptionRequest;

  }



  isValid() {

    return this.form.valid;

  }



  markTouched() {

    this.form.markAllAsTouched();

  }



  selectPlan(plan: any) {


    let tarifUid = '';

    let detailUid = '';



    if (plan.tarifs?.length === 1) {


      const tarif = plan.tarifs[0];

      tarifUid = tarif.uuid;



      if (tarif.details?.length === 1) {


        detailUid =
          tarif.details[0].uuid;


      }

    }



    this.form.patchValue({

      planUid: plan.uuid,

      planTarifUid: tarifUid,

      planTarifDetailUid: detailUid

    });


  }



  selectTarif(tarif: any) {

    this.form.patchValue({

      planTarifUid: tarif.uuid,

      planTarifDetailUid: ''

    });

  }



  selectDetail(detail: any) {

    this.form.patchValue({

      planTarifDetailUid: detail.uuid

    });

  }



  isPlanSelected(uuid: string) {

    return this.form.value.planUid === uuid;

  }


  isTarifSelected(uuid: string) {

    return this.form.value.planTarifUid === uuid;

  }


  isDetailSelected(uuid: string) {

    return this.form.value.planTarifDetailUid === uuid;

  }



}