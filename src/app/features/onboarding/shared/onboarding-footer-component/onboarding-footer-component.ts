import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-onboarding-footer-component',
  standalone: true,
  imports: [],
  templateUrl: './onboarding-footer-component.html',
  styleUrl: './onboarding-footer-component.css',
})
export class OnboardingFooterComponent {

  @Input()
  firstStep = false;



  @Input()
  lastStep = false;



  @Output()
  previous = new EventEmitter<void>();



  @Output()
  next = new EventEmitter<void>();



  @Output()
  submit = new EventEmitter<void>();

}
