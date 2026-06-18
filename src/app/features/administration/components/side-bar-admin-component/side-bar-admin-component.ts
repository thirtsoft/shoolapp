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

  nav: NavItem[] = [
    { route: '/admin/dashboard', ico: '📊', label: 'Tableau de bord', section: '', badge: '' },

    // FINANCES
    { route: '/admin/comptabilite/facture', ico: '💰', label: 'Factures', section: 'FINANCES', badge: '18' },
    { route: '/admin/comptabilite/paiement', ico: '💳', label: 'Frais scolarité', section: '', badge: '' },
    { route: '/admin/comptabilite/services', ico: '📋', label: 'Inscriptions services', section: '', badge: '' },

    // GESTION SCOLAIRE
    { route: '/admin/dossier-eleve/eleves', ico: '🎒', label: 'Élèves', section: 'GESTION SCOLAIRE', badge: '1 200' },
    { route: '/admin/dossier-eleve/inscriptions', ico: '📝', label: 'Inscriptions', section: '', badge: '24' },
    { route: '/admin/dossier-eleve/parent', ico: '👪', label: 'Parents', section: '', badge: '' },
    { route: '/admin/utilisateur/enseignants', ico: '👨‍🏫', label: 'Enseignants' },

    // VIE SCOLAIRE
    { route: '/admin/dossier-eleve/absences', ico: '❌', label: 'Absences', section: 'VIE SCOLAIRE', badge: '7' },
    { route: '/admin/dossier-eleve/evaluations', ico: '🎯', label: 'Évaluations', section: '', badge: '' },
    { route: '/admin/dossier-eleve/notes', ico: '📝', label: 'Notes', section: '', badge: '' },
    { route: '/admin/dossier-eleve/bulletin', ico: '📋', label: 'Bulletins', section: '', badge: '' },
    { route: '/admin/planification/exercice', ico: '📅', label: 'Exercice', section: '', badge: '' },


    // ═══════════ PLANIFICATION ═══════════
    { route: '/admin/planification/emploi-du-temps', ico: '🕐', label: 'Emplois du temps', section: 'PLANIFICATION', badge: '' },
    { route: '/admin/planification/cours', ico: '📖', label: 'Cours', section: '', badge: '' },
    { route: '/admin/planification/enseignement', ico: '👨‍🏫', label: 'Enseignements', section: '', badge: '' },
    { route: '/admin/referentiel/annee-scolaires', ico: '🏫', label: 'Années scolaires' },
    { route: '/admin/referentiel/sessions', ico: '⏱️', label: 'Session Semestres' },



    // COMMUNICATION
    { route: '/admin/planification/reunion', ico: '👥', label: 'Réunions', section: 'COMMUNICATION', badge: '5' },
    { route: '/admin/planification/noteinformations', ico: '📢', label: 'Notes d\'info', section: '' },
    { route: '/admin/planification/evenement', ico: '🎪', label: 'Événements', section: '' },
     { route: '/admin/planification/conges', ico: '🌴', label: 'Congés' },

    // ═══════════ PARAMÉTRAGE DE BASE (DROPDOWN) ═══════════
    {
      ico: '🔧',
      label: 'Paramétrage de base',
      section: 'CONFIGURATION',
      badge: '',
      children: [
        // Structures
        { route: '/admin/referentiel/batiments', ico: '🏗️', label: 'Bâtiments' },
        { route: '/admin/referentiel/salles', ico: '🚪', label: 'Salles' },

        // Pédagogie
        { route: '/admin/referentiel/semestres', ico: '📅', label: 'Semestres' },
        { route: '/admin/referentiel/matieres', ico: '📚', label: 'Matières' },
        { route: '/admin/referentiel/coefficients', ico: '⚖️', label: 'Coefficients' },
        { route: '/admin/referentiel/classes', ico: '🏫', label: 'Classes' },
        { route: '/admin/referentiel/niveau', ico: '📊', label: 'Niveaux' },
        { route: '/admin/referentiel/grades', ico: '🎓', label: 'Niveaux éducation' },

        // Services
        { route: '/admin/referentiel/typeservices', ico: '🛎️', label: 'Types de service' },
        { route: '/admin/referentiel/tarifs', ico: '💲', label: 'Tarifs' },
        { route: '/admin/referentiel/moyenpaiements', ico: '🏦', label: 'Modes de paiement' },
        { route: '/admin/referentiel/menus', ico: '🍽️', label: 'Menus' },
        { route: '/admin/referentiel/category-menu', ico: '📋', label: 'Catégories menu' },

        // Documents
        { route: '/admin/referentiel/type-documents', ico: '📄', label: 'Types de document' },

        // Système
        { route: '/admin/profils', ico: '🔑', label: 'Profils & Rôles', section: '', badge: '' },
        { route: '/admin/utilisateur', ico: '👥', label: 'Utilisateurs' },
        { route: '/admin/referentiel/parametrage', ico: '🔧', label: 'Paramètres établissement' }

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
