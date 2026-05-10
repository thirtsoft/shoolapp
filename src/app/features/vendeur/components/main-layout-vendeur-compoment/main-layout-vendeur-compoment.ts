import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SideBarVendeurComponent } from '../side-bar-vendeur-component/side-bar-vendeur-component';

export type VueParent = 'dashboard' | 'bulletins' | 'emploi-temps' | 'cours' | 'factures' | 'messagerie' | 'parametres';


@Component({
  selector: 'app-main-layout-vendeur-compoment',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBarVendeurComponent],
  templateUrl: './main-layout-vendeur-compoment.html',
  styleUrl: './main-layout-vendeur-compoment.css',
})
export class MainLayoutVendeurCompoment implements OnInit {


  private router = inject(Router);

  sidebarOpen = signal(false);
  vueActive = signal<VueParent>('dashboard');

  // Informations de l'enfant connecté
  eleve = {
    nom: 'Moussa Diop',
    classe: 'Terminale S2',
    moyenne: 14.5,
    absences: 3,
    retards: 2
  };

  heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  navMobilesItems = [
    { id: 'dashboard' as VueParent, ico: '📊', label: 'Accueil' },
    { id: 'bulletins' as VueParent, ico: '📋', label: 'Notes' },
    { id: 'emploi-temps' as VueParent, ico: '🕐', label: 'Emploi' },
    { id: 'factures' as VueParent, ico: '💰', label: 'Factures' },
    { id: 'messagerie' as VueParent, ico: '✉️', label: 'Messages' },
  ];


  ngOnInit() {
    this.updateActiveVueFromUrl(this.router.url);

    this.router.events.subscribe(() => {
      this.updateActiveVueFromUrl(this.router.url);
    });
  }

  private updateActiveVueFromUrl(url: string) {
    if (url.includes('/dashboard')) this.vueActive.set('dashboard');
    else if (url.includes('/bulletins')) this.vueActive.set('bulletins');
    else if (url.includes('/emploi-temps')) this.vueActive.set('emploi-temps');
    else if (url.includes('/cours')) this.vueActive.set('cours');
    else if (url.includes('/factures')) this.vueActive.set('factures');
    else if (url.includes('/messagerie')) this.vueActive.set('messagerie');
    else if (url.includes('/parametres')) this.vueActive.set('parametres');
  }

  naviguer(id: VueParent) {
    this.vueActive.set(id);
    this.sidebarOpen.set(false);
    this.router.navigate([`/parent/${id}`]);
  }

  deconnecter(): void {
    this.router.navigate(['/auth/login']);
  }


}
