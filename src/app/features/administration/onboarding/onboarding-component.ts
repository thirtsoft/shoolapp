import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-onboarding-component',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './onboarding-component.html',
  styleUrl: './onboarding-component.css',
})
export class OnboardingComponent {}
