import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  id: string;
  route: string;
  label: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-side-bar-professeur-component',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar-professeur-component.html',
  styleUrl: './side-bar-professeur-component.css',
})
export class SideBarProfesseurComponent {
  collapsed = input.required<boolean>();
  open = input.required<boolean>();
  professeur = input<any>({});

  toggleCollapse = output<void>();
  close = output<void>();

  readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { id: 'dashboard', route: '/professeur/dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'classes', route: '/professeur/classes', label: 'Mes classes', icon: '🏫', badge: '3' },
    { id: 'notes', route: '/professeur/notes', label: 'Saisie des notes', icon: '📝', badge: 'À faire' },
    { id: 'bulletins', route: '/professeur/bulletins', label: 'Bulletins', icon: '📋' },
    { id: 'emploi-temps', route: '/professeur/emploi-temps', label: 'Emploi du temps', icon: '🕐' },
    { id: 'cours', route: '/professeur/cours', label: 'Cours & Ressources', icon: '📚' },
    { id: 'absences', route: '/professeur/absences', label: 'Appel & Absences', icon: '📌' },
    { id: 'messagerie', route: '/professeur/messagerie', label: 'Messagerie', icon: '✉️', badge: '3' },
  ];

  nbClasses = 3;
  nbEleves = 120;
  prochainCours = '08:00 - Maths Tle S2';

  deconnecter(): void {
    this.router.navigate(['/auth/login']);
  }

}

