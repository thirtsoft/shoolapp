import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InformationEcoleComponent } from './components/information-ecole-component/information-ecole-component';
import { InitierAnneeScolaireComponent } from './components/initier-annee-scolaire-component/initier-annee-scolaire-component';
import { StructurePedagogiqueComponent } from './components/structure-pedagogique-component/structure-pedagogique-component';
import { PeriodesScolairesComponent } from './components/periodes-scolaires-component/periodes-scolaires-component';
import { ClassesAAjouterComponent } from './components/classes-a-ajouter-component/classes-a-ajouter-component';
import { FinalisationComponent } from './components/finalisation-component/finalisation-component';
import { MatieresPrepareesComponent } from './components/matieres-preparees-component/matieres-preparees-component';

interface SetupStep {
  number: number;
  code: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-setup-component',
  standalone: true,
  imports: [ReactiveFormsModule, InformationEcoleComponent, 
    InitierAnneeScolaireComponent,
    StructurePedagogiqueComponent,
    ClassesAAjouterComponent,
    PeriodesScolairesComponent,
    MatieresPrepareesComponent,
    FinalisationComponent],
  templateUrl: './setup-component.html',
  styleUrl: './setup-component.css',
})
export class SetupComponent {

  currentStep = signal(1);
  saving = signal(false);
  completed = signal(false);

  readonly steps: SetupStep[] = [

    {
      number: 1,
      code: 'ecole',
      label: 'Mon établissement',
      description: 'Les informations essentielles',
      icon: '🏫'
    },

    {
      number: 2,
      code: 'annee',
      label: 'Année scolaire',
      description: 'Préparer votre année',
      icon: '📅'
    },

    {
      number: 3,
      code: 'structure',
      label: 'Cycles & niveaux',
      description: 'Définir votre structure pédagogique',
      icon: '📚'
    },

    {
      number: 4,
      code: 'classes',
      label: 'Classes',
      description: 'Organiser vos classes',
      icon: '🏷️'
    },

    {
      number: 5,
      code: 'periodes',
      label: 'Périodicité',
      description: 'Organiser votre année en semestres',
      icon: '🗓️'
    },

    {
      number: 6,
      code: 'matieres',
      label: 'Matières',
      description: 'Préparer les matières',
      icon: '📖'
    },

    {
      number: 7,
      code: 'finalisation',
      label: 'Prêt à démarrer',
      description: 'Vérifier votre configuration',
      icon: '🚀'
    }

  ];

  get currentStepData(): SetupStep {
    return this.steps[this.currentStep() - 1];
  }


  get progress(): number {

    return (
      ((this.currentStep() - 1) /
        (this.steps.length - 1)) *
      100
    );

  }


  continuer(): void {

    if (this.saving()) {
      return;
    }

    if (this.currentStep() < this.steps.length) {

      this.currentStep.update(
        step => step + 1
      );

      return;
    }

    this.completed.set(true);
  }


  retour(): void {

    if (this.saving()) {
      return;
    }

    if (this.currentStep() > 1) {

      this.currentStep.update(
        step => step - 1
      );

    }

  }


  allerA(step: number): void {

    if (this.saving()) {
      return;
    }

    /*
     * On autorise uniquement le retour
     * vers une étape déjà parcourue.
     */
    if (step < this.currentStep()) {

      this.currentStep.set(step);

    }

  }


  terminer(): void {

    this.completed.set(true);

  }

}