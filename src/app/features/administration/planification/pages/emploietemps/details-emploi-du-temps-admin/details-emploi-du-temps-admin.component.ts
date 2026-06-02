import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-details-emploi-du-temps-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './details-emploi-du-temps-admin.component.html',
  styleUrls: ['./details-emploi-du-temps-admin.component.css']
})
export class DetailsEmploiDuTempsAdminComponent implements OnInit {

  emploieId: number;
  emploie: any;
  coursesList: any;
  title = "Détails emploie du temps";

  joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  heuresRepere = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
  ];

  gridData: any[] = [];
  rowSpans: { [key: string]: { span: number, course: any }[] } = {};
  repartitionHoraire: any[] = [];

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);



  constructor(
  ) {
    this.emploieId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.emploieId != null) {
      this.getDetailsEmploiDuTemps(this.emploieId);
    }
  }

  getDetailsEmploiDuTemps(emploieId: number) {
    this.planificationService.recupererUneResource('planification/emploidutemps/details', emploieId).subscribe({
      next: (data) => {
        this.emploie = data;
        this.coursesList = this.emploie.listeCoursDTOS || [];

        this.construireMatriceDynamique();
        this.calculerRepartitionHoraire();
      }
    });
  }

  construireMatriceDynamique() {
    this.gridData = [];

    this.joursSemaine.forEach(j => {
      this.rowSpans[j.toLowerCase()] = [];
    });

    this.heuresRepere.forEach((creneau) => {
      const startH = creneau.split(' - ')[0];
      const endH = creneau.split(' - ')[1];

      let ligne: any = { horaire: creneau, start: startH, end: endH };

      this.joursSemaine.forEach(j => {
        ligne[j.toLowerCase()] = null;
      });

      this.gridData.push(ligne);
    });
    this.coursesList.forEach((cours: any) => {
      if (!cours.dateDebut || !cours.heureDebut) return;
      const dateObj = new Date(cours.dateDebut);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
      let jourNom = dateObj.toLocaleDateString('fr-FR', options);
      jourNom = jourNom.charAt(0).toUpperCase() + jourNom.slice(1);

      if (this.joursSemaine.includes(jourNom)) {
        const jourKey = jourNom.toLowerCase();

        this.gridData.forEach((row, index) => {
          if (row.start >= cours.heureDebut && row.end <= cours.heureFin) {
            this.gridData[index][jourKey] = cours;
          }
        });
      }
    });

    this.joursSemaine.forEach(j => {
      const jourKey = j.toLowerCase();
      let i = 0;

      while (i < this.gridData.length) {
        let span = 1;
        let currentCourse = this.gridData[i][jourKey];

        if (currentCourse) {
          while (
            i + span < this.gridData.length &&
            this.gridData[i + span][jourKey] &&
            this.gridData[i + span][jourKey].id === currentCourse.id
          ) {
            span++;
          }
        }

        this.rowSpans[jourKey].push({ span: span, course: currentCourse });

        for (let s = 1; s < span; s++) {
          this.rowSpans[jourKey].push({ span: 0, course: null });
        }
        i += span;
      }
    });
  }

  calculerRepartitionHoraire() {
    const mapMatieres = new Map<string, number>();
    this.coursesList.forEach((c: any) => {
      if (c.matiere) {
        const dureeNumerique = parseFloat(c.duree) || 2;
        mapMatieres.set(c.matiere, (mapMatieres.get(c.matiere) || 0) + dureeNumerique);
      }
    });

    const couleurs = ['#f8d7da', '#cce5ff', '#ffe8cc', '#fff3cd', '#d1ecf1', '#e8dbff', '#e2e3e5'];
    let idx = 0;

    this.repartitionHoraire = [];
    mapMatieres.forEach((val, key) => {
      this.repartitionHoraire.push({
        matiere: key,
        volume: `${val}h`,
        color: couleurs[idx % couleurs.length]
      });
      idx++;
    });
  }

  getCellClass(matiere: string): string {
    if (!matiere) return '';
    const m = matiere.toLowerCase();
    if (m.includes('math')) return 'math-cell';
    if (m.includes('français') || m.includes('francais')) return 'french-cell';
    if (m.includes('physique') || m.includes('eps')) return 'eps-cell';
    if (m.includes('art')) return 'art-cell';
    if (m.includes('langue') || m.includes('anglais')) return 'langue-cell';
    if (m.includes('histoire') || m.includes('géo')) return 'monde-cell';
    return 'default-course-cell';
  }

  imprimerEmploiDuTemps(): void {
    window.print();
  }

  exporterPDF(): void {
    const element = document.getElementById('print-shadow-element') as HTMLElement;
    if (element) {
      element.style.position = 'static';
      element.style.left = '0';

      html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then((canvas) => {
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

        pdf.addImage(imgData, 'PNG', 7, 7, imgWidth, imgHeight);
        pdf.save(`Emploi_du_temps_${this.emploie?.libelleClasse || '6eme'}.pdf`);
      }).catch(() => {
        element.style.position = 'absolute';
        element.style.left = '-9999px';
      });
    }
  }

  goBack() {
    this.router.navigate(['admin/planification/emploi-du-temps'])
  }

}