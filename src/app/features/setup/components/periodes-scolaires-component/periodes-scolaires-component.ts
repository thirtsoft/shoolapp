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
      numero: 1,
      libelle: 'Semestre 1',
      typePeriode: 'SEMESTRE'
    },
    {
      code: 'S2',
      numero: 2,
      libelle: 'Semestre 2',
      typePeriode: 'SEMESTRE'

    },
  ]);

  selectionnerSemestres(): void {
    this.periodicite.set('SEMESTRIELLE');
    this.semestres.set([
      {
        code: 'S1',
        numero: 1,
        libelle: 'Semestre 1',
        typePeriode: 'SEMESTRE'
      },
      {
        code: 'S2',
        numero: 2,
        libelle: 'Semestre 2',
        typePeriode: 'SEMESTRE'
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
          numero: semestre.numero,
          code: semestre.code,
          libelle: semestre.libelle,
          typePeriode: semestre.typePeriode
        })
      ),
    };
  }
}