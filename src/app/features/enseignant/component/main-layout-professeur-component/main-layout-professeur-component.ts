import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { EnseignantService } from '../../service/enseignant.service';
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
  readonly classeContext = inject(EnseignementContextService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly planificationResource = inject(PlanificationResourceService);

  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);
  userId?: number;

  readonly matiereActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    
    // On retourne sa matière, ou une valeur par défaut s'il n'y a rien
    return enseignementActif?.matiere || 'Matière';
  });

  professeur = {
    nom: 'M. Sall',
    prenom: 'Moussa',
    matiere: 'Mathématiques',
    avatar: '👨‍🏫'
  };

  readonly todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  nav: NavItem[] = [
    { route: '/enseignant/dashboard', ico: '📊', label: 'Accueil' },
    { route: '/enseignant/mes-eleves', ico: '👨‍🎓', label: 'Élèves' },
    { route: '/enseignant/notes', ico: '📝', label: 'Notes' },
    { route: '/enseignant/absences', ico: '✅', label: 'Appel' },
    { route: '/enseignant/mon-compte', ico: '👤', label: 'Profil' },

  ];

  private readonly sectionLabels: Record<string, string> = {
    'dashboard': 'Tableau de bord',
    'mes-eleves': 'Mes élèves',
    'absences': 'Appel & Absences',
    'demande-conge': 'Demande de congé',
    'mes-conges': 'Mes congés',
    'mes-enseignements': 'Mes enseignements',
    'notes': 'Saisie des notes',
    'evaluations': 'Évaluations',
    'exercices': 'Exercices',
    'mes-cours': 'Cours & Ressources',
    'mes-reunions': 'Réunions',
    'mon-compte': 'Mon compte',
  };


  constructor() {
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    if (this.userId) {
      this.chargerContexteEnseignements(this.userId);
    }
  }
  chargerContexteEnseignements(userId: number) {
    this.enseignantService.getDetailsEnseignantUtilisateur(userId).subscribe({
      next: (data) => {
        const enseignantId = data?.id;
        if (enseignantId) {
          // On récupère la liste complète et non paginée (ex: avec une taille de 100 pour tout avoir dans le select)
          this.planificationResource.getResourceByIdPaged('planification/enseignement/enseignant', enseignantId, 0, 100)
            .subscribe({
              next: (response) => {
                const listeBrute: any = response.data?.content || [];

                console.log("Données reçues pour la Navbar :", listeBrute);

                // Mise à jour de la liste globale dans ton service partagé
                this.classeContext.setClasses(listeBrute);
              },
              error: (err) => console.error('Erreur liste enseignements navbar:', err)
            });
        }
      },
      error: (err) => console.error('Erreur enseignant navbar:', err)
    });
  }

  onClasseChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.classeContext.activeClasseId.set(selectElement.value);

    console.log("Classe choisi :", selectElement.value);

    // Optionnel : Tu peux forcer le rafraîchissement de la route courante 
    // ou laisser le composant enfant réagir dynamiquement au signal.
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
    this.router.navigate([route]);
  }

  onToggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onSidebarClose(): void {
    this.sidebarOpen.set(false);
  }
}