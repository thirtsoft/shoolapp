import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CahierDeTexteDetailsResponse } from '../../../../../../core/models/cahier-texte/cahier-texte-details-response.model';
import { DetailsEntreeCahierTexteResponse } from '../../../../../../core/models/cahier-texte/details-entrees-cahiers-texte-response.model';
import { CahierTexteResourceService } from '../../../services/chaier-texte-resource.service';


type VuePeriode = 'semaine' | 'mois';

type ActionCahier = | 'publier' | 'depublier' | 'cloturer';

interface JourSemaine {
  date: string;
  libelle: string;
  numero: number;
  estAujourdHui: boolean;
  entrees: DetailsEntreeCahierTexteResponse[];
}

@Component({
  selector: 'app-details-cahier-texte-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './details-cahier-texte-component.html',
  styleUrl: './details-cahier-texte-component.css',
})
export class DetailsCahierTexteComponent implements OnInit {


  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cahierDeTexteService = inject(CahierTexteResourceService);

  readonly cahierTexteId = signal<number | null>(null);

  readonly details = signal<CahierDeTexteDetailsResponse | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly actionEnCours = signal<ActionCahier | null>(null);
  readonly traitementAction = signal(false);

  readonly vue = signal<VuePeriode>('semaine');

  readonly periode = signal(new Date());

  readonly entrees = computed(() => this.details()?.entrees ?? []);

  readonly totalEntrees = computed(() => this.details()?.totalEntrees ?? 0);

  readonly cahierPublie = computed(() => this.getEtatCode() === 'PUBLIE');

  readonly cahierDepublie = computed(() => this.getEtatCode() === 'DEPUBLIE');

  readonly cahierCloture = computed(() => this.getEtatCode() === 'CLOTURE');

  readonly joursSemaine = computed<JourSemaine[]>(() => {

    const debut = this.getDebutSemaine(this.periode());

    return Array.from({ length: 6 }, (_, index) => {

      const date = new Date(debut);

      date.setDate(debut.getDate() + index);

      const dateString = this.formatDate(date);

      return {
        date: dateString,
        libelle: this.getLibelleJour(date),
        numero: date.getDate(),
        estAujourdHui: dateString === this.formatDate(new Date()), entrees: this.getEntreesDuJour(dateString)
      };
    });
  });

  readonly titrePeriode = computed(() => {
    if (this.vue() === 'mois') {
      return this.periode().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    const debut = this.getDebutSemaine(this.periode());
    const fin = new Date(debut);
    fin.setDate(debut.getDate() + 5);
    return `Semaine du ${this.formatDateFrancais(debut)} au ${this.formatDateFrancais(fin)}`;
  });

  readonly entreeSelectionnee = signal<DetailsEntreeCahierTexteResponse | null>(null);

  readonly afficherDetailsEntree = computed(() => this.entreeSelectionnee() !== null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Identifiant du cahier de texte invalide.');
      return;
    }
    this.cahierTexteId.set(id);
    this.chargerDetails();
  }

  chargerDetails(): void {
    const id = this.cahierTexteId();
    if (!id) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const periode = this.getPeriode();

    this.cahierDeTexteService.getDetailsCahierTexte(
      id,
      periode.dateDebut, periode.dateFin,
      0, 100
    )
      .subscribe({

        next: response => {
          this.details.set(response);
          this.loading.set(false);

        },

        error: err => {
          console.error('Erreur récupération cahier de texte', err);
          this.error.set(
            err?.error?.message ?? 'Erreur lors de la récupération du cahier de texte.'
          );
          this.loading.set(false);
        }
      });
  }

  ouvrirAction(action: ActionCahier): void {
    if (this.cahierCloture()) {
      return;
    }
    this.actionEnCours.set(action);
  }

  fermerAction(): void {
    if (!this.traitementAction()) {
      this.actionEnCours.set(null);
    }
  }

  confirmerAction(): void {
    const action = this.actionEnCours();
    if (!action) {
      return;
    }
    const id = this.cahierTexteId();

    if (!id) {
      return;
    }

    this.traitementAction.set(true);

    let request$;

    switch (action) {

      case 'publier':
        request$ = this.cahierDeTexteService.publierCahierDeTexte(id);
        break;

      case 'depublier':
        request$ = this.cahierDeTexteService.dePublierCahierDeTexte(id);
        break;

      case 'cloturer':
        request$ = this.cahierDeTexteService.cloturerCahierDeTexte(id);
        break;
    }

    request$.subscribe({

      next: response => {

        this.traitementAction.set(false);
        this.actionEnCours.set(null);

        this.chargerDetails();
      },

      error: err => {

        console.error(
          'Erreur changement état cahier',
          err
        );

        this.traitementAction.set(false);

        this.error.set(
          err?.error?.message ?? 'Impossible de modifier l’état du cahier de texte.'
        );
      }
    });
  }

  changerVue(vue: VuePeriode): void {
    if (this.vue() === vue) {
      return;
    }
    this.vue.set(vue);
    this.chargerDetails();
  }

