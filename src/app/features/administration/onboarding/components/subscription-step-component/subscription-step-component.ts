import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingSubscriptionRequest } from '../../../../../core/models/onboarding/onboarding-subscription-request';

import { SubscriptionCatalogResponse } from '../../../../../core/models/onboarding/subscription-catalog-response';

import { OnboardingPlanResponse } from '../../../../../core/models/onboarding/onboarding-plan-response';
import { OnboardingReferentialService } from '../../service/onboarding-referential.service';
import { OnboardingStateService } from '../../service/onboarding-state.service';
import { OnboardingPlanTarifResponse } from '../../../../../core/models/onboarding/onboarding-plan-tarif-response';
import { OnboardingPlanTarifDetailResponse } from '../../../../../core/models/onboarding/onboarding-plan-tarif-detail-response';


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
export class SubscriptionStepComponent implements OnboardingStepComponent<OnboardingSubscriptionRequest> {

  private readonly fb = inject(FormBuilder);
  private readonly referential = inject(OnboardingReferentialService);
  readonly catalog = signal<SubscriptionCatalogResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = inject(OnboardingStateService);

  readonly form = this.fb.group({
    planUid: ['', Validators.required],
    planTarifUid: ['', Validators.required],
    planTarifDetailUid: ['', Validators.required],
    renouvellementAutomatique: [true],
    commentaire: ['']
  });

  constructor() {
    this.loadCatalog();
  }

  private loadCatalog() {

    this.referential.getSubscriptionCatalog()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
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
        detailUid = tarif.details[0].uuid;
      }
    }
    this.form.patchValue({
      planUid: plan.uuid,
      planTarifUid: tarifUid,
      planTarifDetailUid: detailUid

    });

    this.updateSubscriptionDisplay(plan);
  }

  selectTarif(tarif: OnboardingPlanTarifResponse): void {

    this.form.patchValue({
      planTarifUid: tarif.uuid,
      planTarifDetailUid: ''
    });

    const plan = this.getSelectedPlan();

    if (plan) {
      this.updateSubscriptionDisplay(plan);
    }
  }

  private getSelectedPlan(): OnboardingPlanResponse | undefined {
    const planUid = this.form.value.planUid;

    if (!planUid) {
      return undefined;
    }

    return this.catalog()?.applications
      .flatMap(application => application.plans
      )
      .find(plan => plan.uuid === planUid
      );

  }

  selectDetail(detail: OnboardingPlanTarifDetailResponse): void {
    this.form.patchValue({
      planTarifDetailUid: detail.uuid
    });

    const plan = this.getSelectedPlan();

    if (plan) {
      this.updateSubscriptionDisplay(plan);
    }
  }

  private updateSubscriptionDisplay(plan: OnboardingPlanResponse): void {

    const tarif = plan.tarifs.find(item => item.uuid === this.form.value.planTarifUid
    );

    const detail = tarif?.details.find(item => item.uuid === this.form.value.planTarifDetailUid
    );

    this.state.updateViewModel({
      subscriptionDisplay: {
        planName: plan.libelle,
        currencyLabel: tarif?.currencyLibelle,
        billingPeriodLabel: detail?.billingPeriod,
        amount: detail?.montantHt
      }
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