import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface Statistic {
  value: string;
  label: string;
  icon: string;
}

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  text: string;
}

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {

  mobileMenuOpen = false;
  isScrolled = false;

  schools = [
    { name: 'Lycée Excellence' },
    { name: 'Groupe Scolaire La Découverte' },
    { name: 'Institut Moderne' },
    { name: 'Collège Saint Augustin' },
    { name: 'École Bilingue' }
  ];

  features: Feature[] = [
    {
      title: 'Gestion des élèves',
      description:
        'Fiches élèves, inscriptions, classes, transferts et suivi administratif.',
      icon: 'fas fa-user-graduate',
      color: 'blue'
    },
    {
      title: 'Notes & Bulletins',
      description:
        'Saisie des notes, calcul automatique et génération des bulletins.',
      icon: 'fas fa-book',
      color: 'green'
    },
    {
      title: 'Emploi du temps',
      description:
        'Organisez facilement les cours, salles et disponibilités des enseignants.',
      icon: 'fas fa-calendar-alt',
      color: 'orange'
    },
    {
      title: 'Paiements & Facturation',
      description:
        'Suivez les mensualités, paiements reçus et situations financières.',
      icon: 'fas fa-wallet',
      color: 'purple'
    },
    {
      title: 'Absences & Retards',
      description:
        'Suivez les présences et informez rapidement les responsables.',
      icon: 'fas fa-bell',
      color: 'coral'
    },
    {
      title: 'Communication',
      description:
        'Facilitez les échanges entre administration, enseignants et parents.',
      icon: 'fas fa-comments',
      color: 'sky'
    }
  ];

  statistics: Statistic[] = [
    {
      value: '250+',
      label: 'Établissements',
      icon: 'fas fa-school'
    },
    {
      value: '35 000+',
      label: 'Élèves',
      icon: 'fas fa-user-graduate'
    },
    {
      value: '2 500+',
      label: 'Enseignants',
      icon: 'fas fa-chalkboard-teacher'
    },
    {
      value: '98%',
      label: 'Satisfaction',
      icon: 'fas fa-trophy'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'M. Abdoulaye Ndour',
      role: 'Directeur — Lycée Excellence',
      initials: 'AN',
      text:
        'EduSchool a complètement transformé notre gestion scolaire. Nous avons beaucoup moins de tâches administratives et les parents sont mieux informés.'
    },
    {
      name: 'Mme Aïssatou Ba',
      role: 'Directrice — Groupe Scolaire',
      initials: 'AB',
      text:
        'L’interface est simple à comprendre et les fonctionnalités couvrent réellement nos besoins quotidiens. Toute notre équipe a rapidement adopté la plateforme.'
    },
    {
      name: 'M. Cheikh Fall',
      role: 'Gestionnaire — Institut Moderne',
      initials: 'CF',
      text:
        'Le suivi des paiements et des absences est devenu beaucoup plus simple. Nous avons enfin une vision claire de notre établissement.'
    }
  ];

  constructor(private router: Router) { }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();

    const section = document.getElementById(sectionId);

    if (!section) {
      console.warn(`Section introuvable : #${sectionId}`);
      return;
    }

    this.closeMobileMenu();

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  goToLogin(): void {
    this.closeMobileMenu();
    this.router.navigate(['/auth']);
  }

  startTrial(): void {
    this.closeMobileMenu();

    // À remplacer par la route réelle de l'inscription/onboarding.
    this.router.navigate(['/inscription']);
  }

  requestDemo(): void {
    this.router.navigate(['/home/demo']);
  }

}
