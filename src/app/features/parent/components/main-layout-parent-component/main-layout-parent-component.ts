import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { EleveResume } from '../../../../core/models/dossiereleve/eleve/eleve-resume.model';
import { ParentElevesResponse } from '../../../../core/models/parent/parent-eleves-response.model';
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

  parentDetails = signal<ParentElevesResponse>({ eleves: [] });

  listeEleves = signal<EleveResume[]>([]);
  eleveActif = signal<EleveResume | null>(null);

  parent = signal({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    avatar: '👨‍👩‍👧'
  });

  heure = new Date().toLocaleTimeString(
    'fr-FR',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  navMobilesItems = [
    { route: '/parent/dashboard', ico: '📊', label: 'Accueil' },
    { route: '/parent/note', ico: '📝', label: 'Notes' },
    { route: '/parent/absence', ico: '❌', label: 'Absences' },
    { route: '/parent/facture', ico: '💰', label: 'Factures' },
    { route: '/parent/monprofil', ico: '👤', label: 'Profil' },
  ];

  ngOnInit(): void {
    this.chargerParentEtEleves();
  }

  private chargerParentEtEleves(): void {
    this.parentService.getMesElevest().subscribe({
      next: (res) => {

        this.parentDetails.set(res);

        this.parent.set({
          nom: res.nom || '',
          prenom: res.prenom || '',
          email: res.email || '',
          telephone: res.telephone || '',
          profession: res.profession || '',
          avatar: this.getParentAvatar(res) || '👨‍👩‍👧'
        });

        const eleves = res?.eleves ?? [];

        this.listeEleves.set(eleves);

        const savedEleveId = this.localStorage.getItem('eleveId');

        let eleveActif: EleveResume | undefined;

        if (savedEleveId && eleves.length > 0) {
          eleveActif = eleves.find(eleve => eleve.id === Number(savedEleveId));
        }

        const eleveChoisi = eleveActif ?? eleves[0] ?? null;

        this.eleveActif.set(eleveChoisi);


        if (eleveChoisi?.id != null) {
          this.localStorage.setItem('eleveId', String(eleveChoisi.id));
        }

        if (eleveChoisi?.classeId != null) {
          this.localStorage.setItem('classeId', String(eleveChoisi.classeId));
        }

      },

      error: (error) => {

        console.error(
          '❌ Impossible de récupérer le parent et ses élèves',
          error
        );

      }
    });
  }

  getAvatar(eleve: EleveResume): string {

    const prenom = (eleve?.prenom || '').toLowerCase();

    const prenomsFeminins = [
      'fatima', 'aminata', 'aïcha', 'mariama', 'khady', 'ndeye', 'fatou',
      'aida', 'codou', 'rama', 'awa', 'mata', 'nazi', 'astou', 'maimouna',
      'sokhna', 'coumba', 'dieynaba', 'bineta', 'adja', 'nabou', 'yacine',
      'amy', 'sophie', 'marie', 'anna', 'léa', 'chloé', 'emma', 'sarah',
      'inès', 'lina', 'julie', 'laura', 'lucie', 'clara', 'manon'
    ];

    return prenomsFeminins.includes(prenom)
      ? '👧'
      : '👦';
  }

  toggleEleveDropdown(): void {
    this.eleveDropdownOpen.update(v => !v);
  }

  changerEleve(enfant: EleveResume): void {

    if (enfant.id != null) {

      this.localStorage.setItem('eleveId', String(enfant.id));

      if (enfant.classeId != null) {
        this.localStorage.setItem('classeId', String(enfant.classeId));
      }

      this.sessionService.changerEleve(enfant.id, enfant.classeId);
    }

    this.eleveActif.set(enfant);
    this.eleveDropdownOpen.set(false);
  }

  isActive(route: string): boolean {
    return this.router.url === route
      || this.router.url.startsWith(route + '/');
  }

  private getParentAvatar(parent: ParentElevesResponse): string {
    const civilite = parent.civility?.toLowerCase() || '';
    if (civilite === 'mme' || civilite === 'mademoiselle') return '👩‍👧';
    return '👨‍👧';
  }

  naviguer(route: string): void {
    this.sidebarOpen.set(false);
    this.router.navigate([route]);
  }

  deconnecter(): void {
    this.localStorage.clear();
    this.router.navigate(['/auth/login/V2']);
  }


  /*

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
  */
}