  periodePrecedente(): void {
    const date = new Date(this.periode());

    if (this.vue() === 'semaine') {
      date.setDate(date.getDate() - 7);

    } else {
      date.setMonth(date.getMonth() - 1);
    }

    this.periode.set(date);
    this.chargerDetails();
  }

  periodeSuivante(): void {
    const date = new Date(this.periode());

    if (this.vue() === 'semaine') {
      date.setDate(date.getDate() + 7);

    } else {
      date.setMonth(date.getMonth() + 1);
    }

    this.periode.set(date);

    this.chargerDetails();
  }

  revenirAujourdHui(): void {
    this.periode.set(new Date());
    this.chargerDetails();
  }

  estPeriodeActuelle(): boolean {
    const maintenant = new Date();
    if (this.vue() === 'semaine') {

      return this.formatDate(this.getDebutSemaine(maintenant)
      ) ===
        this.formatDate(this.getDebutSemaine(this.periode()));
    }

    return maintenant.getFullYear() === this.periode().getFullYear()
      &&
      maintenant.getMonth() === this.periode().getMonth();
  }

  getEntreesDuJour(date: string): DetailsEntreeCahierTexteResponse[] {
    return this.entrees()
      .filter(e => e.dateSeance === date)
      .sort((a, b) => (a.heureDebut ?? '').localeCompare(b.heureDebut ?? '')
      );
  }

  getJoursDuMois(): JourSemaine[] {
    const date = this.periode();
    const dernierJour = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return Array.from({ length: dernierJour.getDate() }, (_, index) => {

      const jour = new Date(date.getFullYear(), date.getMonth(), index + 1);
      const dateString = this.formatDate(jour);

      return {
        date: dateString,
        libelle: this.getLibelleJour(jour),
        numero: jour.getDate(),
        estAujourdHui: dateString === this.formatDate(new Date()),
        entrees: this.getEntreesDuJour(dateString)
      };
    }
    );
  }

  getEtatCode(): string {
    const details = this.details();
    if (!details) {
      return '';
    }
    const etat = details.etat
      ?.toUpperCase()
      ?.normalize('NFD')
      ?.replace(/[\u0300-\u036f]/g, '');

    if (etat?.includes('CLOT')) {
      return 'CLOTURE';
    }

    if (etat?.includes('DEPUBL')) {
      return 'DEPUBLIE';
    }

    if (etat?.includes('PUBL')) {
      return 'PUBLIE';
    }

    return etat ?? '';
  }

  getEtatLabel(): string {
    if (this.cahierCloture()) {
      return 'Clôturé';
    }
    if (this.cahierPublie()) {
      return 'Publié';
    }
    if (this.cahierDepublie()) {
      return 'Dépublié';
    }

    return this.details()?.etat ?? 'Non défini';
  }

  getEtatClass(): string {
    if (this.cahierCloture()) {
      return 'status-closed';
    }
    if (this.cahierPublie()) {
      return 'status-published';
    }
    if (this.cahierDepublie()) {
      return 'status-unpublished';
    }
    return 'status-default';
  }

  getActionTitle(): string {

    switch (this.actionEnCours()) {

      case 'publier':
        return 'Publier le cahier de texte';

      case 'depublier':
        return 'Dépublier le cahier de texte';

      case 'cloturer':
        return 'Clôturer le cahier de texte';

      default:
        return '';
    }
  }

  getActionMessage(): string {

    switch (this.actionEnCours()) {

      case 'publier':
        return 'Le cahier de texte sera visible par les enseignants.';

      case 'depublier':
        return 'Le cahier de texte ne sera plus visible par les enseignants. Les données seront conservées.';

      case 'cloturer':
        return 'Le cahier sera définitivement clôturé. Aucune modification ne sera ensuite possible, ni par les enseignants ni par les administrateurs.';

      default:
        return '';
    }
  }

  formatHeure(heure?: string | null): string {
    return heure ? heure.substring(0, 5) : '';
  }

  private getPeriode() {
    if (this.vue() === 'semaine') {
      const debut = this.getDebutSemaine(this.periode());
      const fin = new Date(debut);
      fin.setDate(debut.getDate() + 5);
      return { dateDebut: this.formatDate(debut), dateFin: this.formatDate(fin) };
    }

    const date = this.periode();

    return {
      dateDebut: this.formatDate(new Date(date.getFullYear(), date.getMonth(), 1)),

      dateFin: this.formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0)
      )
    };
  }

  private getDebutSemaine(date: Date): Date {
    const result = new Date(date);
    const jour = result.getDay();
    const difference = jour === 0 ? -6 : 1 - jour;
    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(
        date.getMonth() + 1
      ).padStart(2, '0'),
      String(
        date.getDate()
      ).padStart(2, '0')
    ].join('-');
  }

  private formatDateFrancais(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private getLibelleJour(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  ouvrirDetailsEntree(entree: DetailsEntreeCahierTexteResponse): void {
    this.entreeSelectionnee.set(entree);
  }

  fermerDetailsEntree(): void {
    this.entreeSelectionnee.set(null);
  }

  retourListe(): void {
    void this.router.navigate(['/admin/cahiers-textes']);
  }
}