import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-role-tenant',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './role-tenant.component.html'
})
export class RoleTenantComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
