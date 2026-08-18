import { Component, signal } from '@angular/core';

interface NiveauClasse {
  code: string;
  label: string;
  cycle: string;
  cycleLabel: string;
  classes: Classe[];
}

interface Classe {
  code: string;
  nom: string;
  selected: boolean;
}

@Component({
  selector: 'app-classes-a-ajouter-component',
  standalone:true,
  imports: [],
  templateUrl: './classes-a-ajouter-component.html',
  styleUrl: './classes-a-ajouter-component.css',
})
export class ClassesAAjouterComponent {

  readonly niveaux = signal<NiveauClasse[]>([
    {
      code: '6EME',
      label: '6ème',
      cycle: 'COLLEGE',
      cycleLabel: 'Collège',
      classes: [
        {
          code: '6EME-A',
          nom: '6ème A',
          selected: true,
        },
        {
          code: '6EME-B',
          nom: '6ème B',
          selected: true,
        },
      ],
    },

    {
      code: '5EME',
      label: '5ème',
      cycle: 'COLLEGE',
      cycleLabel: 'Collège',
      classes: [
        {
          code: '5EME-A',
          nom: '5ème A',
          selected: true,
        },
        {
          code: '5EME-B',
          nom: '5ème B',
          selected: true,
        },
      ],
    },

    {
      code: 'CM2',
      label: 'CM2',
      cycle: 'PRIMAIRE',
      cycleLabel: 'Primaire',
      classes: [
        {
          code: 'CM2-A',
          nom: 'CM2 A',
          selected: true,
        },
        {
          code: 'CM2-B',
          nom: 'CM2 B',
          selected: true,
        },
      ],
    },
  ]);

  toggleClasse(
    niveauCode: string,
    classeCode: string
  ): void {

    this.niveaux.update(niveaux =>
      niveaux.map(niveau => {

        if (niveau.code !== niveauCode) {
          return niveau;
        }

        return {
          ...niveau,
          classes: niveau.classes.map(classe =>
            classe.code === classeCode
              ? {
                ...classe,
                selected: !classe.selected,
              }
              : classe
          ),
        };
      })
    );
  }


  toggleNiveau(niveauCode: string): void {

    this.niveaux.update(niveaux =>
      niveaux.map(niveau => {

        if (niveau.code !== niveauCode) {
          return niveau;
        }

        const allSelected =
          niveau.classes.length > 0 &&
          niveau.classes.every(classe => classe.selected);

        return {
          ...niveau,
          classes: niveau.classes.map(classe => ({
            ...classe,
            selected: !allSelected,
          })),
        };
      })
    );
  }

  isNiveauFullySelected(niveau: NiveauClasse): boolean {

    return (
      niveau.classes.length > 0 &&
      niveau.classes.every(classe => classe.selected)
    );
  }


  isNiveauSelected(niveau: NiveauClasse): boolean {

    return niveau.classes.some(
      classe => classe.selected
    );
  }

  get selectedClassesCount(): number {

    return this.niveaux().reduce(
      (total, niveau) =>
        total +
        niveau.classes.filter(classe => classe.selected).length,
      0
    );
  }

  get totalClassesCount(): number {

    return this.niveaux().reduce(
      (total, niveau) =>
        total + niveau.classes.length,
      0
    );
  }


  getSelectedClasses(): {niveauCode: string;classeCode: string;nom: string;}[] {

    return this.niveaux().flatMap(niveau =>
      niveau.classes
        .filter(classe => classe.selected)
        .map(classe => ({
          niveauCode: niveau.code,
          classeCode: classe.code,
          nom: classe.nom,
        }))
    );
  }

}
