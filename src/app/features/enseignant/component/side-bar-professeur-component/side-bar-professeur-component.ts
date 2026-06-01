import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface NavItem {
  route?: string;
  ico: string;
  label: string;
  badge?: string;
  section?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-side-bar-professeur-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-professeur-component.html',
  styleUrl: './side-bar-professeur-component.css',
})
export class SideBarProfesseurComponent {

  expandedMenus = signal<Set<string>>(new Set());
  isOpen = input<boolean>(false);

  collapsed = input.required<boolean>();
  open = input.required<boolean>();
  toggleCollapse = output<void>();
  close = output<void>();

  readonly router = inject(Router);

  /*
  nav: NavItem[] = [
    // ═══════════ ACCUEIL ═══════════
    { route: '/enseignant/dashboard', ico: '📊', label: 'Tableau de bord' },

    // ═══════════ MES CLASSES (prof principal) ═══════════
    { route: '/enseignant/mes-eleves', ico: '👨‍🎓', label: 'Mes élèves', section: 'MES CLASSES' },
    { route: '/enseignant/absences', ico: '✅', label: 'Appel & Absences', badge: '' },

    // ═══════════ MES ENSEIGNEMENTS ═══════════
    { route: '/enseignant/mes-enseignements', ico: '📚', label: 'Mes enseignements', section: 'ENSEIGNEMENTS' },
    { route: '/enseignant/notes', ico: '📝', label: 'Saisie des notes', badge: '' },
    { route: '/enseignant/evaluations', ico: '🎯', label: 'Évaluations' },
    { route: '/enseignant/mes-cours', ico: '📖', label: 'Cours & Ressources' },
    { route: '/enseignant/exercices', ico: '✏️', label: 'Exercices' },

    // ═══════════ VIE SCOLAIRE ═══════════
    { route: '/enseignant/mes-reunions', ico: '👥', label: 'Réunions', section: 'VIE SCOLAIRE' },
    { route: '/enseignant/demande-conge', ico: '📋', label: 'Demande de congé' },
    { route: '/enseignant/mes-conges', ico: '📅', label: 'Mes congés' },

    // ═══════════ COMPTE ═══════════
    {
      ico: '⚙️',
      label: 'Paramètres',
      section: 'COMPTE',
      children: [
        { route: '/enseignant/mon-compte', ico: '👤', label: 'Mon compte' },
      ]
    },
  ];*/

  nav: NavItem[] = [
    { route: '/enseignant/dashboard', ico: '📊', label: 'Tableau de bord' },
    { route: '/enseignant/agenda', ico: '📅', label: 'Mon agenda', section: 'QUOTIDIEN' },

    // enseignements & classes
    { route: '/enseignant/mes-classes', ico: '🏫', label: 'Mes classes', section: 'CLASSES et ENSEIGNEMENTS' },
    { route: '/enseignant/mes-enseignements', ico: '📖', label: 'Mes enseignements' },
    { route: '/enseignant/notes', ico: '📝', label: 'Notes' },
    { route: '/enseignant/absences', ico: '✅', label: 'Appel' },

    // vie scolaire
    { route: '/enseignant/mes-reunions', ico: '🗓️', label: 'Réunions', section: 'VIE SCOLAIRE' },
    { route: '/enseignant/mes-conges', ico: '🌴', label: 'Mes congés' },

    // compte
    { route: '/enseignant/mon-compte', ico: '👤', label: 'Mon compte', section: 'COMPTE', },
  ];

  nbClasses = 3;
  nbEleves = 120;
  prochainCours = '08:00 - Maths Tle S2';

  hasChildren(item: NavItem): boolean {
    return !!item.children && item.children.length > 0;
  }

  toggleDropdown(label: string): void {
    this.expandedMenus.update(menus => {
      const newMenus = new Set(menus);
      if (newMenus.has(label)) {
        newMenus.delete(label);
      } else {
        newMenus.add(label);
      }
      return newMenus;
    });
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  isParentActive(item: NavItem): boolean {
    if (item.route && this.isActive(item.route)) return true;
    if (item.children) {
      return item.children.some(child => child.route && this.isActive(child.route));
    }
    return false;
  }

  naviguer(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
      this.close.emit();
    }
  }

  deconnecter(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

}

