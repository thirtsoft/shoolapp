import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface DemoFeature {
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-demo-component',
  imports: [],
  templateUrl: './demo-component.html',
  styleUrl: './demo-component.css',
})
export class DemoComponent {

  demoFeatures: DemoFeature[] = [
    {
      title: 'Gestion des élèves',
      description: 'Gérez les inscriptions, les classes, les dossiers élèves et les informations des responsables.',
      icon: 'fas fa-user-graduate',
      color: 'blue'
    },
    {
      title: 'Notes & bulletins',
      description: 'Saisissez les notes, calculez automatiquement les résultats et générez les bulletins.',
      icon: 'fas fa-book',
      color: 'green'
    },
    {
      title: 'Paiements & facturation',
      description: 'Suivez les frais de scolarité, les paiements reçus et les situations financières.',
      icon: 'fas fa-wallet',
      color: 'purple'
    },
    {
      title: 'Absences & retards',
      description: 'Suivez les présences et les absences des élèves au quotidien.',
      icon: 'fas fa-calendar-check',
      color: 'orange'
    },
    {
      title: 'Emploi du temps',
      description: 'Organisez les cours, les enseignants, les salles et les horaires.',
      icon: 'fas fa-calendar-alt',
      color: 'coral'
    },
    {
      title: 'Communication',
      description: 'Facilitez les échanges entre l\'administration, les enseignants et les parents.',
      icon: 'fas fa-comments',
      color: 'sky'
    }
  ];

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }

  startTrial(): void {
    this.router.navigate(['/inscription']);
  }

  goBackHome(): void {
    this.router.navigate(['/']);
  }
}
