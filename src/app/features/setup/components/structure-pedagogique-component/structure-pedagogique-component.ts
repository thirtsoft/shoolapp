import { Component, signal } from '@angular/core';

interface Niveau {
  code: string;
  label: string;
  selected: boolean;
}

interface Cycle {
  code: string;
  label: string;
  description: string;
  icon: string;
  niveaux: Niveau[];
}

@Component({
  selector: 'app-structure-pedagogique-component',
  standalone: true,
  imports: [],
  templateUrl: './structure-pedagogique-component.html',
  styleUrl: './structure-pedagogique-component.css',
})
export class StructurePedagogiqueComponent {

  readonly cycles = signal<Cycle[]>([
    {
      code: 'MATERNELLE',
      label: 'Maternelle',
      description: 'Petite, moyenne et grande section',
      icon: '🧸',
      niveaux: [
        {
          code: 'PS',
          label: 'Petite Section',
          selected: false,
        },
        {
          code: 'MS',
          label: 'Moyenne Section',
          selected: false,
        },
        {
          code: 'GS',
          label: 'Grande Section',
          selected: false,
        },
      ],
    },

    {
      code: 'PRIMAIRE',
      label: 'Primaire',
      description: 'Du CI au CM2',
      icon: '📖',
      niveaux: [
        {
          code: 'CI',
          label: 'CI',
          selected: false,
        },
        {
          code: 'CP',
          label: 'CP',
          selected: false,
        },
        {
          code: 'CE1',
          label: 'CE1',
          selected: false,
        },
        {
          code: 'CE2',
          label: 'CE2',
          selected: false,
        },
        {
          code: 'CM1',
          label: 'CM1',
          selected: false,
        },
        {
          code: 'CM2',
          label: 'CM2',
          selected: false,
        },
      ],
    },

    {
      code: 'COLLEGE',
      label: 'Collège',
      description: 'De la 6ème à la 3ème',
      icon: '🎒',
      niveaux: [
        {
          code: '6EME',
          label: '6ème',
          selected: false,
        },
        {
          code: '5EME',
          label: '5ème',
          selected: false,
        },
        {
          code: '4EME',
          label: '4ème',
          selected: false,
        },
        {
          code: '3EME',
          label: '3ème',
          selected: false,
        },
      ],
    },

    {
      code: 'LYCEE',
      label: 'Lycée',
      description: 'Seconde, première et terminale',
      icon: '🎓',
      niveaux: [
        {
          code: 'SECONDE',
          label: 'Seconde',
          selected: false,
        },
        {
          code: 'PREMIERE',
          label: 'Première',
          selected: false,
        },
        {
          code: 'TERMINALE',
          label: 'Terminale',
          selected: false,
        },
      ],
    },
  ]);

  /**
   * Sélectionne ou désélectionne un niveau.
   */
  toggleNiveau(
    cycleCode: string,
    niveauCode: string
  ): void {

    this.cycles.update(cycles =>
      cycles.map(cycle => {

        if (cycle.code !== cycleCode) {
          return cycle;
        }

        return {
          ...cycle,
          niveaux: cycle.niveaux.map(niveau =>
            niveau.code === niveauCode
              ? {
                ...niveau,
                selected: !niveau.selected,
              }
              : niveau
          ),
        };
      })
    );
  }

  /**
   * Sélectionne tous les niveaux d'un cycle
   * ou les désélectionne s'ils sont déjà tous sélectionnés.
   */
  toggleCycle(cycleCode: string): void {

    this.cycles.update(cycles =>
      cycles.map(cycle => {

        if (cycle.code !== cycleCode) {
          return cycle;
        }

        const allSelected =
          cycle.niveaux.length > 0 &&
          cycle.niveaux.every(niveau => niveau.selected);

        return {
          ...cycle,
          niveaux: cycle.niveaux.map(niveau => ({
            ...niveau,
            selected: !allSelected,
          })),
        };
      })
    );
  }

  /**
   * Au moins un niveau du cycle est sélectionné.
   *
   * C'est cet état qui détermine si le cycle est considéré
   * comme choisi.
   */
  isCycleSelected(cycle: Cycle): boolean {
    return cycle.niveaux.some(niveau => niveau.selected);
  }

  /**
   * Tous les niveaux du cycle sont sélectionnés.
   */
  isCycleFullySelected(cycle: Cycle): boolean {
    return (
      cycle.niveaux.length > 0 &&
      cycle.niveaux.every(niveau => niveau.selected)
    );
  }

  /**
   * Le cycle est partiellement sélectionné.
   */
  isCyclePartiallySelected(cycle: Cycle): boolean {
    const selectedCount =
      cycle.niveaux.filter(niveau => niveau.selected).length;

    return (
      selectedCount > 0 &&
      selectedCount < cycle.niveaux.length
    );
  }

  /**
   * Nombre de niveaux sélectionnés.
   */
  get selectedNiveauxCount(): number {

    return this.cycles().reduce(
      (total, cycle) =>
        total +
        cycle.niveaux.filter(niveau => niveau.selected).length,
      0
    );
  }

  get hasSelection(): boolean {
    return this.selectedNiveauxCount > 0;
  }

  getSelectedNiveaux(): { cycleCode: string; niveauCode: string; }[] {

    return this.cycles().flatMap(cycle =>
      cycle.niveaux
        .filter(niveau => niveau.selected)
        .map(niveau => ({
          cycleCode: cycle.code,
          niveauCode: niveau.code,
        }))
    );
  }


}