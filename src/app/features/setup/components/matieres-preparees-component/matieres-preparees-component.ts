import { Component, EventEmitter, Output, signal, } from '@angular/core';
import { SetupMatieresRequest } from '../../../../core/models/setup/request/setup-matieres-request.model';
import { SetupMatiereRequest } from '../../../../core/models/setup/request/setup-matiere-request.model';
interface Matiere {
  code: string;
  libelle: string;
  selected: boolean;
}
interface NiveauMatieres {
  niveauLibelle: string;
  cycleCode: string;
  cycleLabel: string;
  matieres: Matiere[];
}

@Component({
  selector: 'app-matieres-preparees-component',
  standalone: true,
  imports: [],
  templateUrl: './matieres-preparees-component.html',
  styleUrl: './matieres-preparees-component.css',
})
export class MatieresPrepareesComponent {

  readonly niveaux = signal<NiveauMatieres[]>([
    {
      niveauLibelle: 'Moyenne section',
      cycleCode: 'MATERNELLE',
      cycleLabel: 'Maternelle',
      matieres: [
        {
          code: 'FR',
          libelle: 'Français',
          selected: true,
        },
      ],
    },
    {
      niveauLibelle: '6ème',
      cycleCode: 'COLLEGE',
      cycleLabel: 'Collège',
      matieres: [
        {
          code: 'FR',
          libelle: 'Français',
          selected: true,
        },
        {
          code: 'MATHS',
          libelle: 'Mathématiques',
          selected: true,
        },
      ],
    },
    {
      niveauLibelle: '5ème',
      cycleCode: 'COLLEGE',
      cycleLabel: 'Collège',
      matieres: [
        {
          code: 'FR',
          libelle: 'Français',
          selected: true,
        },
        {
          code: 'MATHS',
          libelle: 'Mathématiques',
          selected: true,
        },
      ],
    },
  ]);

  @Output()
  selectionChange = new EventEmitter<boolean>();

  get totalMatieres(): number {
    return this.niveaux().reduce(
      (total, niveau) =>
        total +
        niveau.matieres.filter(
          matiere => matiere.selected
        ).length,
      0
    );
  }

  get totalNiveaux(): number {
    return this.niveaux().filter(
      niveau =>
        niveau.matieres.some(
          matiere => matiere.selected
        )
    ).length;
  }

  selectionnerMatiere(    niveauLibelle: string,    matiereCode: string  ): void {

    this.niveaux.update(niveaux =>
      niveaux.map(niveau => {

        if (
          niveau.niveauLibelle !== niveauLibelle
        ) {
          return niveau;
        }

        return {
          ...niveau,
          matieres: niveau.matieres.map(
            matiere =>
              matiere.code === matiereCode
                ? {
                  ...matiere,
                  selected: !matiere.selected,
                }
                : matiere
          ),
        };
      })
    );

    this.selectionChange.emit( this.hasSelection    );
  }

  isSelected(niveauLibelle: string,matiereCode: string  ): boolean {

    const niveau = this.niveaux().find(
      niveau =>
        niveau.niveauLibelle === niveauLibelle
    );

    return niveau?.matieres.some(
      matiere =>
        matiere.code === matiereCode &&
        matiere.selected
    ) ?? false;
  }

  get hasSelection(): boolean {

    return this.niveaux().some(
      niveau =>
        niveau.matieres.some(
          matiere => matiere.selected
        )
    );
  }

  getMatieresRequest(): SetupMatieresRequest {

    const matieres: SetupMatiereRequest[] = [];

    for (const niveau of this.niveaux()) {

      for (const matiere of niveau.matieres) {

        if (!matiere.selected) {
          continue;
        }

        const existeDeja = matieres.some(
          item =>
            item.code === matiere.code
        );

        if (existeDeja) {
          continue;
        }

        matieres.push({
          code: matiere.code,
          libelle: matiere.libelle,
        });
      }
    }

    return {
      matieres,
    };
  }
}