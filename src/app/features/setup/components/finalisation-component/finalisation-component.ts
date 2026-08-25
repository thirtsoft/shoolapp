import { Component, Input } from '@angular/core';
import { SetupProcessResponse } from '../../../../core/models/setup/response/setup-process-response.model';


@Component({
  selector: 'app-finalisation-component',
  standalone: true,
  imports: [],
  templateUrl: './finalisation-component.html',
  styleUrl: './finalisation-component.css',
})
export class FinalisationComponent {

  @Input({ required: true })
  setupDetails!: SetupProcessResponse;

  blocOuvert: string | null = null;

  toggleBloc(bloc: string): void {
    this.blocOuvert = this.blocOuvert === bloc ? null : bloc;
  }

  isBlocOuvert(bloc: string): boolean {
    return this.blocOuvert === bloc;
  }

  get nombreCycles(): number {
    return this.setupDetails?.structurePedagogique?.cycles?.length ?? 0;
  }

  get nombreNiveaux(): number {
    return this.setupDetails?.structurePedagogique?.cycles
      ?.reduce(
        (total, cycle) =>
          total + (cycle.niveaux?.length ?? 0),
        0
      ) ?? 0;
  }

  get nombreClasses(): number {
    return this.setupDetails?.classes?.classes?.length ?? 0;
  }

  get nombreMatieres(): number {
    return this.setupDetails?.matieres?.matieres?.length ?? 0;
  }

  get periodes(): string {
    return this.setupDetails?.semestres
      ?.map(semestre => semestre.libelle)
      .join(' · ') ?? '';
  }
}