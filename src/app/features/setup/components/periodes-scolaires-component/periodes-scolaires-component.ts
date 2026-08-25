import { Component, signal, } from '@angular/core';
import { SetupSemestreRequest } from '../../../../core/models/setup/request/setup-semestre-request.model';
import { SetupPeriodeScolaireRequest } from '../../../../core/models/setup/request/setup-periode-scolaire-request.model';

@Component({
  selector: 'app-periodes-scolaires-component',
  standalone: true,
  imports: [],
  templateUrl: './periodes-scolaires-component.html',
  styleUrl: './periodes-scolaires-component.css',
})
export class PeriodesScolairesComponent {

  readonly periodicite = signal<string>('SEMESTRIELLE');

  readonly semestres = signal<SetupSemestreRequest[]>([
    {
      code: 'S1',
      libelle: 'Semestre 1',
    },
    {
      code: 'S2',
      libelle: 'Semestre 2',
    },
  ]);

  selectionnerSemestres(): void {
    this.periodicite.set('SEMESTRIELLE');
    this.semestres.set([
      {
        code: 'S1',
        libelle: 'Semestre 1',
      },
      {
        code: 'S2',
        libelle: 'Semestre 2',
      },
    ]);
  }

  get isSelected(): boolean {
    return this.periodicite() === 'SEMESTRIELLE';
  }

  get hasSelection(): boolean {
    return (
      this.isSelected &&
      this.semestres().length > 0
    );
  }

  getPeriodiciteRequest(): SetupPeriodeScolaireRequest {
    return {
      periodicite: this.periodicite(),
      semestres: this.semestres().map(
        semestre => ({
          code: semestre.code,
          libelle: semestre.libelle,
        })
      ),
    };
  }
}