import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendrierAdministrationResponse, ClasseResponse, CoursCalendrier } from '../../../../../../core/models/planification/cours-calendrier-response';
import { AnneeScolaireEncoursResponse } from '../../../../../../core/models/referentiels/annee-scolaire-encours-response';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Jour {
  code: string;
  libelle: string;
}

@Component({
  selector: 'app-emploie-du-temps',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './emploie-du-temps.component.html',
  styleUrls: ['./emploie-du-temps.component.css']
})
export class EmploieDuTempsComponent implements OnInit {

  private readonly referentielService = inject(ReferentielResourceService);
  private readonly planificationService = inject(PlanificationResourceService);
  private readonly router = inject(Router);

  classeSelectionnee?: number;

  anneeScolaireSelectionnee?: number;

  classesList: ClasseResponse[] = [];

  anneesScolaires: AnneeScolaireEncoursResponse[] = [];

  anneesScolaireList: AnneeScolaireEncoursResponse[] = [];

  anneeScolaireSelectionnees?: AnneeScolaireEncoursResponse;

  cours: CoursCalendrier[] = [];

  isLoading = false;

  isLoadingCours = false;

  errorMessage?: string;

  jours: Jour[] = [
    {
      code: 'LUNDI',
      libelle: 'Lundi'
    },
    {
      code: 'MARDI',
      libelle: 'Mardi'
    },
    {
      code: 'MERCREDI',
      libelle: 'Mercredi'
    },
    {
      code: 'JEUDI',
      libelle: 'Jeudi'
    },
    {
      code: 'VENDREDI',
      libelle: 'Vendredi'
    },
    {
      code: 'SAMEDI',
      libelle: 'Samedi'
    }
  ];

  heures: number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  titreEmploiDuTemps = '';

  joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  heuresRepere = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  gridData: any[] = [];

  rowSpans: { [key: string]: { span: number; course: CoursCalendrier | null; }[]; } = {};

  repartitionHoraire: any[] = [];


  ngOnInit(): void {
    this.getAnneeScolaires();
    this.chargerContexteCalendrier();
  }

  getAnneeScolaires(): void {

    this.errorMessage = undefined;

    this.referentielService
      .getResourceList('anneescolaire/response')
      .subscribe({

        next: (res: any[]) => {

          this.anneesScolaireList = res ?? [];
          this.anneesScolaires = res ?? [];

        },

        error: (err) => {

          console.error(
            'Erreur de chargement des années scolaires :',
            err
          );

          this.anneesScolaireList = [];
          this.anneesScolaires = [];

          this.errorMessage =
            'Impossible de charger les années scolaires.';
        }

      });
  }

  private chargerContexteCalendrier(): void {

    this.isLoading = true;
    this.errorMessage = undefined;

    this.planificationService
      .getContexteCalendrier()
      .subscribe({

        next: (response: CalendrierAdministrationResponse) => {

          if (response.anneeScolaire) {

            this.anneeScolaireSelectionnees = response.anneeScolaire;
            this.anneeScolaireSelectionnee = response.anneeScolaire.id;
          }

          this.classesList = (response.classes ?? []).map(classe => ({
            id: classe.id,
            classeUuid: classe.classeUuid,
            libelle: classe.libelle,
            anneeScolaireId:
              response.anneeScolaire?.id ?? 0
          }));

          if (response.classeSelectionnee) {
            this.classeSelectionnee = response.classeSelectionnee.id;

          } else if (this.classesList.length > 0) {
            this.classeSelectionnee = this.classesList[0].id;
          }

          this.isLoading = false;

          if (this.classeSelectionnee && this.anneeScolaireSelectionnee) {

            this.chargerEmploiDuTemps();
          }
        },

        error: (err) => {

          console.error('Erreur de chargement du contexte calendrier :', err);

          this.isLoading = false;

          this.classesList = [];
          this.cours = [];
          this.gridData = [];
          this.rowSpans = {};
          this.repartitionHoraire = [];

          this.errorMessage = 'Impossible de charger le calendrier.';
        }

      });
  }

  private chargerEmploiDuTemps(): void {

    if (!this.classeSelectionnee || !this.anneeScolaireSelectionnee) {

      this.cours = [];
      this.gridData = [];
      this.rowSpans = {};
      this.repartitionHoraire = [];

      return;
    }

    this.isLoadingCours = true;
    this.errorMessage = undefined;

    this.planificationService
      .getCoursCalendrierAdministration(
        this.classeSelectionnee,
        this.anneeScolaireSelectionnee
      )
      .subscribe({

        next: (response: CoursCalendrier[]) => {

          const coursResponse = response ?? [];

          this.titreEmploiDuTemps = coursResponse[0]?.emploiDuTemps?.titre ?? 'Emploi du temps';

          this.cours = coursResponse.map(cours => this.convertirCoursCalendrier(cours));

          this.construireMatriceDynamique();
          this.calculerRepartitionHoraire();

          this.isLoadingCours = false;
        },

        error: (err) => {

          console.error(
            'Erreur de chargement des cours du calendrier :',
            err
          );

          this.cours = [];
          this.gridData = [];
          this.rowSpans = {};
          this.repartitionHoraire = [];

          this.isLoadingCours = false;

          this.errorMessage = 'Impossible de charger les cours de cette classe.';
        }

      });
  }

