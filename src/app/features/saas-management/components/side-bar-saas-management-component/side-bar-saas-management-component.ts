import { Component, inject, input, output, signal } from '@angular/core';
import { NavItemChildren } from '../../../../core/components/sidebar-navbar-models/nav-item-children.model';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service';

@Component({
  selector: 'app-side-bar-saas-management-component',
  standalone: true,
  imports: [],
  templateUrl: './side-bar-saas-management-component.html',
  styleUrl: './side-bar-saas-management-component.css',
})
export class SideBarSaasManagementComponent {

  collapsed = input<boolean>(false);
  open = input<boolean>(false);

  toggleCollapse = output<void>();
  close = output<void>();

  readonly router = inject(Router);
  readonly localStorage = inject(LocalStorageService);

  expandedMenus = signal<Set<string>>(new Set());

  nav: NavItemChildren[] = [
    { route: '/saas-management/dashboard', ico: '📊', label: 'Tableau de bord', section: '', badge: '' },

    // ONBOARDING
    { route: '/saas-management/onboarding/tenant', ico: '💰', label: 'Tenants', section: 'ONBOARDING', badge: '18' },
    { route: '/saas-management/onboarding/process', ico: '💳', label: 'Onboarding process', section: '', badge: '' },

    // FINANCES
    /*
    { route: '/saas-management/comptabilite/facture', ico: '💰', label: 'Factures', section: 'FINANCES', badge: '18' },
    { route: '/saas-management/comptabilite/paiement', ico: '💳', label: 'Frais scolarité', section: '', badge: '' },
    { route: '/saas-management/comptabilite/services', ico: '📋', label: 'Inscriptions services', section: '', badge: '' },
    { route: '/saas-management/comptabilite/depenses', ico: '💸', label: 'Dépenses', section: '', badge: '' },*/

    // GESTION SCOLAIRE
    { route: '/saas-management/organizations', ico: '🎒', label: 'Organizations', section: 'ORGANIZATION', badge: '1 200' },
    { route: '/saas-management/setup', ico: '📝', label: 'Initialisations', section: '', badge: '24' },
    { route: '/saas-management/users-management', ico: '👪', label: 'Utilisateurs', section: '', badge: '' },
  //  { route: '/saas-management/utilisateur/enseignants', ico: '👨‍🏫', label: 'Enseignants' },

    // VIE SCOLAIRE
    /*
    { route: '/saas-management/dossier-eleve/absences', ico: '❌', label: 'Absences', section: 'VIE SCOLAIRE', badge: '7' },
    { route: '/saas-management/dossier-eleve/evaluations', ico: '🎯', label: 'Évaluations', section: '', badge: '' },
    { route: '/saas-management/dossier-eleve/notes', ico: '📝', label: 'Notes', section: '', badge: '' },
    { route: '/saas-management/dossier-eleve/bulletin', ico: '📋', label: 'Bulletins', section: '', badge: '' },
    { route: '/saas-management/planification/exercice', ico: '📅', label: 'Exercice', section: '', badge: '' },

    */

    //
    // ═══════════ PLANIFICATION ═══════════
    /*
    { route: '/admin/planification/emploi-du-temps', ico: '🕐', label: 'Emplois du temps', section: 'PLANIFICATION', badge: '' },
    { route: '/admin/planification/cours', ico: '📖', label: 'Cours', section: '', badge: '' },
    { route: '/admin/planification/enseignement', ico: '👨‍🏫', label: 'Enseignements', section: '', badge: '' },
    { route: '/admin/referentiel/annee-scolaires', ico: '🏫', label: 'Années scolaires' },
    { route: '/admin/referentiel/sessions', ico: '⏱️', label: 'Session Semestres' },
    { route: '/admin/planification/cantine', ico: '🍽️', label: 'MenusPlats' },



    // COMMUNICATION
    { route: '/admin/planification/reunion', ico: '👥', label: 'Réunions', section: 'COMMUNICATION', badge: '5' },
    { route: '/admin/planification/noteinformations', ico: '📢', label: 'Notes d\'info', section: '' },
    { route: '/admin/planification/evenement', ico: '🎪', label: 'Événements', section: '' },
    { route: '/admin/planification/conges', ico: '🌴', label: 'Congés' },*/

    // ═══════════ PARAMÉTRAGE DE BASE (DROPDOWN) ═══════════
    {
      ico: '🔧',
      label: 'Paramétrage de base',
      section: 'CONFIGURATION',
      badge: '',
      children: [
        // Structures
        { route: '/saas-management/parametrage/pays', ico: '🏗️', label: 'Pays' },
        { route: '/saas-management/parametrage/regions', ico: '🚪', label: 'Regions' },
          { route: '/saas-management/parametrage/departments', ico: '🚪', label: 'Departments' },

        // Pédagogie
        { route: '/saas-management/parametrage/languages', ico: '📅', label: 'Languages' },
   /*      { route: '/saas-management/parametrage/matieres', ico: '📚', label: 'Matières' },
        { route: '/saas-management/parametrage/coefficients', ico: '⚖️', label: 'Coefficients' },
        { route: '/saas-management/parametrage/classes', ico: '🏫', label: 'Classes' },
        { route: '/saas-management/parametrage/niveau', ico: '📊', label: 'Niveaux' },
        { route: '/saas-management/parametrage/grades', ico: '🎓', label: 'Niveaux éducation' }, */

        // Services
        { route: '/saas-management/parametrage/plans', ico: '🛎️', label: 'Plans' },
        { route: '/saas-management/parametrage/tarifs', ico: '💲', label: 'Tarifs' },
        { route: '/saas-management/parametrage/currencies', ico: '🏦', label: 'Devises' },
/*         { route: '/saas-management/parametrage/typedepense', ico: '💲', label: 'Type dépense' },
        { route: '/saas-management/parametrage/menus', ico: '🍽️', label: 'Menus' },
        { route: '/saas-management/parametrage/category-menu', ico: '📋', label: 'Catégories menu' }, */

        // Système
        { route: '/saas-management/profils', ico: '🔑', label: 'Profils & Rôles', section: '', badge: '' },
        { route: '/saas-management/utilisateur', ico: '👥', label: 'Utilisateurs' },
        { route: '/saas-management/parametrage/parametrage', ico: '🔧', label: 'Paramètres établissement' }

      ]
    },
  ];

  hasChildren(item: NavItemChildren): boolean {
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

  isParentActive(item: NavItemChildren): boolean {
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
    this.localStorage.clear();
    this.router.navigate(['/']);

  }
}
