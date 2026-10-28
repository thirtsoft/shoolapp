import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, Input, OnChanges, QueryList, signal, SimpleChanges, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CahiersDeTexteseResponse } from '../../../../../core/models/cahier-texte/cahiers-textes-response.model';
import { DetailsEntreeCahierTexteResponse } from '../../../../../core/models/cahier-texte/details-entrees-cahiers-texte-response.model';
import { EntreeCahierTexteRequest } from '../../../../../core/models/cahier-texte/entrees-cahier-texte-request.model';
import { EntreeCahierTextePageResponse } from '../../../../../core/models/cahier-texte/entrees-cahiers-texte-page-response.model';
import { EntreeCahierTexteResponse } from '../../../../../core/models/cahier-texte/entrees-cahiers-textes-responses.model';

import { CahierTexteResourceService } from '../../../../administration/cahiertexte/services/chaier-texte-resource.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cahier-texte-enseignant-component',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './cahier-texte-enseignant-component.html',
  styleUrl: './cahier-texte-enseignant-component.css',
})
export class CahierTexteEnseignantComponent implements OnChanges {

  @Input() classeUuid?: string;
  @Input() anneeScolaireUuid?: string;
  @Input() courseUuid?: string | null;
  @Input() enseignementId?: number;

  @Input() ouvrirCreation = false;

  @ViewChildren('contenuInput')
  contenuInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly cahierTexteService = inject(CahierTexteResourceService);
  private readonly toastService = inject(ToastrService);

  cahierTexte = signal<CahiersDeTexteseResponse | null>(null);
  entrees = signal<DetailsEntreeCahierTexteResponse[]>([]);
  pagination = signal<EntreeCahierTextePageResponse | null>(null);

  isLoading = signal(false);
  isSaving = signal(false);
  showForm = signal(false);

  entreeEnEdition = signal<EntreeCahierTexteResponse | null>(null);

  dateSeance = signal('');

  contenu = signal<string[]>(['']);

  observation = signal('');

  semaineCourante = signal<Date>(this.getDebutSemaine(new Date()));

  private readonly pageSize = 20;