  private convertirCoursCalendrier(cours: CoursCalendrier): CoursCalendrier {
    return {
      coursId: cours.coursId,
      courseUuid: cours.courseUuid,
      libelle: cours.libelle ?? 'Cours',
      jourSemaine: cours.jourSemaine,
      heureDebut: cours.heureDebut,
      heureFin: cours.heureFin,
      salle: cours.salle ?? null,
      classe: cours.classe ?? null,
      matiere: cours.matiere ?? null,
      anneeScolaire: cours.anneeScolaire ?? null,
      emploiDuTemps: cours.emploiDuTemps ?? null,
      enseignementId: cours.enseignementId,
      enseignant: cours.enseignant ?? 'Enseignant non renseigné',
      dateDebut: cours.dateDebut ?? null,
      dateFin: cours.dateFin ?? null,
      couleur: this.getCouleurCours(cours.matiere?.id),

      type: 'COURS'
    };
  }

  private getCouleurCours(matiereId?: number): string {

    if (!matiereId) {
      return 'blue';
    }

    const couleurs = [
      'blue',
      'pink',
      'green',
      'purple',
      'orange'
    ];

    return couleurs[matiereId % couleurs.length];
  }


  get classeActuelle(): ClasseResponse | undefined {

    return this.classesList.find(classe => classe.id === this.classeSelectionnee);
  }


  get anneeActuelle(): AnneeScolaireEncoursResponse | undefined {

    if (this.anneeScolaireSelectionnees && this.anneeScolaireSelectionnees.id === this.anneeScolaireSelectionnee) {
      return this.anneeScolaireSelectionnees;
    }

    return this.anneesScolaires.find(annee => annee.id === this.anneeScolaireSelectionnee);
  }

  changerClasse(classeId: number): void {
    this.classeSelectionnee = Number(classeId);
    this.chargerEmploiDuTemps();
  }


  changerAnneeScolaire(anneeId: number): void {
    this.anneeScolaireSelectionnee = Number(anneeId);

    this.anneeScolaireSelectionnees = this.anneesScolaires.find(annee => annee.id === this.anneeScolaireSelectionnee);

    this.chargerEmploiDuTemps();
  }

  obtenirCoursJour(jour: string): CoursCalendrier[] {
    return this.cours.filter(cours => cours.jourSemaine === jour);
  }


  calculerTop(cours: CoursCalendrier): string {
    const heure = this.convertirHeureEnMinutes(cours.heureDebut);
    const debutJournee = 8 * 60;
    const minutesDepuisDebut = heure - debutJournee;
    const pixelsParHeure = 59;
    const top = (minutesDepuisDebut / 60) * pixelsParHeure;
    return `${top}px`;
  }

  calculerHauteur(cours: CoursCalendrier): string {
    const debut = this.convertirHeureEnMinutes(cours.heureDebut);
    const fin = this.convertirHeureEnMinutes(cours.heureFin);
    const duree = fin - debut;
    const pixelsParHeure = 59;
    const hauteur = (duree / 60) * pixelsParHeure;
    return `${hauteur - 3}px`;
  }

  private convertirHeureEnMinutes(heure?: string): number {
    if (!heure) {
      return 0;
    }
    const valeur = heure.substring(0, 5);
    const [h, m] = valeur.split(':').map(Number);
    return ((h || 0) * 60 + (m || 0));
  }

  getClasseCours(cours: CoursCalendrier): string {
    return `course-${cours.couleur}`;
  }

  formaterHeure(heure: number): string {
    return `${heure.toString().padStart(2, '0')}h`;
  }

  actualiser(): void {
    this.chargerEmploiDuTemps();
  }


  get nombreEnseignants(): number {
    const enseignants = this.cours.map(cours => cours.enseignant).filter(Boolean);
    return new Set(enseignants).size;
  }

  get nombreMatieres(): number {
    const matieres = this.cours.map(cours => cours.matiere?.libelle).filter(Boolean);
    return new Set(matieres).size;
  }

  imprimer(): void {
    window.print();
  }

