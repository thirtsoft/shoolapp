import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarAdminComponent } from '../side-bar-admin-component/side-bar-admin-component';

interface NavItem {
  route: string;
  ico: string;
  label: string;
  badge?: string;
}

@Component({
  selector: 'app-main-layout-admin-component',
   standalone: true,
   imports: [CommonModule, RouterOutlet, SideBarAdminComponent],
  templateUrl: './main-layout-admin-component.html',
  styleUrl: './main-layout-admin-component.css',
})
export class MainLayoutAdminComponent {

  
    sidebarCollapsed = signal(false);
    sidebarOpen = signal(false);
  
    readonly router = inject(Router);
  
    nav: NavItem[] = [
      { route: '/admin/dashboard', ico: '📊', label: 'Tableau de bord' },
      { route: '/admin/eleves', ico: '🎒', label: 'Élèves', badge: '1 200' },
      { route: '/admin/inscriptions', ico: '📝', label: 'Inscriptions' },
      { route: '/admin/parents', ico: '👪', label: 'Parents' },
      { route: '/admin/classes', ico: '🏫', label: 'Classes' },
      { route: '/admin/enseignants', ico: '👨‍🏫', label: 'Enseignants', badge: '85' },
      { route: '/admin/bulletins', ico: '📋', label: 'Bulletins' },
      { route: '/admin/emplois-temps', ico: '🕐', label: 'Emplois du temps' },
      { route: '/admin/factures', ico: '💰', label: 'Factures' },
      { route: '/admin/comptabilite', ico: '💼', label: 'Comptabilité' },
      { route: '/admin/messagerie', ico: '✉️', label: 'Messagerie' },
      { route: '/admin/parametres', ico: '⚙️', label: 'Paramètres' },
    ];
  
  
    dateAuj = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  
    get sectionLabel(): string {
      const url = this.router.url;
      if (url.includes('dashboard')) return 'Tableau de bord';
      if (url.includes('eleves')) return 'Élèves';
      if (url.includes('inscriptions')) return 'Inscriptions';
      if (url.includes('parents')) return 'Parents';
      if (url.includes('classes')) return 'Classes';
      if (url.includes('enseignants')) return 'Enseignants';
      if (url.includes('bulletins')) return 'Bulletins';
      if (url.includes('emplois-temps')) return 'Emplois du temps';
      if (url.includes('factures')) return 'Factures';
      if (url.includes('comptabilite')) return 'Comptabilité';
      if (url.includes('messagerie')) return 'Messagerie';
      if (url.includes('parametres')) return 'Paramètres';
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
  
  
  
  
