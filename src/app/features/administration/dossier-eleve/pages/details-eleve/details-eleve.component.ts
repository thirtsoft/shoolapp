import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EleveData } from '../../../../../core/models/dossiereleve/details-dossier-eleve';
import { DossierEleveService } from '../../service/dossier-eleve.service';

declare const pdfMake: any;

@Component({
  selector: 'app-details-eleve',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './details-eleve.component.html',
  styleUrls: ['./details-eleve.component.css']
})
export class DetailsEleveComponent implements OnInit {

  activeTab: string = 'profil';

  eleve: any = null;
  tuteurs: any[] = [];
  notes: any[] = [];
  bulletins: any[] = [];
  absencesEtRetards: any[] = [];
  inscriptions: any[] = [];
  services: any[] = [];
  factures: any[] = [];

  totalAbsences: number = 0;
  totalRetards: number = 0;
  totalJustified: number = 0;

  errorMessage?: string;
  eleveDetails?: any;
  eleveId?: number;

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.eleveId = this.activatedRouter.snapshot.params['id'];
    if (this.eleveId) {
      this.getDetailsDossiersEleve(this.eleveId);
    }
  }

  getDetailsDossiersEleve(eleveId: number) {
    this.dossierEleveService.getDetailsDossierEleve(eleveId)
      .subscribe({
        next: (res) => {
          this.eleveDetails = res;
          console.log('Dossier complet de l\'élève :', this.eleveDetails);

          this.eleve = res.eleve;
          this.tuteurs = res.tuteurs || [];
          this.notes = res.notes || [];
          this.bulletins = res.bulletins || [];
          this.absencesEtRetards = res.absencesEtRetards || [];
          this.inscriptions = res.historiqueInscriptions || [];
          this.services = res.servicesSouscrits || [];
          this.factures = res.factures || [];

          this.totalAbsences = res.totalAbsences ?? 0;
          this.totalRetards = res.totalRetardsMinutes ?? 0;
          this.totalJustified = res.totalAbsencesJustifiees ?? 0;
        },
        error: (err) => {
          this.errorMessage = err;
          console.error('Erreur de chargement du dossier administratif', err);
        }
      });
  }

  switchTab(tabName: string): void {
    this.activeTab = tabName;
  }

  getMeilleureNoteEleve(): number | null {
    if (!this.notes || this.notes.length === 0) return null;
    return Math.max(...this.notes.map(n => n.note || 0));
  }

  getMoyenneNotes(): number | null {
    if (!this.notes || this.notes.length === 0) return null;
    const notesValides = this.notes.filter(n => n.note !== null && n.note !== undefined);
    if (notesValides.length === 0) return null;
    const total = notesValides.reduce((sum, n) => sum + n.note, 0);
    return Math.round((total / notesValides.length) * 10) / 10;
  }

  telechargerBulletin(bulletinId: number): void {
    console.log('Téléchargement du bulletin ID :', bulletinId);
  }

  imprimerDossier(data: EleveData): void {
    this.genererPDF(data);
  }

  genererPDF(data: EleveData): void {
    const formatDate = (date: string): string => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatMontant = (montant: number): string => {
      if (!montant) return 'N/A';
      return `${montant?.toString()} FCFA`;
    };

    const getNoteStyle = (note: number): string => {
      if (!note) return 'badgeDanger';
      if (note >= 16) return 'badgeSuccess';
      if (note >= 12) return 'badgeWarning';
      return 'badgeDanger';
    };

    const getMeilleureNote = (notes: any[]): number | null => {
      if (!notes || notes.length === 0) return null;
      const notesValides = notes.filter(n => n.note !== null && n.note !== undefined);
      if (notesValides.length === 0) return null;
      return Math.max(...notesValides.map(n => n.note));
    };

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: {
        columns: [
          {
            text: 'EduSchool',
            style: 'headerTitle',
            alignment: 'left'
          },
          {
            text: 'Fiche Élève',
            style: 'headerSubtitle',
            alignment: 'right'
          }
        ],
        margin: [40, 10, 40, 0]
      },
      footer: function (currentPage: number, pageCount: number) {
        return {
          columns: [
            {
              text: `Généré le ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}`,
              fontSize: 7,
              color: '#999999'
            },
            {
              text: `Page ${currentPage} / ${pageCount}`,
              fontSize: 7,
              color: '#999999',
              alignment: 'right'
            }
          ],
          margin: [40, 0, 40, 10]
        };
      },
      content: [],
      styles: {
        headerTitle: {
          fontSize: 16,
          bold: true,
          color: '#1e3a8a'
        },
        headerSubtitle: {
          fontSize: 10,
          color: '#64748b'
        },
        mainTitle: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          color: '#1e3a8a',
          margin: [0, 0, 0, 4]
        },
        subtitle: {
          fontSize: 11,
          alignment: 'center',
          color: '#64748b',
          margin: [0, 0, 0, 20]
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#1e3a8a',
          margin: [0, 12, 0, 6],
          decoration: 'underline',
          decorationColor: '#1e3a8a'
        },
        subsectionTitle: {
          fontSize: 10,
          bold: true,
          color: '#334155',
          margin: [0, 8, 0, 4]
        },
        label: {
          fontSize: 8,
          color: '#94a3b8',
          margin: [0, 3, 0, 3]
        },
        value: {
          fontSize: 9,
          color: '#0f172a',
          bold: true,
          margin: [0, 3, 0, 3]
        },
        tableHeader: {
          fontSize: 7,
          bold: true,
          color: '#ffffff',
          fillColor: '#1e3a8a',
          alignment: 'center',
          margin: [4, 5, 4, 5]
        },
        tableHeaderAlt: {
          fontSize: 7,
          bold: true,
          color: '#ffffff',
          fillColor: '#3b82f6',
          alignment: 'center',
          margin: [4, 5, 4, 5]
        },
        tableCell: {
          fontSize: 8,
          color: '#0f172a',
          margin: [4, 4, 4, 4]
        },
        tableCellBold: {
          fontSize: 8,
          color: '#0f172a',
          bold: true,
          margin: [4, 4, 4, 4]
        },
        statCard: {
          fontSize: 10,
          bold: true,
          color: '#0f172a',
          alignment: 'center',
          margin: [0, 3, 0, 3],
          background: '#f8fafc',
          padding: 8
        },
        statCardValue: {
          fontSize: 14,
          bold: true,
          color: '#1e3a8a',
          alignment: 'center'
        },
        badgeSuccess: {
          fontSize: 7,
          color: '#166534',
          bold: true,
          background: '#dcfce7',
          padding: [3, 2, 3, 2]
        },
        badgeDanger: {
          fontSize: 7,
          color: '#991b1b',
          bold: true,
          background: '#fee2e2',
          padding: [3, 2, 3, 2]
        },
        badgeWarning: {
          fontSize: 7,
          color: '#92400e',
          bold: true,
          background: '#fef3c7',
          padding: [3, 2, 3, 2]
        },
        emptyState: {
          fontSize: 9,
          color: '#94a3b8',
          alignment: 'center',
          margin: [0, 8, 0, 8]
        },
        separator: {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#e2e8f0'
            }
          ],
          margin: [0, 8, 0, 8]
        }
      }
    };

    const ajouterTexte = (text: string, style: string, margin: number[] = [0, 4, 0, 4]) => {
      docDefinition.content.push({ text, style, margin });
    };

    const ajouterTableau = (
      widths: string[],
      body: any[][],
      margin: number[] = [0, 4, 0, 12],
      layout: string = 'lightHorizontalLines'
    ) => {
      docDefinition.content.push({
        table: { widths, body },
        layout: layout,
        margin: margin
      });
    };

    const ajouterSeparateur = () => {
      docDefinition.content.push({
        canvas: [{
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 0.5,
          lineColor: '#e2e8f0'
        }],
        margin: [0, 6, 0, 6]
      });
    };

    // ===== 1. TITRE =====
    ajouterTexte('FICHE INDIVIDUELLE DE L\'ÉLÈVE', 'mainTitle', [0, 0, 0, 4]);
    ajouterTexte('Dossier Administratif et Scolaire', 'subtitle', [0, 0, 0, 16]);
    ajouterTexte('INFORMATIONS PERSONNELLES', 'sectionTitle');

    const infosBody = [
      [
        { text: 'Nom complet', style: 'label' },
        { text: `${data.eleve.prenom || ''} ${data.eleve.nom || ''}`, style: 'value' }
      ],
      [
        { text: 'Matricule', style: 'label' },
        { text: data.eleve.matriculeEleve || 'Non attribué', style: 'value' }
      ],
      [
        { text: 'Adresse', style: 'label' },
        { text: data.eleve.address || 'Non renseignée', style: 'value' }
      ],
      [
        { text: 'Statut', style: 'label' },
        {
          text: data.eleve.actif ? 'Scolarisé' : 'Inactif',
          style: data.eleve.actif ? 'badgeSuccess' : 'badgeDanger'
        }
      ]
    ];

    docDefinition.content.push({
      table: {
        widths: ['30%', '70%'],
        body: infosBody
      },
      layout: 'noBorders',
      margin: [0, 2, 0, 14]
    });

    ajouterSeparateur();

    ajouterTexte('INDICATEURS CLÉS', 'sectionTitle');

    docDefinition.content.push({
      columns: [
        {
          stack: [
            { text: 'Matricule', fontSize: 7, color: '#94a3b8', alignment: 'center' },
            { text: data.eleve.matriculeEleve || 'N/A', style: 'statCardValue' }
          ],
          style: 'statCard'
        },
        {
          stack: [
            { text: 'Meilleure Note', fontSize: 7, color: '#94a3b8', alignment: 'center' },
            { text: `${getMeilleureNote(data.notes) || 'N/A'} / 20`, style: 'statCardValue' }
          ],
          style: 'statCard'
        },
        {
          stack: [
            { text: 'Absences', fontSize: 7, color: '#94a3b8', alignment: 'center' },
            { text: `${data.totalAbsences || 0}`, style: 'statCardValue' }
          ],
          style: 'statCard'
        },
        {
          stack: [
            { text: 'Factures', fontSize: 7, color: '#94a3b8', alignment: 'center' },
            { text: `${data.factures?.length || 0}`, style: 'statCardValue' }
          ],
          style: 'statCard'
        }
      ],
      margin: [0, 2, 0, 14]
    });

    ajouterSeparateur();

    ajouterTexte('RESPONSABLES LÉGAUX', 'sectionTitle');

    if (data.tuteurs && data.tuteurs.length > 0) {
      const tuteursBody = [
        [
          { text: 'Nom complet', style: 'tableHeader' },
          { text: 'Téléphone', style: 'tableHeader' },
          { text: 'Email', style: 'tableHeader' },
          { text: 'Profession', style: 'tableHeader' }
        ],
        ...data.tuteurs.map(t => [
          { text: `${t.prenom || ''} ${t.nom || ''}`, style: 'tableCellBold' },
          { text: t.telephone || 'Non renseigné', style: 'tableCell' },
          { text: t.email || 'Non renseigné', style: 'tableCell' },
          { text: t.profession || 'Non renseignée', style: 'tableCell' }
        ])
      ];
      ajouterTableau(['22%', '26%', '32%', '20%'], tuteursBody);
    } else {
      ajouterTexte('Aucun tuteur enregistré', 'emptyState');
    }

    ajouterSeparateur();

    ajouterTexte('ÉVALUATIONS', 'sectionTitle');

    if (data.notes && data.notes.length > 0) {
      const notesBody = [
        [
          { text: 'Type d\'évaluation', style: 'tableHeader' },
          { text: 'Note', style: 'tableHeader' }
        ],
        ...data.notes.map(n => [
          { text: n.type || 'Non spécifié', style: 'tableCell' },
          {
            text: `${n.note || 'N/A'} / 20`,
            style: getNoteStyle(n.note)
          }
        ])
      ];
      ajouterTableau(['50%', '50%'], notesBody);
    } else {
      ajouterTexte('Aucune note enregistrée', 'emptyState');
    }

    ajouterSeparateur();

    ajouterTexte('ASSIDUITÉ', 'sectionTitle');

    docDefinition.content.push({
      columns: [
        {
          stack: [
            { text: 'Absences non justifiées', fontSize: 6, color: '#94a3b8', alignment: 'center' },
            { text: `${data.totalAbsences || 0}`, style: 'statCardValue' }
          ],
          style: 'statCard'
        },
        {
          stack: [
            { text: 'Minutes de retard', fontSize: 6, color: '#94a3b8', alignment: 'center' },
            { text: `${data.totalRetardsMinutes || 0}`, style: 'statCardValue' }
          ],
          style: 'statCard'
        },
        {
          stack: [
            { text: 'Absences justifiées', fontSize: 6, color: '#94a3b8', alignment: 'center' },
            { text: `${data.totalAbsencesJustifiees || 0}`, style: 'statCardValue' }
          ],
          style: 'statCard'
        }
      ],
      margin: [0, 2, 0, 10]
    });

    if (data.absencesEtRetards && data.absencesEtRetards.length > 0) {
      const absencesBody = [
        [
          { text: 'Date', style: 'tableHeader' },
          { text: 'Type', style: 'tableHeader' },
          { text: 'Durée', style: 'tableHeader' },
          { text: 'Justification', style: 'tableHeader' }
        ],
        ...data.absencesEtRetards.map(a => [
          { text: formatDate(a.attendanceDate), style: 'tableCell' },
          {
            text: a.attendanceStatus === 'ABSENCE' ? 'Absence' :
              a.attendanceStatus === 'LATE' ? 'Retard' : 'N/A',
            style: a.attendanceStatus === 'ABSENCE' ? 'badgeDanger' :
              a.attendanceStatus === 'LATE' ? 'badgeWarning' : 'badgeDanger'
          },
          {
            text: a.lateMinutes && a.lateMinutes !== 'null' ? `${a.lateMinutes} min` : '--',
            style: 'tableCell'
          },
          {
            text: a.justified ? 'Justifié' : 'Non justifié',
            style: a.justified ? 'badgeSuccess' : 'badgeDanger'
          }
        ])
      ];
      ajouterTableau(['22%', '22%', '22%', '34%'], absencesBody);
    } else {
      ajouterTexte('Aucun incident d\'assiduité', 'emptyState');
    }

    ajouterSeparateur();

    ajouterTexte('FINANCES', 'sectionTitle');

    if (data.historiqueInscriptions && data.historiqueInscriptions.length > 0) {
      ajouterTexte('Inscriptions', 'subsectionTitle', [0, 4, 0, 4]);

      const inscriptionsBody = [
        [
          { text: 'N° Dossier', style: 'tableHeader' },
          { text: 'Date', style: 'tableHeader' },
          { text: 'Montant', style: 'tableHeaderAlt' }
        ],
        ...data.historiqueInscriptions.map(i => [
          { text: i.code || 'N/A', style: 'tableCellBold' },
          { text: formatDate(i.dateInscription), style: 'tableCell' },
          { text: formatMontant(i.montantInscription), style: 'tableCellBold' } // ✅ formatMontant corrigé
        ])
      ];
      ajouterTableau(['34%', '33%', '33%'], inscriptionsBody);
    }

    if (data.factures && data.factures.length > 0) {
      ajouterTexte('Factures', 'subsectionTitle', [0, 8, 0, 4]);

      const facturesBody = [
        [
          { text: 'N° Facture', style: 'tableHeader' },
          { text: 'Période', style: 'tableHeader' },
          { text: 'Date', style: 'tableHeader' },
          { text: 'Montant', style: 'tableHeaderAlt' },
          { text: 'Statut', style: 'tableHeader' }
        ],
        ...data.factures.map(f => [
          { text: f.numeroFacture || 'N/A', style: 'tableCellBold' },
          {
            text: f.mois && f.annee ? `Mois ${f.mois}/${f.annee}` : 'Non spécifiée',
            style: 'tableCell'
          },
          { text: formatDate(f.dateFacture), style: 'tableCell' },
          { text: formatMontant(f.montant), style: 'tableCellBold' }, // ✅ formatMontant corrigé
          {
            text: f.etat || 'En attente',
            style: f.etat === 'PAYÉ' ? 'badgeSuccess' : 'badgeWarning'
          }
        ])
      ];
      ajouterTableau(['20%', '20%', '20%', '25%', '15%'], facturesBody);
    }
    pdfMake.createPdf(docDefinition).open();
  }


  getMeilleureNote(notes: any[]): number | null {
    if (!notes || notes.length === 0) return null;
    const notesValides = notes.filter(n => n.note !== null && n.note !== undefined);
    if (notesValides.length === 0) return null;
    return Math.max(...notesValides.map(n => n.note));
  }

  getNoteStyle(note: number): string {
    if (!note) return 'value';
    if (note >= 16) return 'badgeSuccess';
    if (note >= 12) return 'badgeWarning';
    return 'badgeDanger';
  }

  goBack(): void {
    window.history.back();
  }
}