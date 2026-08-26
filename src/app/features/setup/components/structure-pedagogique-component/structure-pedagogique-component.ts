import { Component, output, signal } from '@angular/core';
import { SetupStructurePedagogiqueRequest } from '../../../../core/models/setup/request/setup-structure-pedagogique-request.model';

interface Niveau {
  libelle: string;
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

  readonly structurePedagogiqueChange = output<SetupStructurePedagogiqueRequest>();

  readonly cycles = signal<Cycle[]>([
    {
      code: 'MATERNELLE',
      label: 'Maternelle',
      description: 'Petite, moyenne et grande section',
      icon: '🧸',
      niveaux: [
        {
          libelle: 'Petite Section',
          selected: false,
        },
        {
          libelle: 'Moyenne Section',
          selected: false,
        },
        {
          libelle: 'Grande Section',
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
          libelle: 'CI',
          selected: false,
        },
        {
          libelle: 'CP',
          selected: false,
        },
        {
          libelle: 'CE1',
          selected: false,
        },
        {
          libelle: 'CE2',
          selected: false,
        },
        {
          libelle: 'CM1',
          selected: false,
        },
        {
          libelle: 'CM2',
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
          libelle: '6ème',
          selected: false,
        },
        {
          libelle: '5ème',
          selected: false,
        },
        {
          libelle: '4ème',
          selected: false,
        },
        {
          libelle: '3ème',
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
          libelle: 'Seconde',
          selected: false,
        },
        {
          libelle: 'Première',
          selected: false,
        },
        {
          libelle: 'Terminale',
          selected: false,
        },
      ],
    },
  ]);

  toggleNiveau(cycleCode: string, niveauLibelle: string): void {

    this.cycles.update(cycles =>
      cycles.map(cycle => {

        if (cycle.code !== cycleCode) {
          return cycle;
        }

        return {
          ...cycle,
          niveaux: cycle.niveaux.map(niveau =>
            niveau.libelle === niveauLibelle
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

  isCycleSelected(cycle: Cycle): boolean {
    return cycle.niveaux.some(niveau => niveau.selected);
  }

  isCycleFullySelected(cycle: Cycle): boolean {
    return (
      cycle.niveaux.length > 0 &&
      cycle.niveaux.every(niveau => niveau.selected)
    );
  }

  isCyclePartiallySelected(cycle: Cycle): boolean {

    const selectedCount = cycle.niveaux.filter(niveau => niveau.selected).length;

    return (
      selectedCount > 0 &&
      selectedCount < cycle.niveaux.length
    );
  }


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

  getSelectedNiveaux(): { cycleCode: string; niveauLibelle: string; }[] {
    return this.cycles().flatMap(cycle =>
      cycle.niveaux
        .filter(niveau => niveau.selected)
        .map(niveau => ({
          cycleCode: cycle.code,
          niveauLibelle: niveau.libelle,
        }))
    );
  }

  getStructurePedagogiqueRequest(): SetupStructurePedagogiqueRequest {
    return {
      cycles: this.cycles()
        .filter(cycle =>
          cycle.niveaux.some(niveau => niveau.selected)
        )
        .map(cycle => ({
          code: cycle.code,
          libelle: cycle.label,

          niveaux: cycle.niveaux
            .filter(niveau => niveau.selected)
            .map(niveau => ({
              libelle: niveau.libelle
            }))
        }))
    };
  }

  valider(): void {
    if (!this.hasSelection) {
      return;
    }

    const structure = this.getStructurePedagogiqueRequest();

    console.log('[STRUCTURE PÉDAGOGIQUE] Données à envoyer :', structure);

    this.structurePedagogiqueChange.emit(structure);
  }

}