import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DetailsEleveParent } from '../../../../core/models/dossiereleve/details-eleve-parent';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { NavItem } from '../../../enseignant/component/side-bar-professeur-component/side-bar-professeur-component';

@Component({
  selector: 'app-side-bar-parent-component',
  standalone: true,
  imports: [],
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

    { route: '/parent/cours', ico: '🕐', label: ' Emploi du temps', section: '🎓 Suivi scolaire' },
    { route: '/parent/absences', ico: '❌', label: 'Absences', section: '', badge: '' },
    { route: '/parent/evaluations', ico: '🎯', label: 'Évaluations', section: '', badge: '' },
    { route: '/parent/notes', ico: '📝', label: 'Notes', section: '', badge: '' },
    { route: '/parent/bulletins', ico: '📋', label: 'Bulletins', section: '', badge: '' },
    { route: '/parent/exercices', ico: '✏️', label: 'Exercices', section: '', badge: '' },
    //    { route: '/parent/cours', ico: '📚', label: 'Cours & Ressources', section: '', badge: '' },

    { route: '/parent/factures', ico: '💰', label: 'Factures', section: '💳 Finances & services', badge: '' },
     { route: '/parent/tarifs-services', ico: '📋', label: 'Services scolaires', section: '', badge: '' },
   // { route: '/parent/services', ico: '📋', label: 'Services scolaires', section: '', badge: '' },

    { route: '/parent/inscriptions', ico: '📝', label: 'Inscriptions', section: '🏫 Vie scolaire', badge: '' },
  //  { route: '/parent/menu-cantine', ico: '🍽️', label: 'Menu cantine', section: '', badge: '' },
    { route: '/parent/activites-scolaire', ico: '🎉', label: 'Événements', section: '', badge: '' },

    { route: '/parent/informations', ico: '📢', label: 'Informations', section: '💬 Communication', badge: '' },
    { route: '/parent/messages', ico: '✉️', label: 'Messages', section: '', badge: '' },

    { route: '/parent/monprofil', ico: '👤', label: 'Mon profil', section: '⚙️ Mon compte', badge: '' },
    { route: '/parent/changer-mot-passe', ico: '🔑', label: 'Modifier le mot de passe' },

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
    this.router.navigate(['/auth/']);
  }

}

