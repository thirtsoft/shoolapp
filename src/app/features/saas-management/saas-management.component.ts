import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-saas-management',
  standalone: true,
  imports: [ReactiveFormsModule, RouterOutlet],
  templateUrl: './saas-management.component.html',
  styleUrls: ['./saas-management.component.css']
})
export class SaaSManagementComponent {

}