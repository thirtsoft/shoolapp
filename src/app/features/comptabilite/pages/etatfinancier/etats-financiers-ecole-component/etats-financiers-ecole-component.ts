import { Component, inject, OnInit, signal } from '@angular/core';
import { EtatFinancier } from '../../../../../core/models/comptabilite/etatfinancier/etat-financier-model';
import { AnneeScolaireEncoursResponse } from '../../../../../core/models/referentiels/annee-scolaire-encours-response';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-etats-financiers-ecole-component',
  standalone: true,
  imports: [],
  templateUrl: './etats-financiers-ecole-component.html',
  styleUrl: './etats-financiers-ecole-component.css',
})
export class EtatsFinanciersEcoleComponent implements OnInit {

  private readonly comptabiliteResourceService = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);

  etatFinancier = signal<EtatFinancier | null>(null);

  anneeScolaireEncours = signal<AnneeScolaireEncoursResponse | null>(null);

  chargement = signal(false);

  ngOnInit(): void {
    this.chargerAnneeScolaireEncours();
    this.chargerEtatFinancier();
  }

  chargerAnneeScolaireEncours(): void {
    this.referentielResource
      .recupererAnneeScolaireEnCours('anneescolaire-encours')
      .subscribe({
        next: (response) => {

          this.anneeScolaireEncours.set(response);

          console.log('Année scolaire en cours', response);
        },

        error: (error) => {

          console.error(
            'Erreur lors du chargement de l’année scolaire',
            error
          );
        }
      });
  }

  chargerEtatFinancier(): void {
    this.chargement.set(true);
    this.comptabiliteResourceService
      .obtenirEtatFinancier()
      .subscribe({
        next: (response) => {

          this.etatFinancier.set(response);

          console.log('État financier', response);

          this.chargement.set(false);
        },

        error: (error) => {

          console.error(
            'Erreur lors du chargement de l’état financier',
            error
          );

          this.chargement.set(false);
        }
      });
  }

  get anneeScolaire(): string {

    const annee = this.anneeScolaireEncours();

    if (!annee) {
      return '';
    }

    return `${this.formaterDate(String(annee.dateDebut))} – ${this.formaterDate(String(annee.dateFin))}`;
  }

  get dateDebutAffichage(): string {
    const annee = this.anneeScolaireEncours();

    if (!annee) {
      return '';
    }

    return this.formaterDate(String(annee.dateDebut));
  }

  get dateFinAffichage(): string {

    const aujourdHui = new Date();

    return this.formaterDateISO(
      aujourdHui.getFullYear(),
      aujourdHui.getMonth() + 1,
      aujourdHui.getDate()
    );
  }

  get periode(): string {

    return `${this.dateDebutAffichage} → ${this.dateFinAffichage}`;
  }

  get messageSolde(): string {

    const solde = this.etatFinancier()?.soldeFinancier ?? 0;

    if (solde > 0) {
      return `Votre école dégage un solde positif de ${this.formaterMontant(solde)} FCFA depuis le début de la période.`;
    }

    if (solde < 0) {
      return `Votre école présente un solde négatif de ${this.formaterMontant(Math.abs(solde))} FCFA depuis le début de la période.`;
    }
    return 'Votre école présente un solde financier à l’équilibre sur la période sélectionnée.';
  }

  get situationFinanciere(): 'positive' | 'negative' | 'equilibre' {

    const solde = this.etatFinancier()?.soldeFinancier ?? 0;

    if (solde > 0) {
      return 'positive';
    }

    if (solde < 0) {
      return 'negative';
    }

    return 'equilibre';
  }

  get libelleSituation(): string {

    switch (this.situationFinanciere) {

      case 'positive':
        return 'Situation saine';

      case 'negative':
        return 'Situation à surveiller';

      default:
        return 'Situation à l’équilibre';
    }
  }

  formaterMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR').format(montant);
  }

  private formaterDate(date: string): string {
    if (!date) {
      return '';
    }
    const [annee, mois, jour] = date.split('-');
    return `${jour}/${mois}/${annee}`;
  }

  private formaterDateISO(annee: number, mois: number, jour: number): string {

    return `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
  }
}