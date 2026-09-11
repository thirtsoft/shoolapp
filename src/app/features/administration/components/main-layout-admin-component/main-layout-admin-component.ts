import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavItem } from '../../../../core/components/sidebar-navbar-models/nav-item.model';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { SideBarAdminComponent } from '../side-bar-admin-component/side-bar-admin-component';

@Component({
  selector: 'app-main-layout-admin-component',
  standalone: true,
  imports: [RouterOutlet, SideBarAdminComponent],
  templateUrl: './main-layout-admin-component.html',
  styleUrl: './main-layout-admin-component.css',
})
export class MainLayoutAdminComponent implements OnInit {

  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);
  dropdownOpen = signal(false);

  userFirstName: string = '';
  userLastName: string = '';
  userInitial: string = '';
  userFullName: string = '';
  userMobile: string = '';

  readonly router = inject(Router);
  readonly localStorage = inject(LocalStorageService);

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

  dropdownItems = [
    {
      icon: '👤',
      label: 'Profil',
      action: 'profile',
      description: 'Voir mes informations'
    },
    {
      icon: '🏫',
      label: 'Mon organisation',
      action: 'organization',
      description: 'Informations de l\'établissement'
    },
    {
      icon: '📧',
      label: 'Paramétrage email',
      action: 'notificationconfiguration',
      description: 'Configurer l\'envoi des emails'
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

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  handleDropdownAction(action: string): void {
    this.closeDropdown();

    switch (action) {
      case 'profile':
        this.goToProfile();
        break;
      case 'organization':
        this.goToOrganizationInfos();
        break;
      case 'notificationconfiguration':
        this.goToNotificationConfiguration();
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
    this.router.navigate(['/admin/utilisateur/profil']);
  }

  goToOrganizationInfos(): void {
    this.router.navigate(['/admin/organization/information']);
  }

  goToNotificationConfiguration(): void {
    this.router.navigate(['/admin/organization/notification-configuration']);
  }

  goToChangePassword(): void {
    this.router.navigate(['/admin/utilisateur/change-password']);
  }


  logout(): void {
    this.localStorage.clear();
    localStorage.removeItem('v2_user');
    localStorage.removeItem('v2_token');
    this.router.navigate(['/auth/login/v2']);

  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.lt-user') && this.dropdownOpen()) {
      this.closeDropdown();
    }
  }


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




