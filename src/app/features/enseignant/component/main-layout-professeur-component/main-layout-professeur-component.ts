import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { EnseignementContextService } from '../../service/enseignement-contexte.service';
import { SideBarProfesseurComponent } from '../side-bar-professeur-component/side-bar-professeur-component';

interface NavItem {
  route: string;
  ico: string;
  label: string;
}

@Component({
  selector: 'app-main-layout-professeur-component',
  standalone: true,
  imports: [RouterOutlet, SideBarProfesseurComponent],
  templateUrl: './main-layout-professeur-component.html',
  styleUrl: './main-layout-professeur-component.css',
})
export class MainLayoutProfesseurComponent implements OnInit {

  readonly router = inject(Router);
  readonly localStorage = inject(LocalStorageService);
  private readonly context = inject(EnseignementContextService);

  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);
  userId?: number;

  dropdownOpen = signal(false);

  userFirstName: string = '';
  userLastName: string = '';
  userInitial: string = '';
  userFullName: string = '';
  userMobile: string = '';


  readonly todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  nav: NavItem[] = [
    { route: '/enseignant/dashboard', ico: '📊', label: 'Accueil' },
    { route: '/enseignant/contrats', ico: '📄', label: 'Contrat' },
    { route: '/enseignant/paies', ico: '💵', label: 'Paie' },
    { route: '/enseignant/activites', ico: '🗓️', label: 'Activités' },
    { route: '/enseignant/mon-compte', ico: '👤', label: 'Profil' },

  ];

  private readonly sectionLabels: Record<string, string> = {
    'dashboard': 'Tableau de bord',
    'contrats': 'Contrat',
    'paies': 'Paie',
    'activites': 'Activités',
    'mon-compte': 'Mon compte',
  };

  dropdownItems = [
    {
      icon: '👤',
      label: 'Profil',
      action: 'profile',
      description: 'Voir mes informations'
    },
    {
      icon: '🔑',
      label: 'Modifier mot de passe',
      action: 'change-password',
      description: 'Changer votre mot de passe'
    },
    {
      icon: '🚪',
      label: 'Déconnexion',
      action: 'logout',
      description: 'Quitter l\'application'
    }
  ];


  constructor() { }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    try {
      const userData = this.localStorage.getItem('v2_user');

      if (userData) {
        const user = JSON.parse(userData);
        this.userFirstName = user.firstName || user.firstname || user.prenom || '';
        this.userLastName = user.lastName || user.lastname || user.nom || '';
        this.userInitial = this.userFirstName.charAt(0).toUpperCase();
        this.userFullName = `${this.userFirstName} ${this.userLastName}`.trim();
        this.userMobile = user.mobile || user.mobile || user.mobile || '';
      } else {
        this.userFirstName = 'Utilisateur';
        this.userLastName = '';
        this.userInitial = 'U';
        this.userFullName = 'Utilisateur';
        this.userMobile = '+221776532145';
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      this.userFirstName = 'Utilisateur';
      this.userLastName = '';
      this.userInitial = 'U';
      this.userFullName = 'Utilisateur';
      this.userMobile = '+221776532145';
    }
  }

  refreshUserInfo(): void {
    this.loadUserInfo();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  onClasseChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.context.activeClasseId.set(selectElement.value);

    console.log("Classe choisi :", selectElement.value);
  }

  get sectionLabel(): string {
    const url = this.router.url;
    for (const [key, label] of Object.entries(this.sectionLabels)) {
      if (url.includes('/' + key)) {
        return label;
      }
    }
    return 'Tableau de bord';
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  naviguer(route: string): void {
    this.sidebarOpen.set(false);
    void this.router.navigate([route]);
  }

  onToggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onSidebarClose(): void {
    this.sidebarOpen.set(false);
  }

  handleDropdownAction(action: string): void {
    switch (action) {
      case 'profile':
        this.goToProfile();
        break;
      case 'change-password':
        this.goToChangePassword();
        break;
      case 'logout':
        this.logout();
        break;

      default:
        break;
    }
  }

  goToProfile(): void {
    void this.router.navigate(['/enseignant/mon-compte']);
  }

  goToChangePassword(): void {
    void this.router.navigate(['/enseignant/change-password']);
  }

  logout(): void {
    this.localStorage.clear();
    localStorage.removeItem('v2_user');
    localStorage.removeItem('v2_token');
    this.context.clearGestionClasseContext();
    void this.router.navigate(['/auth/login/v2']);
  }
}