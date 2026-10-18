import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { EnseignementContextService } from '../../service/enseignement-contexte.service';

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
  private readonly context = inject(EnseignementContextService);
  readonly localStorage = inject(LocalStorageService);

  nbClasses = 3;
  nbEleves = 120;

  nav: NavItem[] = [
    { route: '/enseignant/dashboard', ico: '📊', label: 'Tableau de bord' },
    { route: '/enseignant/agenda', ico: '📖', label: 'Mes classes', section: 'QUOTIDIEN' },

    //
    { route: '/enseignant/contrats', ico: '📄', label: 'Contrats', section: 'FINANCES' },
    { route: '/enseignant/paies', ico: '💵', label: 'Paie' },
    { route: '/enseignant/bon-salaires', ico: '💰', label: 'Bon salaire' },


    // vie scolaire
    { route: '/enseignant/activites', ico: '🗓️', label: 'Activités & Réunions', section: 'VIE SCOLAIRE' },
    { route: '/enseignant/mes-conges', ico: '🌴', label: 'Mes congés' },

    // compte
    { route: '/enseignant/mon-compte', ico: '👤', label: 'Mon compte', section: 'COMPTE', },
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
      void this.router.navigate([route]);
      this.close.emit();
    }
  }

  deconnecter(): void {
    localStorage.clear();
    localStorage.removeItem('v2_user');
    localStorage.removeItem('v2_token');
    this.context.clearGestionClasseContext();
    void this.router.navigate(['/auth/login/v2']);
  }

}

