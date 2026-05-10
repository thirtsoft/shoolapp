import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarProprietaireComponent } from '../side-bar-proprietaire-component/side-bar-proprietaire-component';

interface NavItem {
  route: string;
  ico: string;
  label: string;
}

@Component({
  selector: 'app-main-layout-proprietaire-compoment',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideBarProprietaireComponent],
  templateUrl: './main-layout-proprietaire-compoment.html',
  styleUrl: './main-layout-proprietaire-compoment.css',
})
export class MainLayoutProprietaireCompoment {


  readonly router = inject(Router);

  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);
  today = new Date();

  professeur = {
    nom: 'M. Sall',
    matiere: 'Mathématiques',
    classes: ['Terminale S2', 'Première S1', 'Seconde S2'],
    avatar: '👨‍🏫'
  };

  readonly todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });


  nav: NavItem[] = [
    { route: '/professeur/dashboard', ico: '📊', label: 'Tableau de bord' },
    { route: '/professeur/classes', ico: '🏫', label: 'Mes classes' },
    { route: '/professeur/notes', ico: '📝', label: 'Saisie des notes' },
    { route: '/professeur/bulletins', ico: '📋', label: 'Bulletins' },
    { route: '/professeur/emploi-temps', ico: '🕐', label: 'Emploi du temps' },
    { route: '/professeur/cours', ico: '📚', label: 'Cours & Ressources' },
    { route: '/professeur/absences', ico: '📌', label: 'Appel & Absences' },
    { route: '/professeur/messagerie', ico: '✉️', label: 'Messagerie' },
  ];

  get sectionLabel(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Tableau de bord';
    if (url.includes('classes')) return 'Mes classes';
    if (url.includes('notes')) return 'Saisie des notes';
    if (url.includes('bulletins')) return 'Bulletins';
    if (url.includes('emploi-temps')) return 'Emploi du temps';
    if (url.includes('cours')) return 'Cours & Ressources';
    if (url.includes('absences')) return 'Appel & Absences';
    if (url.includes('messagerie')) return 'Messagerie';
    return 'Professeur';
  }

  isActive(route: string): boolean {
    const segment = route.split('/').pop() ?? '';
    return this.router.url.includes(segment);
  }

  naviguer(route: string): void {
    this.router.navigate([route]);
  }

  onToggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onSidebarClose(): void {
    this.sidebarOpen.set(false);
  }

}
