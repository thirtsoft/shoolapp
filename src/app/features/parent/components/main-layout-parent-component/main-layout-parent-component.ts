import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { EleveResume } from '../../../../core/models/dossiereleve/eleve/eleve-resume.model';
import { ParentResponse } from '../../../../core/models/parent/parent-eleves-response.model';
import { LocalStorageService } from '../../../../core/services/local-storage.service';

import { ParentSessionService } from '../../service/parent-session.service';

import { SideBarParentComponent } from '../side-bar-parent-component/side-bar-parent-component';

@Component({
  selector: 'app-main-layout-parent-component',
  standalone: true,
  imports: [RouterModule, SideBarParentComponent],
  templateUrl: './main-layout-parent-component.html',
  styleUrl: './main-layout-parent-component.css',
})
export class MainLayoutParentComponent {

  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);
  private readonly sessionService = inject(ParentSessionService);

  sidebarOpen = signal(false);
  eleveDropdownOpen = signal(false);

  readonly listeEleves = this.sessionService.listeEleves;
  readonly eleveActif = this.sessionService.eleveActif;
  readonly parentDetails = this.sessionService.parentDetails;
  readonly parent =
    signal({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      profession: '',
      avatar: '👨‍👩‍👧'
    });

  heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  navMobilesItems = [
    {
      route: '/parent/dashboard',
      ico: '📊',
      label: 'Accueil'
    },
    {
      route: '/parent/notes',
      ico: '📝',
      label: 'Notes'
    },
    {
      route: '/parent/absences',
      ico: '❌',
      label: 'Absences'
    },
    {
      route: '/parent/factures',
      ico: '💰',
      label: 'Factures'
    },
    {
      route: '/parent/monprofil',
      ico: '👤',
      label: 'Profil'
    }
  ];

  constructor() {
    const details = this.sessionService.getParentDetails();
    if (details) {
      this.parent.set({
        nom: details.nom || '',
        prenom: details.prenom || '',
        email: details.email || '',
        telephone: details.telephone || '',
        profession: details.profession || '',
        avatar: this.getParentAvatar(details) || '👨‍👩‍👧'
      });
    }
  }

  getAvatar(eleve: EleveResume): string {
    const prenom = (eleve?.prenom || '').toLowerCase().trim();
    const prenomsFeminins = [
      'fatima',
      'aminata',
      'aïcha',
      'aicha',
      'mariama',
      'khady',
      'ndeye',
      'fatou',
      'aida',
      'aïda',
      'codou',
      'rama',
      'awa',
      'mata',
      'nazi',
      'astou',
      'maimouna',
      'sokhna',
      'coumba',
      'dieynaba',
      'bineta',
      'adja',
      'nabou',
      'yacine',
      'amy',
      'sophie',
      'marie',
      'anna',
      'léa',
      'lea',
      'chloé',
      'chloe',
      'emma',
      'sarah',
      'inès',
      'ines',
      'lina',
      'julie',
      'laura',
      'lucie',
      'clara',
      'manon'

    ];
    return prenomsFeminins.includes(prenom) ? '👧' : '👦';
  }

  toggleEleveDropdown(): void {
    this.eleveDropdownOpen.update(value => !value);
  }

  changerEleve(enfant: EleveResume): void {
    if (enfant.id == null) {
      return;
    }
    this.sessionService.changerEleve(enfant.id, enfant.classeId);
    this.eleveDropdownOpen.set(false);
  }


  isActive(route: string): boolean {
    return this.router.url === route
      || this.router.url.startsWith(route + '/');
  }

  private getParentAvatar(parent: ParentResponse): string {
    const civilite = parent.civility?.toLowerCase().trim() || '';
    if (civilite === 'mme' || civilite === 'madame' || civilite === 'mademoiselle') {
      return '👩‍👧';
    }
    return '👨‍👧';
  }

  naviguer(route: string): void {
    this.sidebarOpen.set(false);
    void this.router.navigate([route]);
  }

  deconnecter(): void {
    this.sessionService.clear();
    this.localStorage.clear();
    void this.router.navigate(['/auth/login/V2']);
  }
}
