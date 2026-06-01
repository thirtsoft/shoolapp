import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarProfesseurComponent } from '../side-bar-professeur-component/side-bar-professeur-component';

interface NavItem {
  route: string;
  ico: string;
  label: string;
}

@Component({
  selector: 'app-main-layout-professeur-component',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideBarProfesseurComponent],
  templateUrl: './main-layout-professeur-component.html',
  styleUrl: './main-layout-professeur-component.css',
})
export class MainLayoutProfesseurComponent {

  readonly router = inject(Router);

  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);

  professeur = {
    nom: 'M. Sall',
    prenom: 'Moussa',
    matiere: 'Mathématiques',
    avatar: '👨‍🏫'
  };

  readonly todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ✅ Routes alignées sur /enseignant/
  nav: NavItem[] = [
    { route: '/enseignant/dashboard', ico: '📊', label: 'Accueil' },
    { route: '/enseignant/mes-eleves', ico: '👨‍🎓', label: 'Élèves' },
    { route: '/enseignant/notes', ico: '📝', label: 'Notes' },
    { route: '/enseignant/absences', ico: '✅', label: 'Appel' },
    { route: '/enseignant/mon-compte', ico: '👤', label: 'Profil' },
    
  ];

  private readonly sectionLabels: Record<string, string> = {
    'dashboard': 'Tableau de bord',
    'mes-eleves': 'Mes élèves',
    'absences': 'Appel & Absences',
    'demande-conge': 'Demande de congé',
    'mes-conges': 'Mes congés',
    'mes-enseignements': 'Mes enseignements',
    'notes': 'Saisie des notes',
    'evaluations': 'Évaluations',
    'exercices': 'Exercices',
    'mes-cours': 'Cours & Ressources',
    'mes-reunions': 'Réunions',
    'mon-compte': 'Mon compte',
  };

  get sectionLabel(): string {
    const url = this.router.url;
    for (const [key, label] of Object.entries(this.sectionLabels)) {
      if (url.includes('/' + key)) {
        return label;
      }
    }
    return 'Tableau de bord';
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  naviguer(route: string): void {
    this.sidebarOpen.set(false);
    this.router.navigate([route]);
  }

  onToggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onSidebarClose(): void {
    this.sidebarOpen.set(false);
  }
}