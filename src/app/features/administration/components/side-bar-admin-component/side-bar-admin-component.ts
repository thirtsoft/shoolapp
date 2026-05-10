import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  route?: string;
  ico: string;
  label: string;
  badge?: string;
  section?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-side-bar-admin-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-admin-component.html',
  styleUrl: './side-bar-admin-component.css',
})
export class SideBarAdminComponent {

  collapsed = input<boolean>(false);
  open = input<boolean>(false);

  toggleCollapse = output<void>();
  close = output<void>();

  readonly router = inject(Router);

  expandedMenus = signal<Set<string>>(new Set());

  /*
  nav: NavItem[] = [
    { route: '/admin/dashboard', ico: '📊', label: 'Tableau de bord', section: '', badge: '' },
    { route: '/admin/dossier-eleve/eleves', ico: '🎒', label: 'Élèves', section: '', badge: '1 200' },
    { route: '/admin/dossier-eleve/inscriptions', ico: '📝', label: 'Inscriptions', section: '', badge: '24' },
    { route: '/admin/dossier-eleve/parents', ico: '👪', label: 'Parents', section: '', badge: '' },
    { route: '/admin/dossier-eleve/classes', ico: '🏫', label: 'Classes', section: '', badge: '32' },
    { route: '/admin/dossier-eleve/enseignants', ico: '👨‍🏫', label: 'Enseignants', section: '', badge: '85' },

    // VIE SCOLAIRE
    { route: '/admin/dossier-eleve/bulletins', ico: '📋', label: 'Bulletins', section: 'VIE SCOLAIRE', badge: '' },
    { route: '/admin/emplois-temps', ico: '🕐', label: 'Emplois du temps', section: '', badge: '' },
    { route: '/admin/discipline', ico: '⚠️', label: 'Discipline', section: '', badge: '' },

    // FINANCES
    { route: '/admin/factures', ico: '💰', label: 'Factures', section: 'FINANCES', badge: '18' },
    { route: '/admin/comptabilite', ico: '💼', label: 'Comptabilité', section: '', badge: '' },
    { route: '/admin/bourses', ico: '🎓', label: 'Bourses', section: '', badge: '' },

    // COMMUNICATION
    { route: '/admin/messagerie', ico: '✉️', label: 'Messagerie', section: 'COMMUNICATION', badge: '5' },
    { route: '/admin/evenements', ico: '📅', label: 'Événements', section: '', badge: '' },

    // SYSTÈME
    { route: '/admin/utilisateurs', ico: '👥', label: 'Utilisateurs', section: 'SYSTÈME', badge: '' },
    { route: '/admin/profils', ico: '🔑', label: 'Profils & Rôles', section: '', badge: '' },
    { route: '/admin/parametres', ico: '⚙️', label: 'Paramètres', section: '', badge: '' },
  ]; */

  nav: NavItem[] = [
    { route: '/admin/dashboard', ico: '📊', label: 'Tableau de bord', section: '', badge: '' },
    { route: '/admin/dossier-eleve/eleves', ico: '🎒', label: 'Élèves', section: 'GESTION SCOLAIRE', badge: '1 200' },
    { route: '/admin/dossier-eleve/inscriptions', ico: '📝', label: 'Inscriptions', section: '', badge: '24' },
    { route: '/admin/dossier-eleve/parents', ico: '👪', label: 'Parents', section: '', badge: '' },
    { route: '/admin/dossier-eleve/classes', ico: '🏫', label: 'Classes', section: '', badge: '32' },
    { route: '/admin/dossier-eleve/enseignants', ico: '👨‍🏫', label: 'Enseignants', section: '', badge: '85' },

    // VIE SCOLAIRE
    { route: '/admin/dossier-eleve/bulletins', ico: '📋', label: 'Bulletins', section: 'VIE SCOLAIRE', badge: '' },
    { route: '/admin/emplois-temps', ico: '🕐', label: 'Emplois du temps', section: '', badge: '' },
    { route: '/admin/discipline', ico: '⚠️', label: 'Discipline', section: '', badge: '' },

    // FINANCES
    { route: '/admin/factures', ico: '💰', label: 'Factures', section: 'FINANCES', badge: '18' },
    { route: '/admin/comptabilite', ico: '💼', label: 'Comptabilité', section: '', badge: '' },
    { route: '/admin/bourses', ico: '🎓', label: 'Bourses', section: '', badge: '' },

    // COMMUNICATION
    { route: '/admin/messagerie', ico: '✉️', label: 'Messagerie', section: 'COMMUNICATION', badge: '5' },
    { route: '/admin/evenements', ico: '📅', label: 'Événements', section: '', badge: '' },

    // SYSTÈME
    { route: '/admin/utilisateurs', ico: '👥', label: 'Utilisateurs', section: 'SYSTÈME', badge: '' },
    { route: '/admin/profils', ico: '🔑', label: 'Profils & Rôles', section: '', badge: '' },
    { route: '/admin/parametres', ico: '⚙️', label: 'Paramètres', section: '', badge: '' },

    // ═══════════ PARAMÉTRAGE DE BASE (DROPDOWN) ═══════════
    {
      ico: '🔧',
      label: 'Paramétrage de base',
      section: 'CONFIGURATION',
      badge: '',
      children: [
        { route: '/admin/parametrage/salles', ico: '🚪', label: 'Salles' },
        { route: '/admin/parametrage/batiments', ico: '🏗️', label: 'Bâtiments' },
        { route: '/admin/parametrage/annees-scolaires', ico: '📅', label: 'Années scolaires' },
        { route: '/admin/parametrage/matieres', ico: '📚', label: 'Matières' },
        { route: '/admin/parametrage/menus', ico: '🍽️', label: 'Menus' },
        { route: '/admin/parametrage/types-services', ico: '🛎️', label: 'Types de service' },
        { route: '/admin/parametrage/uniformes', ico: '👔', label: 'Uniformes' },
        { route: '/admin/parametrage/transports', ico: '🚌', label: 'Transports' },
      ]
    },
  ];

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
    const segment = route.split('/').pop() ?? '';
    return this.router.url.includes(segment);
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

  hasSectionBefore(index: number): boolean {
    return index === 0 || !!this.nav[index].section;
  }

  deconnecter(): void {
    this.router.navigate(['/auth/login']);
  }
}
