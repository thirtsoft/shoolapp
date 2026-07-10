import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EleveData } from '../../../../../../core/models/dossiereleve/details-dossier-eleve';
import { DossierEleveService } from '../../../service/dossier-eleve.service';

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

  private avatarHommeBase64: string = '';
  private avatarFemmeBase64: string = '';

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.eleveId = this.activatedRouter.snapshot.params['id'];
    this.loadDefaultAvatars();

    if (this.eleveId) {
      this.getDetailsDossiersEleve(this.eleveId);
    }
  }

  private loadDefaultAvatars(): void {
    this.convertImageToBase64('assets/img/homme.png')
      .then(base64 => {
        this.avatarHommeBase64 = base64;
        console.log('✅ Avatar homme chargé');
      })
      .catch(err => console.error('❌ Erreur chargement avatar homme:', err));

    this.convertImageToBase64('assets/img/femme.png')
      .then(base64 => {
        this.avatarFemmeBase64 = base64;
        console.log('✅ Avatar femme chargé');
      })
      .catch(err => console.error('❌ Erreur chargement avatar femme:', err));
  }

  private convertImageToBase64(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Impossible de créer le contexte canvas'));
        }
      };

      img.onerror = () => reject(new Error(`Impossible de charger l'image : ${imagePath}`));
      img.src = imagePath;
    });
  }

  private getDefaultAvatar(sexe: string): string {
    const sexeLower = sexe?.toLowerCase() || '';
    if (sexeLower === 'féminin' || sexeLower === 'feminin' || sexeLower === 'f' || sexeLower === 'fille') {
      return this.avatarFemmeBase64 || '';
    }
    return this.avatarHommeBase64 || '';
  }

  getDetailsDossiersEleve(eleveId: number) {
    this.dossierEleveService.getDetailsDossierEleve(eleveId)
      .subscribe({
        next: (res) => {
          this.eleveDetails = res;
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

  switchTab(tabName: string): void { this.activeTab = tabName; }

  getMeilleureNoteEleve(): number | null {
    if (!this.notes || this.notes.length === 0) return null;
    return Math.max(...this.notes.map(n => n.note || 0));
  }

  telechargerBulletin(bulletinId: number): void {
    console.log('Téléchargement du bulletin ID :', bulletinId);
  }

  telechargerDossierJSON(): void {
    if (!this.eleveDetails) return;
    const dataStr = JSON.stringify(this.eleveDetails, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `dossier_eleve_${this.eleve?.matriculeEleve || 'inconnu'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  telechargerDossier(): void {
    if (!this.eleveDetails) {
      console.warn('Aucune donnée élève disponible');
      return;
    }
    this.genererDossierEleveEnPDF(this.eleveDetails, true);
  }

  imprimerDossier(data: EleveData): void {
    this.genererDossierEleveEnPDF(data);
  }

  genererDossierEleveEnPDF(data: EleveData, download: boolean = false): void {
    const PRIMARY = '#2c5282';
    const PRIMARY_DARK = '#1e3a5f';
    const PRIMARY_LIGHT = '#ebf4ff';
    const SUCCESS = '#38a169';
    const SUCCESS_LIGHT = '#f0fff4';
    const DANGER = '#e53e3e';
    const DANGER_LIGHT = '#fff5f5';
    const WARNING = '#d69e2e';
    const WARNING_LIGHT = '#fffff0';
    const GRAY_200 = '#e2e8f0';
    const GRAY_600 = '#718096';
    const GRAY_800 = '#2d3748';
    const WHITE = '#ffffff';

    const formatDate = (date: string): string => {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatMontant = (montant: number): string => {
      if (montant === null || montant === undefined) return '—';

      const nombre = Math.round(montant * 100) / 100;
      const parties = nombre.toString().split('.');

      const partieEntiere = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

      if (parties.length > 1 && parties[1] !== '00') {
        return `${partieEntiere},${parties[1]} FCFA`;
      }

      return `${partieEntiere} FCFA`;
    };

    const getMeilleureNote = (notes: any[]): number | null => {
      if (!notes || notes.length === 0) return null;
      const notesValides = notes.filter(n => n.note !== null && n.note !== undefined);
      if (notesValides.length === 0) return null;
      return Math.max(...notesValides.map(n => n.note));
    };

    const hasPhoto = data.eleve.piecesJointesDTO?.content;

    const docDefinition: any = {

      fonts: {
        Roboto: {
          normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
          italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
          bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
        }
      },

      defaultStyle: {
        font: 'Roboto',
        fontSize: 8,
        color: GRAY_800
      },

      pageSize: 'A4',
      pageMargins: [40, 45, 40, 45],

      header: function (currentPage: number, pageCount: number) {
        return {
          columns: [
            { text: 'ÉCOLE LES DAUPHINS', style: 'headerBar', alignment: 'left' },
            { text: 'DOSSIER ÉLÈVE', style: 'headerBar', alignment: 'right' }
          ],
          margin: [40, 0, 40, 0]
        };
      },

      footer: function (currentPage: number, pageCount: number) {
        return {
          columns: [
            { text: `Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, style: 'footerText' },
            { text: `Page ${currentPage} / ${pageCount}`, style: 'footerText', alignment: 'right' }
          ],
          margin: [40, 0, 40, 8]
        };
      },

      content: [],

      styles: {
        headerBar: { fontSize: 9, bold: true, color: WHITE, background: PRIMARY_DARK, margin: [8, 5, 8, 5] },
        footerText: { fontSize: 6, color: '#a0aec0' },

        documentTitle: { fontSize: 16, bold: true, color: PRIMARY_DARK, alignment: 'center', margin: [0, 0, 0, 2] },
        documentSubtitle: { fontSize: 8, color: GRAY_600, alignment: 'center', margin: [0, 0, 0, 16] },

        sectionTitle: {
          fontSize: 10, bold: true, color: PRIMARY_DARK, background: PRIMARY_LIGHT,
          alignment: 'center', margin: [0, 12, 0, 6], padding: [5, 10, 5, 10]
        },

        subSectionTitle: { fontSize: 9, bold: true, color: PRIMARY, alignment: 'left', margin: [0, 8, 0, 4] },

        identityName: { fontSize: 14, bold: true, color: PRIMARY_DARK, margin: [0, 2, 0, 2] },
        identityDetail: { fontSize: 8, color: GRAY_600, margin: [0, 1, 0, 1] },

        tableHeader: { fontSize: 7, bold: true, color: PRIMARY_DARK, fillColor: PRIMARY_LIGHT, alignment: 'center', margin: [4, 5, 4, 5] },
        tableHeaderLeft: { fontSize: 7, bold: true, color: PRIMARY_DARK, fillColor: PRIMARY_LIGHT, alignment: 'left', margin: [4, 5, 4, 5] },
        tableCell: { fontSize: 7, color: GRAY_800, alignment: 'center', margin: [4, 4, 4, 4] },
        tableCellLeft: { fontSize: 7, color: GRAY_800, alignment: 'left', margin: [4, 4, 4, 4] },
        tableCellBold: { fontSize: 7, color: GRAY_800, bold: true, alignment: 'center', margin: [4, 4, 4, 4] },
        tableCellBoldLeft: { fontSize: 7, color: GRAY_800, bold: true, alignment: 'left', margin: [4, 4, 4, 4] },

        badgeSuccess: { fontSize: 6, color: SUCCESS, bold: true, background: SUCCESS_LIGHT, alignment: 'center', margin: [2, 3, 2, 3] },
        badgeDanger: { fontSize: 6, color: DANGER, bold: true, background: DANGER_LIGHT, alignment: 'center', margin: [2, 3, 2, 3] },
        badgeWarning: { fontSize: 6, color: WARNING, bold: true, background: WARNING_LIGHT, alignment: 'center', margin: [2, 3, 2, 3] },

        statNumber: { fontSize: 16, bold: true, color: PRIMARY_DARK, alignment: 'center' },
        statLabel: { fontSize: 6, color: GRAY_600, alignment: 'center', margin: [0, 1, 0, 0] },

        emptyState: { fontSize: 8, color: GRAY_600, alignment: 'center', margin: [0, 6, 0, 6] },
      }
    };

    const content = docDefinition.content;

    const addText = (text: string, style: string, margin?: number[]) => {
      content.push({ text, style, margin: margin || [0, 3, 0, 3] });
    };

    const addTable = (widths: string[], body: any[][], margin?: number[]) => {
      content.push({
        table: { widths, body },
        layout: {
          hLineWidth: function (i: number, node: any) { return i === 0 || i === 1 ? 0.5 : 0.5; },
          vLineWidth: function () { return 0; },
          hLineColor: function (i: number) { return i === 1 ? PRIMARY : GRAY_200; },
          paddingLeft: function (i: number) { return i === 0 ? 6 : 3; },
          paddingRight: function (i: number, node: any) { return 3; },
          paddingTop: function (i: number) { return i === 0 ? 6 : 4; },
          paddingBottom: function (i: number) { return i === 0 ? 6 : 4; }
        },
        margin: margin || [0, 3, 0, 10]
      });
    };

    const addSeparator = () => {
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: GRAY_200 }],
        margin: [0, 6, 0, 6]
      });
    };

    const addStatCards = (stats: { label: string; value: string; color?: string }[]) => {
      content.push({
        columns: stats.map(s => ({
          stack: [
            { text: s.value, style: 'statNumber', color: s.color || PRIMARY_DARK },
            { text: s.label, style: 'statLabel' }
          ],
          alignment: 'center',
          margin: [3, 0, 3, 0]
        })),
        margin: [0, 3, 0, 8]
      });
    };

    addText('FICHE INDIVIDUELLE ÉLÈVE', 'documentTitle');
    addText('Dossier administratif et scolaire • Année 2025-2026', 'documentSubtitle');


    addText('IDENTITÉ DE L\'ÉLÈVE', 'sectionTitle');

    let rightImage: string | null = null;
    let imageWidth = 70;
    let imageHeight = 70;

    if (hasPhoto) {
      const ext = data.eleve?.piecesJointesDTO?.nomTechnique?.endsWith('.png') ? 'png' : 'jpeg';
      rightImage = `data:image/${ext};base64,${data.eleve?.piecesJointesDTO?.content}`;
    } else {
      rightImage = this.getDefaultAvatar(data.eleve.sexe);
      imageWidth = 65;
      imageHeight = 65;
    }
    const identityColumns: any[] = [
      {
        width: '*',
        stack: [
          { text: `${data.eleve.prenom || ''} ${data.eleve.nom || ''}`, style: 'identityName' },
          { text: `Matricule : ${data.eleve.matriculeEleve || 'N/A'}  •  Sexe : ${data.eleve.sexe || 'N/A'}`, style: 'identityDetail' },
          { text: `Né(e) le ${formatDate(data.eleve.dateNaissance)} à ${data.eleve.lieuNaissance || 'N/A'}`, style: 'identityDetail' },
          { text: `Adresse : ${data.eleve.address || 'Non renseignée'}`, style: 'identityDetail' },
          {
            text: data.eleve.actif ? '● Élève scolarisé' : '● Élève inactif',
            style: data.eleve.actif ? 'badgeSuccess' : 'badgeDanger',
            margin: [0, 4, 0, 0]
          }
        ]
      }
    ];

    if (rightImage) {
      identityColumns.push({
        width: 80,
        stack: [
          {
            image: rightImage,
            width: imageWidth,
            height: imageHeight,
            alignment: 'center',
            margin: [10, 5, 0, 0]
          }
        ]
      });
    }

    content.push({
      columns: identityColumns,
      margin: [0, 0, 0, 10]
    });

    addSeparator();

    addText('INDICATEURS CLÉS', 'sectionTitle');
    addStatCards([
      { label: 'Meilleure note', value: `${getMeilleureNote(data.notes) || '—'} /20` },
      { label: 'Absences', value: `${data.totalAbsences || 0}`, color: DANGER },
      { label: 'Retards (min)', value: `${data.totalRetardsMinutes || 0}`, color: WARNING },
      { label: 'Factures', value: `${data.factures?.length || 0}` }
    ]);
    addSeparator();

    addText('RESPONSABLES LÉGAUX', 'sectionTitle');
    if (data.tuteurs && data.tuteurs.length > 0) {
      const tuteursBody = [
        [
          { text: 'Nom complet', style: 'tableHeaderLeft' },
          { text: 'Téléphone', style: 'tableHeader' },
          { text: 'Email', style: 'tableHeader' }
        ],
        ...data.tuteurs.map(t => [
          { text: `${t.prenom || ''} ${t.nom || ''}`, style: 'tableCellBoldLeft' },
          { text: t.telephone || '—', style: 'tableCell' },
          { text: t.email || '—', style: 'tableCell' }
        ])
      ];
      addTable(['35%', '25%', '40%'], tuteursBody);
    } else {
      addText('Aucun responsable légal enregistré.', 'emptyState');
    }
    addSeparator();

    addText('NOTES ET ÉVALUATIONS', 'sectionTitle');
    if (data.notes && data.notes.length > 0) {
      const notesBody = [
        [
          { text: 'Type d\'évaluation', style: 'tableHeaderLeft' },
          { text: 'Note', style: 'tableHeader' },
          { text: 'Appréciation', style: 'tableHeader' }
        ],
        ...data.notes.map(n => [
          { text: n.type || 'Non spécifié', style: 'tableCellLeft' },
          {
            text: `${n.note || '—'} /20`,
            style: n.note >= 16 ? 'badgeSuccess' : n.note >= 12 ? 'badgeWarning' : 'badgeDanger'
          },
          { text: n.note >= 16 ? 'Excellent' : n.note >= 12 ? 'Bien' : n.note >= 10 ? 'Passable' : 'Insuffisant', style: 'tableCell' }
        ])
      ];
      addTable(['40%', '20%', '40%'], notesBody);
    } else {
      addText('Aucune note enregistrée.', 'emptyState');
    }

    if (data.bulletins && data.bulletins.length > 0) {
      addText('Bulletins', 'subSectionTitle', [0, 8, 0, 3]);
      const bulletinsBody = [
        [
          { text: 'Période', style: 'tableHeaderLeft' },
          { text: 'Moyenne', style: 'tableHeader' },
          { text: 'Rang', style: 'tableHeader' }
        ],
        ...data.bulletins.map(b => [
          { text: b.periode || '—', style: 'tableCellLeft' },
          { text: `${b.moyenne || '—'} /20`, style: 'tableCellBold' },
          { text: b.rang || '—', style: 'tableCell' }
        ])
      ];
      addTable(['45%', '30%', '25%'], bulletinsBody);
    }
    addSeparator();

    addText('ASSIDUITÉ', 'sectionTitle');
    addStatCards([
      { label: 'Absences non justifiées', value: `${data.totalAbsences || 0}`, color: DANGER },
      { label: 'Minutes de retard', value: `${data.totalRetardsMinutes || 0}`, color: WARNING },
      { label: 'Absences justifiées', value: `${data.totalAbsencesJustifiees || 0}`, color: SUCCESS }
    ]);

    if (data.absencesEtRetards && data.absencesEtRetards.length > 0) {
      const absencesBody = [
        [
          { text: 'Date', style: 'tableHeaderLeft' },
          { text: 'Type', style: 'tableHeader' },
          { text: 'Durée', style: 'tableHeader' },
          { text: 'Justification', style: 'tableHeader' }
        ],
        ...data.absencesEtRetards.map(a => [
          { text: formatDate(a.attendanceDate), style: 'tableCellLeft' },
          {
            text: a.attendanceStatus === 'ABSENCE' ? 'Absence' : a.attendanceStatus === 'LATE' ? 'Retard' : '—',
            style: a.attendanceStatus === 'ABSENCE' ? 'badgeDanger' : a.attendanceStatus === 'LATE' ? 'badgeWarning' : 'tableCell'
          },
          { text: a.lateMinutes && a.lateMinutes !== 'null' ? `${a.lateMinutes} min` : '—', style: 'tableCell' },
          { text: a.justified ? 'Justifié' : 'Non justifié', style: a.justified ? 'badgeSuccess' : 'badgeDanger' }
        ])
      ];
      addTable(['25%', '20%', '20%', '35%'], absencesBody);
    } else {
      addText('Aucun incident d\'assiduité.', 'emptyState');
    }
    addSeparator();

    addText('FINANCES', 'sectionTitle');

    if (data.historiqueInscriptions && data.historiqueInscriptions.length > 0) {
      addText('Inscriptions', 'subSectionTitle');
      const inscriptionsBody = [
        [
          { text: 'N° Dossier', style: 'tableHeaderLeft' },
          { text: 'Date', style: 'tableHeader' },
          { text: 'Montant', style: 'tableHeader' },
          { text: 'Statut', style: 'tableHeader' }
        ],
        ...data.historiqueInscriptions.map(i => [
          { text: i.code || '—', style: 'tableCellBoldLeft' },
          { text: formatDate(i.dateInscription), style: 'tableCell' },
          { text: formatMontant(i.montantInscription), style: 'tableCellBold' },
          { text: i.actif ? 'Actif' : 'Inactif', style: i.actif ? 'badgeSuccess' : 'badgeDanger' }
        ])
      ];
      addTable(['30%', '20%', '25%', '25%'], inscriptionsBody, [0, 3, 0, 6]);
    }

    if (data.servicesSouscrits && data.servicesSouscrits.length > 0) {
      addText('Services souscrits', 'subSectionTitle');
      const servicesBody = [
        [
          { text: 'Service', style: 'tableHeaderLeft' },
          { text: 'Date inscription', style: 'tableHeader' },
          { text: 'Statut', style: 'tableHeader' }
        ],
        ...data.servicesSouscrits.map(s => [
          { text: 'Service scolaire', style: 'tableCellLeft' },
          { text: formatDate(s.dateInscription), style: 'tableCell' },
          { text: s.actif ? 'Actif' : 'Inactif', style: s.actif ? 'badgeSuccess' : 'badgeDanger' }
        ])
      ];
      addTable(['45%', '30%', '25%'], servicesBody, [0, 3, 0, 6]);
    }

    if (data.factures && data.factures.length > 0) {
      addText('Factures', 'subSectionTitle');
      const facturesBody = [
        [
          { text: 'N° Facture', style: 'tableHeaderLeft' },
          { text: 'Période', style: 'tableHeader' },
          { text: 'Date', style: 'tableHeader' },
          { text: 'Montant', style: 'tableHeader' },
          { text: 'Statut', style: 'tableHeader' }
        ],
        ...data.factures.map(f => [
          { text: f.numeroFacture || '—', style: 'tableCellBoldLeft' },
          { text: f.mois && f.annee ? `Mois ${f.mois}/${f.annee}` : '—', style: 'tableCell' },
          { text: formatDate(f.dateFacture), style: 'tableCell' },
          { text: formatMontant(f.montant), style: 'tableCellBold' },
          { text: f.etat || 'En attente', style: f.etat === 'PAYÉ' ? 'badgeSuccess' : 'badgeWarning' }
        ])
      ];
      addTable(['25%', '18%', '18%', '22%', '17%'], facturesBody);
    }

    if (!data.historiqueInscriptions?.length && !data.factures?.length && !data.servicesSouscrits?.length) {
      addText('Aucune donnée financière disponible.', 'emptyState');
    }
    if (download) {
      pdfMake.createPdf(docDefinition).download(`dossier_eleve_${data.eleve.matriculeEleve || 'inconnu'}.pdf`);
    } else {
      pdfMake.createPdf(docDefinition).open();
    }
  }

  getMeilleureNote(notes: any[]): number | null {
    if (!notes || notes.length === 0) return null;
    const notesValides = notes.filter(n => n.note !== null && n.note !== undefined);
    if (notesValides.length === 0) return null;
    return Math.max(...notesValides.map(n => n.note));
  }

  goBack(): void {
    window.history.back();
  }
}