import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DetailsEleveParent } from '../../../../core/models/dossiereleve/details-eleve-parent';
import { LocalStorageService } from '../../../../core/services/local-storage.service';


export interface NavItem {
  route?: string;
  ico: string;
  label: string;
  badge?: string;
  section?: string;
  children?: NavItem[];
}
@Component({
  selector: 'app-side-bar-parent-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-parent-component.html',
  styleUrl: './side-bar-parent-component.css',
})
export class SideBarParentComponent {

  readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);

  expandedMenus = signal<Set<string>>(new Set());
  isOpen = input<boolean>(false);

  parent = input<{
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    profession: string;
    avatar: string;
  }>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    avatar: '👨‍👩‍👧'
  });

  eleveActif = input<DetailsEleveParent | null>(null);

  close = output<void>();

  nav: NavItem[] = [
    { route: '/parent/dashboard', ico: '📊', label: 'Tableau de bord', section: '', badge: '' },

    // Suivi quotidien
    { route: '/parent/absences', ico: '❌', label: 'Absences', section: 'Suivi quotidien', badge: '18' },
    { route: '/parent/evaluations', ico: '🎯', label: 'Évaluations', section: '', badge: '' },
    { route: '/parent/notes', ico: '📝', label: 'Notes', section: '', badge: '' },
    { route: '/parent/bulletins', ico: '📋', label: 'Bulletins', section: '', badge: '' },
    { route: '/parent/exercices', ico: '✏️', label: 'Exercice', section: '', badge: '' },

    // FINANCES
    { route: '/parent/factures', ico: '💰', label: 'Factures', section: 'Finances', badge: '18' },
    { route: '/parent/services', ico: '📋', label: 'Inscriptions services', section: '', badge: '' },


    { route: '/parent/emploi-temps', ico: '🕐', label: 'Emploi du temps', section: 'Ressources', badge: '18' },
    { route: '/parent/cours', ico: '📚', label: 'Cours & Ressources', section: '', badge: '' },

    // VIE SCOLAIRE
    { route: '/parent/inscriptions', ico: '📝', label: 'Inscriptions', section: 'Vie scolaire', badge: '7' },
    { route: '/parent/menu-cantine', ico: '🍽️', label: 'Menu cantine', section: '', badge: '' },
    { route: '/parent/evenements', ico: '🎉', label: 'Événements', section: '', badge: '' },


    // COMMUNICATION
    { route: '/parent/informations', ico: '📢', label: 'Informations', section: 'Communication', badge: '5' },

    // ═══════════ PARAMÉTRAGE DE BASE (DROPDOWN) ═══════════
    {
      ico: '🔧',
      label: 'Paramétrage',
      section: 'Configuration',
      badge: '',
      children: [
        // Système
        { route: '/parent/monprofil', ico: '👤', label: 'Mon profil', section: '', badge: '' },
        { route: '/parent/changer-mot-passe', ico: '🔑', label: 'Modifier password' },


      ]
    },
  ];

  getElevePrenom(): string {
    return this.eleveActif()?.prenom ?? '';
  }

  getEleveNom(): string {
    return this.eleveActif()?.nom ?? '';
  }

  getEleveClasse(): string {
    return this.eleveActif()?.classeEleve ?? '';
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

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
    this.localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

}

