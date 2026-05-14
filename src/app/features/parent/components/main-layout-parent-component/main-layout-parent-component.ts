import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DetailsEleveParent } from '../../../../core/models/dossiereleve/details-eleve-parent';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { ParentSessionService } from '../../service/parent-session.service';
import { ParentService } from '../../service/parent.service';
import { SideBarParentComponent } from '../side-bar-parent-component/side-bar-parent-component';

@Component({
  selector: 'app-main-layout-parent-component',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBarParentComponent],
  templateUrl: './main-layout-parent-component.html',
  styleUrl: './main-layout-parent-component.css',
})
export class MainLayoutParentComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);
  private readonly parentService = inject(ParentService);
  private readonly sessionService = inject(ParentSessionService);

  sidebarOpen = signal(false);
  eleveDropdownOpen = signal(false);

  parentDetails = signal<ParentDetails>({});

  listeEleves = signal<DetailsEleveParent[]>([]);
  eleveActif = signal<DetailsEleveParent | null>(null);

  parent = signal({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    avatar: '👨‍👩‍👧'
  });

  heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  navMobilesItems = [
    { route: '/parent/dashboard', ico: '📊', label: 'Accueil' },
    { route: '/parent/note', ico: '📝', label: 'Notes' },
    { route: '/parent/absence', ico: '❌', label: 'Absences' },
    { route: '/parent/facture', ico: '💰', label: 'Factures' },
    { route: '/parent/monprofil', ico: '👤', label: 'Profil' },
  ];

  ngOnInit() {
    this.chargerParentEtEleves();
  }

  private chargerParentEtEleves() {
    const userId = this.localStorage.getItem('id');
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.parentService.getDetailsParent(Number(userId)).subscribe({
      next: (res) => {
        this.parentDetails.set(res);

        this.parent.set({
          nom: res.nom || '',
          prenom: res.prenom || '',
          email: res.email || '',
          telephone: res.telephone || '',
          profession: res.profession || '',
          avatar: this.getParentAvatar(res)
        });

        const eleves = res?.eleveParentDTOList ?? [];
        this.listeEleves.set(eleves);

        // ✅ Restaurer l'élève actif
        const savedEleveId = this.localStorage.getItem('eleveId');
        let actif: DetailsEleveParent | undefined;

        if (savedEleveId && eleves.length > 0) {
          actif = eleves.find(e => e.id === Number(savedEleveId));
        }

        const eleveChoisi = actif ?? eleves[0] ?? null;
        this.eleveActif.set(eleveChoisi);

        // ✅ Stocker l'ID de l'élève actif
        if (eleveChoisi) {
          this.localStorage.setItem('eleveId', String(eleveChoisi.id ?? ''));
          if (eleveChoisi.classeId) {
            this.localStorage.setItem('classeId', String(eleveChoisi.classeId));
          }
        }
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private getParentAvatar(parent: ParentDetails): string {
    const civilite = parent.civility?.toLowerCase() || '';
    if (civilite === 'mme' || civilite === 'mademoiselle') return '👩‍👧';
    return '👨‍👧';
  }

  getAvatar(eleve: DetailsEleveParent): string {
    const prenom = (eleve?.prenom || '').toLowerCase();
    const prenomsFeminins = [
      'fatima', 'aminata', 'aïcha', 'mariama', 'khady', 'ndeye', 'fatou',
      'aida', 'codou', 'rama', 'awa', 'mata', 'nazi', 'astou', 'maimouna',
      'sokhna', 'coumba', 'dieynaba', 'bineta', 'adja', 'nabou', 'yacine',
      'amy', 'sophie', 'marie', 'anna', 'léa', 'chloé', 'emma', 'sarah',
      'inès', 'lina', 'julie', 'laura', 'lucie', 'clara', 'manon'
    ];
    return prenomsFeminins.includes(prenom) ? '👧' : '👦';
  }

  toggleEleveDropdown() {
    this.eleveDropdownOpen.update(v => !v);
  }

  changerEleve(enfant: DetailsEleveParent) {
    console.log('🔄 changerEleve appelé, ID:', enfant.id);

    if (enfant.id != null) {
      this.sessionService.changerEleve(enfant.id, enfant.classeId);
      console.log('📡 Service notifié');
    }
    this.eleveActif.set(enfant);
    this.eleveDropdownOpen.set(false);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  naviguer(route: string) {
    this.sidebarOpen.set(false);
    this.router.navigate([route]);
  }

  deconnecter(): void {
    this.localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}