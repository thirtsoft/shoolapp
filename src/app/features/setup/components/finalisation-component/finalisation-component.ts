import { Component } from '@angular/core';

@Component({
  selector: 'app-finalisation-component',
  standalone: true,
  imports: [],
  templateUrl: './finalisation-component.html',
  styleUrl: './finalisation-component.css',
})
export class FinalisationComponent {

  readonly etablissement = 'Mon établissement';

  readonly anneeScolaire = '2026 - 2027';

  readonly nombreCycles = 2;

  readonly nombreNiveaux = 8;

  readonly nombreClasses = 16;

  readonly nombreMatieres = 14;

  readonly periodes = 'Semestre 1 · Semestre 2';


}
