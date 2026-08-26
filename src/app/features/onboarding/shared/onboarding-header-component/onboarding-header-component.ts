import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-onboarding-header-component',
  standalone: true,
  imports: [],
  templateUrl: './onboarding-header-component.html',
  styleUrl: './onboarding-header-component.css',
})
export class OnboardingHeaderComponent {

  @Input()
  title = '';



  @Input()
  description = '';


}
