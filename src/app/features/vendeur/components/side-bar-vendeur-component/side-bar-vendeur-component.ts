import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

export type VueParent = 'dashboard' | 'bulletins' | 'emploi-temps' | 'cours' | 'factures' | 'messagerie' | 'parametres';

export interface NavItem {
  id: VueParent;
  ico: string;
  label: string;
  badge?: number;
}

@Component({
  selector: 'app-side-bar-vendeur-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-vendeur-component.html',
  styleUrl: './side-bar-vendeur-component.css',
})
export class SideBarVendeurComponent {

  readonly router = inject(Router);

  isOpen = input<boolean>(false);
  vueActive = input<VueParent>('dashboard');

  navItems = input<NavItem[]>([
    { id: 'dashboard', ico: '📊', label: 'Tableau de bord' },
    { id: 'bulletins', ico: '📋', label: 'Bulletins de notes' },
    { id: 'emploi-temps', ico: '🕐', label: 'Emploi du temps' },
    { id: 'cours', ico: '📚', label: 'Cours & Ressources' },
    { id: 'factures', ico: '💰', label: 'Factures', badge: 2 },
    { id: 'messagerie', ico: '✉️', label: 'Messagerie', badge: 3 },
    { id: 'parametres', ico: '⚙️', label: 'Paramètres' },
  ]);

  eleve = input<{
    nom: string;
    classe: string;
    moyenne: number;
    absences: number;
    retards: number;
  }>({
    nom: 'Moussa Diop',
    classe: 'Terminale S2',
    moyenne: 14.5,
    absences: 3,
    retards: 2
  });

  close = output<void>();
  navigate = output<VueParent>();

  deconnecter(): void {
    this.router.navigate(['/auth/login']);
  }

}
