import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarSaasManagementComponent } from '../side-bar-saas-management-component/side-bar-saas-management-component';
import { NavItem } from '../../../../core/components/sidebar-navbar-models/nav-item.model';

// interface NavItem {
//   route: string;
//   ico: string;
//   label: string;
//   badge?: string;
// }


@Component({
  selector: 'app-main-layout-saas-management-component',
  standalone: true,
  imports: [RouterOutlet, SideBarSaasManagementComponent],
  templateUrl: './main-layout-saas-management-component.html',
  styleUrl: './main-layout-saas-management-component.css',
})
export class MainLayoutSaasManagementComponent {

  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);

  readonly router = inject(Router);

  nav: NavItem[] = [
    { route: '/saas-management/dashboard', ico: '📊', label: 'Tableau de bord' },
    { route: '/saas-management/onboardings', ico: '🎒', label: 'Onboarding', badge: '1 200' },
    { route: '/saas-management/tenants', ico: '📝', label: 'Clients' },
    { route: '/saas-management/organizations', ico: '👪', label: 'Organizations' },
    { route: '/saas-management/setup', ico: '🏫', label: 'Setup' },
    { route: '/saas-management/users-management', ico: '👨‍🏫', label: 'Utilisateurs', badge: '85' },
/*     { route: '/saas-management/bulletins', ico: '📋', label: 'Bulletins' },
    { route: '/saas-management/emplois-temps', ico: '🕐', label: 'Emplois du temps' },
    { route: '/saas-management/factures', ico: '💰', label: 'Factures' },
    { route: '/saas-management/comptabilite', ico: '💼', label: 'Comptabilité' },
    { route: '/saas-management/messagerie', ico: '✉️', label: 'Messagerie' }, */
    { route: '/saas-management/parametrage', ico: '⚙️', label: 'Paramètrages' },
  ];

  //

  dateAuj = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  get sectionLabel(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Tableau de bord';
    if (url.includes('onboardings')) return 'Onboarding';
    if (url.includes('tenants')) return 'Clients';
    if (url.includes('organizations')) return 'Organizations';
    if (url.includes('setup')) return 'Setup';
    if (url.includes('users-management')) return 'Utilisateurs';
/*     if (url.includes('bulletins')) return 'Bulletins';
    if (url.includes('emplois-temps')) return 'Emplois du temps';
    if (url.includes('factures')) return 'Factures';
    if (url.includes('comptabilite')) return 'Comptabilité';
    if (url.includes('messagerie')) return 'Messagerie'; */
    if (url.includes('parametrage')) return 'Paramètrages';
    return 'Administration';
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
