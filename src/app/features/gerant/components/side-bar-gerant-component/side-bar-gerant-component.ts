import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  route: string;
  ico: string;
  label: string;
  badge?: string;
  section?: string;
}

@Component({
  selector: 'app-side-bar-gerant-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-gerant-component.html',
  styleUrl: './side-bar-gerant-component.css',
})
export class SideBarGerantComponent {

  collapsed = input<boolean>(false);
  open = input<boolean>(false);

  toggleCollapse = output<void>();
  close = output<void>();

  readonly router = inject(Router);

  nav: NavItem[] = [
    // GESTION SCOLAIRE
    { route: '/administration/dashboard', ico: '📊', label: 'Tableau de bord', section: 'GESTION SCOLAIRE', badge: '' },
    { route: '/administration/eleves', ico: '🎒', label: 'Élèves', section: '', badge: '1 200' },
    { route: '/administration/inscriptions', ico: '📝', label: 'Inscriptions', section: '', badge: '24' },
    { route: '/administration/parents', ico: '👪', label: 'Parents', section: '', badge: '' },
    { route: '/administration/classes', ico: '🏫', label: 'Classes', section: '', badge: '32' },
    { route: '/administration/enseignants', ico: '👨‍🏫', label: 'Enseignants', section: '', badge: '85' },

    // VIE SCOLAIRE
    { route: '/administration/bulletins', ico: '📋', label: 'Bulletins', section: 'VIE SCOLAIRE', badge: '' },
    { route: '/administration/emplois-temps', ico: '🕐', label: 'Emplois du temps', section: '', badge: '' },
    { route: '/administration/discipline', ico: '⚠️', label: 'Discipline', section: '', badge: '' },

    // FINANCES
    { route: '/administration/factures', ico: '💰', label: 'Factures', section: 'FINANCES', badge: '18' },
    { route: '/administration/comptabilite', ico: '💼', label: 'Comptabilité', section: '', badge: '' },
    { route: '/administration/bourses', ico: '🎓', label: 'Bourses', section: '', badge: '' },

    // COMMUNICATION
    { route: '/administration/messagerie', ico: '✉️', label: 'Messagerie', section: 'COMMUNICATION', badge: '5' },
    { route: '/administration/evenements', ico: '📅', label: 'Événements', section: '', badge: '' },

    // SYSTÈME
    { route: '/administration/utilisateurs', ico: '👥', label: 'Utilisateurs', section: 'SYSTÈME', badge: '' },
    { route: '/administration/profils', ico: '🔑', label: 'Profils & Rôles', section: '', badge: '' },
    { route: '/administration/parametres', ico: '⚙️', label: 'Paramètres', section: '', badge: '' },
  ];

  isActive(route: string): boolean {
    const segment = route.split('/').pop() ?? '';
    return this.router.url.includes(segment);
  }

  naviguer(route: string): void {
    this.router.navigate([route]);
    this.close.emit();
  }

  hasSectionBefore(index: number): boolean {
    return index === 0 || !!this.nav[index].section;
  }

  deconnecter(): void {
    this.router.navigate(['/auth/login']);
  }

}