  construireMatriceDynamique(): void {
    this.gridData = [];
    this.rowSpans = {};
    this.joursSemaine.forEach(jour => { this.rowSpans[jour.toLowerCase()] = []; });

    this.heuresRepere.forEach(
      creneau => {

        const [startH, endH] = creneau.split(' - ');

        const ligne: any = { horaire: creneau, start: startH, end: endH };

        this.joursSemaine.forEach(jour => { ligne[jour.toLowerCase()] = null; });
        this.gridData.push(ligne);
      }
    );

    this.cours.forEach((cours: CoursCalendrier) => {
      if (!cours.jourSemaine || !cours.heureDebut || !cours.heureFin) {
        return;
      }

      const jourKey = cours.jourSemaine.toLowerCase();
      const jourExiste = this.joursSemaine.some(jour => jour.toLowerCase() === jourKey);

      if (!jourExiste) {
        return;
      }

      const coursDebut = this.convertirHeureEnMinutes(cours.heureDebut);
      const coursFin = this.convertirHeureEnMinutes(cours.heureFin);

      this.gridData.forEach(
        (row, index) => {

          const rowDebut = this.convertirHeureEnMinutes(row.start);
          const rowFin = this.convertirHeureEnMinutes(row.end);

          if (rowDebut >= coursDebut && rowFin <= coursFin) {
            this.gridData[index][jourKey] = cours;
          }
        }
      );

    }
    );

    this.joursSemaine.forEach(jour => {
      const jourKey = jour.toLowerCase();
      let i = 0;

      while (i < this.gridData.length) {
        let span = 1;
        const currentCourse = this.gridData[i][jourKey] as CoursCalendrier | null;

        if (currentCourse) {

          while (
            i + span <
            this.gridData.length &&

            this.gridData[
            i + span
            ][jourKey] &&

            this.gridData[
              i + span
            ][jourKey].courseUuid ===
            currentCourse.courseUuid

          ) {

            span++;

          }

        }

        this.rowSpans[jourKey].push({ span, course: currentCourse });

        for (let s = 1; s < span; s++) {
          this.rowSpans[jourKey].push({
            span: 0,
            course: null
          });

        }

        i += span;

      }

    }
    );
  }

  calculerRepartitionHoraire(): void {
    const mapMatieres = new Map<string, number>();
    this.cours.forEach(cours => {
      const matiere = cours.matiere?.libelle;
      if (!matiere || !cours.heureDebut || !cours.heureFin) {
        return;
      }
      const debut = this.convertirHeureEnMinutes(cours.heureDebut);
      const fin = this.convertirHeureEnMinutes(cours.heureFin);
      const duree = (fin - debut) / 60;

      mapMatieres.set(matiere, (mapMatieres.get(matiere) || 0) + duree
      );

    }
    );

    const couleurs = [
      '#f8d7da',
      '#cce5ff',
      '#ffe8cc',
      '#fff3cd',
      '#d1ecf1',
      '#e8dbff',
      '#e2e3e5'
    ];

    let indexCouleur = 0;

    this.repartitionHoraire = [];

    mapMatieres.forEach((volume, matiere) => {

      this.repartitionHoraire.push({
        matiere,
        volume: `${volume % 1 === 0 ? volume : volume.toFixed(1)}h`,
        color: couleurs[indexCouleur % couleurs.length]

      });

      indexCouleur++;

    }
    );

  }


  getCellClass(matiere: string): string {
    if (!matiere) {
      return '';
    }
    const m = matiere.toLowerCase();
    if (m.includes('math')) {
      return 'math-cell';
    }

    if (m.includes('français') || m.includes('francais')) {
      return 'french-cell';
    }

    if (m.includes('physique') || m.includes('eps')) {
      return 'eps-cell';
    }

    if (m.includes('art')) {
      return 'art-cell';
    }


    if (m.includes('langue') || m.includes('anglais')) {
      return 'langue-cell';

    }

    if (m.includes('histoire') || m.includes('géo')) {
      return 'monde-cell';
    }

    return 'default-course-cell';
  }

  exporterPDF(): void {
    this.construireMatriceDynamique();
    this.calculerRepartitionHoraire();

    const element = document.getElementById('print-shadow-element') as HTMLElement;

    if (!element) {
      console.error('Élément d’export PDF introuvable.');
      return;
    }

    element.style.position = 'static';
    element.style.left = '0';

    html2canvas(element,
      {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      }
    )
      .then(canvas => {
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 282;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(
          imgData,
          'PNG',
          7,
          7,
          imgWidth,
          imgHeight
        );

        const classe = this.classeActuelle?.libelle?.replace(/\s+/g, '_') || 'classe';
        const annee = this.anneeActuelle?.libelle?.replace(/\s+/g, '_') || 'annee';
        pdf.save(`Emploi_du_temps_${classe}_${annee}.pdf`);

      })
      .catch(error => {
        console.error('Erreur lors de la génération du PDF :', error);
        element.style.position = 'absolute';
        element.style.left = '-9999px';
      });

  }

  ajouterEmploie(): void {
    void this.router.navigate(['/admin/planification/emploi-du-temps/create']);

  }

}