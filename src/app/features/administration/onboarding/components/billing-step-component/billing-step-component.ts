import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  OnboardingStepComponent
} from '../../../../../core/models/onboarding/onboarding-step-component.interface';

import {
  OnboardingInvoiceRequest
} from '../../../../../core/models/onboarding/onboarding-invoice-request';



@Component({

  selector: 'app-billing-step-component',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './billing-step-component.html',

  styleUrl: './billing-step-component.css'

})
export class BillingStepComponent implements OnboardingStepComponent<OnboardingInvoiceRequest> {


  commentaire = '';



  get value(): OnboardingInvoiceRequest {

    return {

      commentaire: this.commentaire

    };

  }



  isValid(): boolean {

    return true;

  }



  markTouched(): void { }

}
