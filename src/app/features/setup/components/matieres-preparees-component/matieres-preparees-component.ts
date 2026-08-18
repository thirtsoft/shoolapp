import { Component, signal } from '@angular/core';

interface Matiere {
  code: string;
  nom: string;
}

interface NiveauMatieres {
  niveauCode: string;
  niveauLabel: string;
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
      niveauCode: 'MOYENNE_SECTION',
      niveauLabel: 'Moyenne section',
      cycleCode: 'MATERNELLE',
      cycleLabel: 'Maternelle',
      matieres: [
        {
          code: 'FRANCAIS',
          nom: 'Français'
        }
      ]
    },

    {
      niveauCode: '6EME',
      niveauLabel: '6ème',
      cycleCode: 'COLLEGE',
      cycleLabel: 'Collège',
      matieres: [
        {
          code: 'FRANCAIS',
          nom: 'Français'
        },
        {
          code: 'MATHEMATIQUES',
          nom: 'Mathématiques'
        }
      ]
    },

    {
      niveauCode: '5EME',
      niveauLabel: '5ème',
      cycleCode: 'COLLEGE',
      cycleLabel: 'Collège',
      matieres: [
        {
          code: 'FRANCAIS',
          nom: 'Français'
        },
        {
          code: 'MATHEMATIQUES',
          nom: 'Mathématiques'
        }
      ]
    }
  ]);

  get totalMatieres(): number {

    return this.niveaux()
      .reduce(
        (total, niveau) =>
          total + niveau.matieres.length,
        0
      );

  }

  get totalNiveaux(): number {

    return this.niveaux().length;

  }

  selectionnerMatiere(
    niveauCode: string,
    matiereCode: string
  ): void {

    console.log(
      'Matière sélectionnée :',
      niveauCode,
      matiereCode
    );

  }

  isSelected(niveauCode: string, matiereCode: string): boolean {
    return true;

  }

}