  dateAujourdhui = this.getDateString(new Date());

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['classeUuid'] || changes['anneeScolaireUuid']) {
      if (this.classeUuid && this.anneeScolaireUuid) {
        this.chargerCahierTexte();
      } else {
        this.resetEtat();
      }
    }

    if (changes['ouvrirCreation'] && this.ouvrirCreation === true) {
      if (this.cahierTexte()) {
        this.ouvrirFormulaire();
      }
    }
  }

  private resetEtat(): void {
    this.cahierTexte.set(null);
    this.entrees.set([]);
    this.pagination.set(null);

    this.showForm.set(false);
    this.entreeEnEdition.set(null);

    this.dateSeance.set('');
    this.contenu.set(['']);
    this.observation.set(false as never);
  }

  private chargerCahierTexte(): void {

    if (!this.classeUuid || !this.anneeScolaireUuid) {
      this.resetEtat();
      return;
    }

    this.cahierTexte.set(null);
    this.entrees.set([]);
    this.pagination.set(null);
    this.showForm.set(false);
    this.entreeEnEdition.set(null);

    this.isLoading.set(true);

    this.cahierTexteService.getCahierTexteByClasseAndAnneeScolaire(
      this.classeUuid,
      this.anneeScolaireUuid
    )
      .subscribe({

        next: cahier => {

          this.cahierTexte.set(cahier);

          this.chargerEntrees(cahier.id);
        },

        error: error => {

          console.error(
            'Erreur lors du chargement du cahier de texte',
            error
          );

          this.cahierTexte.set(null);
          this.entrees.set([]);
          this.pagination.set(null);

          this.showForm.set(false);
          this.entreeEnEdition.set(null);

          this.isLoading.set(false);
        }
      });
  }

  private chargerEntrees(cahierTexteId: number): void {

    const debut = this.getDebutSemaine(this.semaineCourante());
    const fin = this.getFinSemaine(debut);
    const dateDebut = this.formatDate(debut);
    const dateFin = this.formatDate(fin);

    this.isLoading.set(true);

    this.cahierTexteService.getEntreeCahierTexteByCahierText(
      cahierTexteId,
      dateDebut, dateFin,
      0, this.pageSize
    )
      .subscribe({

        next: response => {

          this.pagination.set(response);
          this.entrees.set(response.content);
          this.isLoading.set(false);
        },

        error: error => {

          console.error(
            'Erreur lors du chargement des entrées',
            error
          );

          this.entrees.set([]);

          this.pagination.set(null);

          this.isLoading.set(false);
        }
      });
  }

  estAujourdHui(date: Date): boolean {
    return (this.getDateString(date) === this.dateAujourdhui);
  }

  getEntreesDuJour(date: Date): DetailsEntreeCahierTexteResponse[] {
    const dateString = this.getDateString(date);
    return this.entrees()
      .filter(
        entree => entree.dateSeance && entree.dateSeance.substring(0, 10) === dateString
      )
      .sort((a, b) => {

        if (!a.heureDebut && !b.heureDebut) {
          return (a.id ?? 0) - (b.id ?? 0);
        }

        if (!a.heureDebut) {
          return 1;
        }

        if (!b.heureDebut) {
          return -1;
        }

        return a.heureDebut.localeCompare(b.heureDebut);
      });
  }

  getDateString(date: Date): string {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');

    return `${annee}-${mois}-${jour}`;
  }

  public formatDate(date: Date): string {
    return this.getDateString(date);
  }
  getJoursSemaine(): Date[] {
    const debut = this.getDebutSemaine(this.semaineCourante());
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(debut);
      date.setDate(debut.getDate() + index);
      return date;
    }
    );
  }

  aDesEntrees(date: Date): boolean {
    return (this.getEntreesDuJour(date).length > 0);
  }

  getLibelleSemaine(): string {
    const debut = this.getDebutSemaine(this.semaineCourante());
    const fin = this.getFinSemaine(debut);

    const formatteur = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const debutTexte = formatteur.format(debut);
    const finTexte = formatteur.format(fin);

    return `${debutTexte} au ${finTexte}`;
  }

  estSemaineActuelle(): boolean {
    const debutActuel = this.getDateString(this.getDebutSemaine(new Date()));
    const debutAffiche = this.getDateString(this.semaineCourante());
    return (debutActuel === debutAffiche);
  }

  semainePrecedente(): void {
    const nouvelleSemaine = new Date(this.semaineCourante());
    nouvelleSemaine.setDate(nouvelleSemaine.getDate() - 7);
    this.semaineCourante.set(this.getDebutSemaine(nouvelleSemaine)
    );
    const cahier = this.cahierTexte();
    if (cahier) {
      this.chargerEntrees(cahier.id);
    }
  }

  semaineSuivante(): void {
    const nouvelleSemaine = new Date(this.semaineCourante());
    nouvelleSemaine.setDate(nouvelleSemaine.getDate() + 7);
    this.semaineCourante.set(this.getDebutSemaine(nouvelleSemaine)
    );

    const cahier = this.cahierTexte();

    if (cahier) {
      this.chargerEntrees(cahier.id);
    }
  }

  semaineActuelle(): void {
    this.semaineCourante.set(this.getDebutSemaine(new Date()));
    const cahier = this.cahierTexte();
    if (cahier) {
      this.chargerEntrees(cahier.id);
    }
  }

  private getDebutSemaine(date: Date): Date {
    const resultat = new Date(date);
    resultat.setHours(0, 0, 0, 0);
    const jour = resultat.getDay();
    const difference = jour === 0 ? -6 : 1 - jour;
    resultat.setDate(resultat.getDate() + difference);

    return resultat;
  }

  private getFinSemaine(debut: Date): Date {
    const fin = new Date(debut);
    fin.setDate(fin.getDate() + 5);
    return fin;
  }

  validerLigneEtAjouter(index: number, event: Event): void {
    event.preventDefault();
    if (this.isSaving()) {
      return;
    }
    const ligne = this.contenu()[index]?.trim();
    if (!ligne) {
      return;
    }

    this.ajouterLigneContenu();

    setTimeout(() => {

      const inputs = this.contenuInputs.toArray();
      const nouvelInput = inputs[index + 1];

      if (nouvelInput) {
        nouvelInput.nativeElement.focus();
      }

    });
  }

  ouvrirFormulaire(): void {
    if (!this.cahierTexte()) {
      return;
    }

    const aujourdHui = new Date().toISOString().substring(0, 10);
    this.entreeEnEdition.set(null);

    this.dateSeance.set(aujourdHui);
    this.contenu.set(['']);
    this.observation.set('');
    this.showForm.set(true);
  }

  modifierEntree(entree: any): void {
    if (!this.cahierTexte()) {
      return;
    }
    this.entreeEnEdition.set(entree);

    this.dateSeance.set(typeof entree.dateSeance === 'string'
      ? entree.dateSeance.substring(0, 10)
      : new Date(
        entree.dateSeance
      )
        .toISOString()
        .substring(0, 10)
    );

    this.contenu.set(entree.contenu?.length ? [...entree.contenu] : ['']);
    this.observation.set(entree.observation ?? '');

    this.showForm.set(true);
  }

  fermerFormulaire(): void {
    this.showForm.set(false);
    this.entreeEnEdition.set(null);
  }

  ajouterLigneContenu(): void {
    this.contenu.update(lignes => [...lignes, '']);
  }

  supprimerLigneContenu(index: number): void {
    this.contenu.update(lignes => {
      if (lignes.length === 1) {
        return [''];
      }
      return lignes.filter((_, i) => i !== index);
    }
    );
  }

  modifierLigneContenu(index: number, value: string): void {
    this.contenu.update(lignes => {
      const copie = [...lignes];
      copie[index] = value;
      return copie;
    }
    );
  }

  sauvegarderV1(): void {
    const cahier = this.cahierTexte();
    if (!cahier) {
      return;
    }

    const contenu = this.contenu()
      .map(ligne => ligne.trim())
      .filter(
        ligne => ligne.length > 0
      );

    if (!this.dateSeance()) {
      return;
    }

    if (contenu.length === 0) {
      return;
    }

    const request: EntreeCahierTexteRequest = {
      cahierTexteId: cahier.id,
      coursUuid: this.courseUuid ?? null,
      dateSeance: new Date(this.dateSeance()),
      contenu,
      observation: this.observation().trim() || undefined
    };

    this.isSaving.set(true);

    const entree = this.entreeEnEdition();
    const operation = entree
      ? this.cahierTexteService.updateEntree(
        entree.id,
        request
      )
      : this.cahierTexteService.createEntree(
        request
      );

    operation.subscribe({

      next: resultat => {

        if (entree) {

          this.entrees.update(
            liste =>
              liste.map(
                item => item.id === resultat.id ? resultat : item
              )
          );

        } else {

          const cahier = this.cahierTexte();
          if (cahier) {
            this.chargerEntrees(
              cahier.id
            );
          }
        }

        this.isSaving.set(false);

        this.fermerFormulaire();
      },

      error: error => {

        console.error(
          'Erreur lors de l\'enregistrement',
          error
        );

        this.isSaving.set(false);
      }
    });
  }

  sauvegarder(): void {
    const cahier = this.cahierTexte();

    if (!cahier) {
      return;
    }

    const contenu = this.contenu()
      .map(ligne => ligne.trim())
      .filter(ligne => ligne.length > 0);

    if (!this.dateSeance()) {
      return;
    }

    if (contenu.length === 0) {
      return;
    }

    const request: EntreeCahierTexteRequest = {
      cahierTexteId: cahier.id,
      coursUuid: this.courseUuid ?? null,
      dateSeance: new Date(this.dateSeance()),
      contenu,
      observation: this.observation().trim() || undefined
    };

    this.isSaving.set(true);

    const entree = this.entreeEnEdition();

    const operation = entree
      ? this.cahierTexteService.updateEntree(
        entree.id,
        request
      )
      : this.cahierTexteService.createEntree(
        request
      );

    operation.subscribe({

      next: resultat => {

        if (entree) {

          this.entrees.update(
            liste =>
              liste.map(
                item =>
                  item.id === resultat.id
                    ? resultat
                    : item
              )
          );

        } else {

          const cahierActuel = this.cahierTexte();

          if (cahierActuel) {
            this.chargerEntrees(cahierActuel.id);
          }
        }

        this.isSaving.set(false);

        this.toastService.success(
          entree
            ? 'La séance a été modifiée avec succès.'
            : 'La séance a été enregistrée avec succès.'
        );

        this.fermerFormulaire();
      },

      error: error => {

        console.error(
          'Erreur lors de l\'enregistrement',
          error
        );

        this.isSaving.set(false);

        this.toastService.error(
          'Impossible d’enregistrer la séance. Veuillez réessayer.'
        );
      }
    });
  }

  supprimer(entree: any): void {
    const confirmer = window.confirm('Voulez-vous supprimer cette séance ?');

    if (!confirmer) {
      return;
    }

    this.cahierTexteService.deleteEntree(entree.id)
      .subscribe({
        next: () => {

          this.entrees.update(
            liste =>
              liste.filter(
                item =>
                  item.id !== entree.id
              )
          );
        },

        error: error => {
          console.error(
            'Erreur lors de la suppression',
            error
          );
        }
      });
  }
}