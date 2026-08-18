import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-periodes-scolaires-component',
  standalone: true,
  imports: [],
  templateUrl: './periodes-scolaires-component.html',
  styleUrl: './periodes-scolaires-component.css',
})
export class PeriodesScolairesComponent {

  readonly periodicite = signal<'SEMESTRIELLE'>('SEMESTRIELLE');

  selectionnerSemestres(): void {
    this.periodicite.set('SEMESTRIELLE');
  }

  get isSelected(): boolean {
    return this.periodicite() === 'SEMESTRIELLE';
  }

  readonly semestres = [
    {
      numero: 1,
      label: 'Semestre 1',
    },
    {
      numero: 2,
      label: 'Semestre 2',
    },
  ];

}
