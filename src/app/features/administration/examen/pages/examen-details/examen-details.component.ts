import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ExamenDetailsResponse, RenseignerResultatsExamenRequest } from '../../../../../core/models/examen/eleve-examen-response';

import { firstValueFrom } from 'rxjs';
import { OrganizationMiniResponse } from '../../../../../core/models/onboarding/organization/organization-mini-response';
import { DateformatService } from '../../../../../core/services/date-format.service';
import { ConfigOrganizationService } from '../../../configorganization/services/configorganization.service';
import { ExamenResourceService } from '../../service/examen-resource.service';

declare const pdfMake: any;

@Component({
  selector: 'app-examen-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './examen-details.component.html',
  styleUrls: ['./examen-details.component.css']
})
export class ExamenDetailsComponent implements OnInit {

  private readonly REDIRECT_PATH = '/admin/examen';

  private readonly examenService = inject(ExamenResourceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastrService);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly dateFormat = inject(DateformatService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  examenDetailsResponse?: ExamenDetailsResponse;

  examenUuId?: string;

  recherche = '';

  filtreSituation:
    | 'TOUTES'
    | 'NON_RENSEIGNE'
    | 'ADMIS'
    | 'AJOURNE'
    | 'ABSENT' = 'TOUTES';

  exportingPdf = signal(false);

  logoPreview: string | null = null;
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  private readonly PDF_COLORS = {
    primary: '#245DA2',
    primaryDark: '#173B72',
    primaryLight: '#EAF1FB',

    text: '#253247',
    textSecondary: '#737D8D',

    border: '#E1E5EB',
    background: '#F7F8FA',
    white: '#FFFFFF',

    success: '#298653',
    successLight: '#EAF7EF',

    warning: '#A76B00',
    warningLight: '#FFF5DF',

    danger: '#C94D4D',
    dangerLight: '#FFF1F1'
  };

  ngOnInit(): void {

    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (!uuid) {
      this.toastService.error('Erreur', 'Identifiant examen introuvable.');
      this.retourListe();
      return;
    }

    this.examenUuId = uuid;

    this.chargerExamenDetails(uuid);

    this.loadOrganizationInfos();
  }

  private loadOrganizationInfos(): void {
    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.error.set('Organisation non trouvée');
      this.loading.set(false);
      this.toastService.warning('Attention', 'Organisation non trouvée');
      return;
    }

    this.loading.set(true);
    this.organizationConfigService.getOrganizationConfigInfos(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.organizationData = response;
          this.loadLogo(this.organizationData);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement organisation:', error);
          this.toastService.error('Erreur', 'Impossible de charger les informations');
          this.loading.set(false);
        }
      });
  }

  private loadLogo(organization: OrganizationMiniResponse): void {

    this.logoPreview = null;

    if (!organization.logo?.available || !organization.logo.logoUuid) {
      return;
    }
    this.organizationConfigService.getLogoContent(organization.logo.logoUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.logoPreview = URL.createObjectURL(blob);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du logo :', error);
          this.logoPreview = null;
        }
      });
  }

  private async getOrganizationLogoBase64(): Promise<string | null> {
    const logoUuid = this.organizationData?.logo?.logoUuid;
    if (!this.organizationData?.logo?.available || !logoUuid) {
      return null;
    }

    try {
      const blob = await firstValueFrom(this.organizationConfigService.getLogoContent(logoUuid));

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error(
        'Impossible de récupérer le logo de l’organisation pour le PDF :',
        error
      );
      return null;
    }
  }


  private async getScoolliLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/scoolli-logo.png');
      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result as string);
        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Impossible de charger le logo Scoolli :', error);
      return null;
    }
  }

  chargerExamenDetails(examenUuid: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.examenService
      .getDetailsExamen(examenUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (response: ExamenDetailsResponse) => {

          this.examenDetailsResponse = response;

          this.loading.set(false);
        },

        error: error => {

          console.error('Erreur récupération examen details :', error);

          this.loading.set(false);

          this.errorMessage.set(error?.error?.message ?? 'Impossible de charger les détails de l’examen.');

          this.toastService.error('Erreur', this.errorMessage());
        }

      });
  }

  get elevesFiltres() {
    const eleves = this.examenDetailsResponse?.eleves ?? [];
    const recherche = this.recherche.trim().toLowerCase();

    return eleves.filter(eleve => {

      const correspondRecherche =
        !recherche ||
        `${eleve.nom ?? ''} ${eleve.prenom ?? ''}`
          .toLowerCase()
          .includes(recherche) ||

        (eleve.matricule ?? '')
          .toLowerCase()
          .includes(recherche) ||

        (eleve.libelleClasse ?? '')
          .toLowerCase()
          .includes(recherche);

      const statut = eleve.resultatExamenStatut;

      let correspondSituation = true;

      switch (this.filtreSituation) {

        case 'NON_RENSEIGNE':
          correspondSituation = statut == null;
          break;

        case 'ADMIS':
          correspondSituation = statut === 'ADMIS';
          break;

        case 'AJOURNE':
          correspondSituation = statut === 'AJOURNE';
          break;

        case 'ABSENT':
          correspondSituation = statut === 'ABSENT';
          break;

        default:
          correspondSituation = true;
      }

      return correspondRecherche && correspondSituation;
    });
  }

  enregistrerResultats(): void {

    if (!this.examenUuId) {
      this.toastService.error('Erreur', 'Identifiant de l’examen introuvable.');
      return;
    }

    if (!this.examenDetailsResponse) {
      return;
    }

    const eleves = this.examenDetailsResponse.eleves ?? [];

    const resultats = eleves
      .filter(eleve => eleve.resultatExamenStatut != null)
      .map(eleve => ({
        eleveUuid: eleve.eleveUuid,
        resultatExamenStatut: eleve.resultatExamenStatut!
      }));

    if (resultats.length === 0) {
      this.toastService.warning('Résultats', 'Veuillez renseigner au moins une situation avant d’enregistrer.');

      return;
    }

    const request: RenseignerResultatsExamenRequest = {
      examenUuid: this.examenUuId,
      resultats
    };

    this.saving.set(true);

    console.log('payload send', request);

    this.examenService
      .renseignerResultats(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toastService.success(
            'Résultats enregistrés',
            `${resultats.length} résultat${resultats.length > 1 ? 's' : ''
            } enregistré${resultats.length > 1 ? 's' : ''
            } avec succès.`
          );

          this.chargerExamenDetails(this.examenUuId!);
        },

        error: error => {

          console.error('Erreur enregistrement résultats :', error);

          this.saving.set(false);

          this.toastService.error(
            'Erreur', error?.error?.message ??
          'Impossible d’enregistrer les résultats de l’examen.'
          );
        }

      });
  }

  getInitiales(nom?: string, prenom?: string): string {
    const premiereLettrePrenom = prenom?.trim()?.charAt(0) ?? '';
    const premiereLettreNom = nom?.trim()?.charAt(0) ?? '';
    return (premiereLettrePrenom + premiereLettreNom).toUpperCase();
  }

  getLibelleStatut(statut?: string | null): string {
    switch (statut) {

      case 'ADMIS':
        return 'Admis';

      case 'AJOURNE':
        return 'Ajourné';

      case 'ABSENT':
        return 'Absent';

      default:
        return 'Sélectionner une situation';
    }
  }

  getClasseResultat(statut?: string | null): string {
    switch (statut) {

      case 'ADMIS':
        return 'result-admis';

      case 'AJOURNE':
        return 'result-ajourne';

      case 'ABSENT':
        return 'result-absent';

      default:
        return '';
    }
  }

  get progression(): number {
    return this.examenDetailsResponse?.progression ?? 0;
  }

  get nombreEleves(): number {
    return this.examenDetailsResponse?.nombreEleves ?? 0;
  }

  get nombreResultats(): number {
    return this.examenDetailsResponse?.nombreResultats ?? 0;
  }

  get nombreRestants(): number {
    return Math.max(0, this.nombreEleves - this.nombreResultats);
  }

  async exporterPdf(): Promise<void> {
    if (!this.examenUuId) {
      this.toastService.error(
        'Impossible d’exporter : examen introuvable.', 'Erreur'
      );
      return;
    }

    if (!this.examenDetailsResponse) {
      this.toastService.error(
        'Les données de l’examen ne sont pas disponibles.',
        'Erreur'
      );
      return;
    }

    this.exportingPdf.set(true);

    try {
      const [logoEcole, logoScoolli] = await Promise.all([
        this.getOrganizationLogoBase64(),
        this.getScoolliLogoBase64()
      ]);

      const documentDefinition = this.buildExamenPdf(
        logoEcole, logoScoolli
      );

      pdfMake.createPdf(documentDefinition).download(this.getNomFichierPdf());

      this.toastService.success(
        'Le PDF a été généré avec succès.', 'Export terminé'
      );

    } catch (error) {
      console.error('Erreur génération PDF examen :', error);

      this.toastService.error(
        'Impossible de générer le document PDF.', 'Erreur'
      );

    } finally {
      this.exportingPdf.set(false);
    }
  }

  private buildExamenPdf(logoEcole: string | null, logoScoolli: string | null): any {

    const examen = this.examenDetailsResponse!;

    return {

      pageSize: 'A4',

      pageOrientation: 'portrait',

      pageMargins: [35, 35, 35, 45],

      defaultStyle: { font: 'Roboto', fontSize: 9, color: this.PDF_COLORS.text },

      header: (currentPage: number) => {
        if (currentPage === 1) {
          return null;
        }

        return {
          margin: [35, 18, 35, 0],
          columns: [
            {
              text: examen.libelle ?? 'Examen national',
              style: 'headerMiniTitle'
            },
            {
              text: examen.libelleAnneeScolaire ?? '',
              alignment: 'right',
              style: 'headerMiniYear'
            }
          ]
        };
      },

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [35, 4, 35, 10],

          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 525,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: '#D9DEE6'
                }
              ],
              margin: [0, 0, 0, 4]
            },

            {
              columns: [
                {
                  text: 'Document généré avec Scoolli · scoolli.com',
                  style: 'footerText',
                  alignment: 'left'
                },
                {
                  text: `Page ${currentPage} / ${pageCount}`,
                  style: 'footerText',
                  alignment: 'right'
                }
              ]
            },
            {
              text: 'Une solution Wokite Technologies & Innovation.',
              style: 'footerCompany',
              alignment: 'center',
              margin: [0, 2, 0, 0]
            }
          ]
        };
      },

      content: [

        this.buildOrganizationHeader(logoEcole),

        this.buildExamTitle(),

        this.buildExamInformations(),

        this.buildResultSummary(),

        this.buildCandidatesSection(),

        this.buildSignatureSection()

      ],

      styles: {

        organizationName: {
          fontSize: 15,
          bold: true,
          color: this.PDF_COLORS.primaryDark
        },

        organizationSigle: {
          fontSize: 9,
          bold: true,
          color: this.PDF_COLORS.textSecondary
        },

        organizationInfo: {
          fontSize: 8,
          color: this.PDF_COLORS.textSecondary,
          lineHeight: 1.25
        },

        examMainTitle: {
          fontSize: 17,
          bold: true,
          color: this.PDF_COLORS.primaryDark,
          alignment: 'center'
        },

        examSubtitle: {
          fontSize: 9,
          bold: true,
          color: this.PDF_COLORS.textSecondary,
          alignment: 'center',
          characterSpacing: 0.5
        },

        examCode: {
          fontSize: 12,
          bold: true,
          color: this.PDF_COLORS.primaryDark,
          alignment: 'center'
        },

        sectionTitle: {
          fontSize: 9,
          bold: true,
          color: this.PDF_COLORS.primaryDark,
          characterSpacing: 0.3
        },

        infoLabel: {
          fontSize: 7,
          bold: true,
          color: this.PDF_COLORS.textSecondary
        },

        infoValue: {
          fontSize: 9,
          bold: true,
          color: this.PDF_COLORS.text
        },

        statValue: {
          fontSize: 15,
          bold: true,
          color: this.PDF_COLORS.primaryDark,
          alignment: 'center'
        },

        statLabel: {
          fontSize: 7,
          bold: true,
          color: this.PDF_COLORS.textSecondary,
          alignment: 'center'
        },

        successValue: {
          fontSize: 15,
          bold: true,
          color: this.PDF_COLORS.success,
          alignment: 'center'
        },

        tableHeader: {
          fontSize: 7.5,
          bold: true,
          color: this.PDF_COLORS.white,
          alignment: 'left'
        },

        tableCell: {
          fontSize: 8,
          color: this.PDF_COLORS.text
        },

        tableCellCenter: {
          fontSize: 8,
          color: this.PDF_COLORS.text,
          alignment: 'center'
        },

        footerText: {
          fontSize: 6.5,
          color: '#687282'
        },

        footerCompany: {
          fontSize: 6,
          color: '#9AA2AD',
          italics: true
        },

        headerMiniTitle: {
          fontSize: 7,
          bold: true,
          color: this.PDF_COLORS.primaryDark
        },

        headerMiniYear: {
          fontSize: 7,
          color: this.PDF_COLORS.textSecondary
        },

        signatureTitle: {
          fontSize: 8,
          bold: true,
          color: this.PDF_COLORS.text
        }
      }
    };
  }

  private buildOrganizationHeader(logoEcole: string | null): any {
    const organization = this.organizationData;
    const nomEcole = organization.libelle || organization.sigle || 'Établissement scolaire';

    const informations: any[] = [];

    if (organization.sigle && organization.sigle !== organization.libelle) {
      informations.push({
        text: organization.sigle,
        style: 'organizationSigle',
        margin: [0, 1, 0, 3]
      });
    }

    if (organization.adresse) {
      informations.push({
        text: organization.adresse,
        style: 'organizationInfo'
      });
    }

    const telephones = [
      organization.mobile,
      organization.telephone
    ].filter(Boolean).join(' / ');

    if (telephones) {
      informations.push({
        text: `Tél. : ${telephones}`,
        style: 'organizationInfo'
      });
    }

    if (organization.email) {
      informations.push({
        text: `Email : ${organization.email}`,
        style: 'organizationInfo'
      });
    }

    if (organization.siteWeb) {
      informations.push({
        text: organization.siteWeb,
        style: 'organizationInfo'
      });
    }

    if (organization.boitePostale) {
      informations.push({
        text: `B.P. : ${organization.boitePostale}`,
        style: 'organizationInfo'
      });
    }

    if (organization.slogan) {
      informations.push({
        text: organization.slogan,
        italics: true,
        fontSize: 8,
        color: this.PDF_COLORS.primary,
        margin: [0, 4, 0, 0]
      });
    }

    const body: any[][] = [];

    if (logoEcole) {
      body.push([
        {
          image: logoEcole,
          fit: [60, 60],
          alignment: 'center',
          margin: [0, 3, 10, 3]
        },
        {
          stack: [
            {
              text: nomEcole,
              style: 'organizationName'
            },
            ...informations
          ],
          margin: [0, 2, 0, 2]
        }
      ]);
    } else {
      body.push([
        {
          stack: [
            {
              text: nomEcole,
              style: 'organizationName'
            },
            ...informations
          ]
        }
      ]);
    }

    return {
      table: {
        widths: logoEcole ? [75, '*'] : ['*'],
        body
      },

      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      },

      margin: [0, 0, 0, 15]
    };
  }

  private buildExamTitle(): any {
    const examen = this.examenDetailsResponse!;

    return {
      stack: [

        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 525,
              h: 4,
              color: this.PDF_COLORS.primary
            }
          ],
          margin: [0, 0, 0, 14]
        },

        {
          text: 'LISTE DES RÉSULTATS',
          style: 'examMainTitle',
          margin: [0, 0, 0, 3]
        },

        {
          text: 'EXAMEN NATIONAL',
          style: 'examSubtitle',
          margin: [0, 0, 0, 8]
        },

        {
          text: examen.libelle || examen.code || 'Examen national',
          style: 'examCode',
          margin: [0, 0, 0, 2]
        },

        {
          text: examen.libelleAnneeScolaire || '',
          fontSize: 9,
          color: this.PDF_COLORS.textSecondary,
          alignment: 'center',
          margin: [0, 0, 0, 15]
        }
      ]
    };
  }

  private buildExamInformations(): any {

    const examen = this.examenDetailsResponse!;

    return {
      margin: [0, 0, 0, 14],

      table: {
        widths: ['auto', '*', 'auto', '*'],

        body: [
          [
            {
              text: 'EXAMEN',
              style: 'infoLabel',
              fillColor: this.PDF_COLORS.primaryLight
            },
            {
              text: examen.code || '-',
              style: 'infoValue'
            },
            {
              text: 'NIVEAU',
              style: 'infoLabel',
              fillColor: this.PDF_COLORS.primaryLight
            },
            {
              text: examen.libelleNiveau || '-',
              style: 'infoValue'
            }
          ],

          [
            {
              text: 'ANNÉE SCOLAIRE',
              style: 'infoLabel',
              fillColor: this.PDF_COLORS.primaryLight
            },
            {
              text: examen.libelleAnneeScolaire || '-',
              style: 'infoValue'
            },
            {
              text: 'ÉTAT',
              style: 'infoLabel',
              fillColor: this.PDF_COLORS.primaryLight
            },
            {
              text: examen.libelleEtat || '-',
              style: 'infoValue'
            }
          ]
        ]
      },

      layout: {
        hLineColor: () => this.PDF_COLORS.border,
        vLineColor: () => this.PDF_COLORS.border,
        hLineWidth: () => 0.6,
        vLineWidth: () => 0.6,

        paddingLeft: () => 7,
        paddingRight: () => 7,
        paddingTop: () => 6,
        paddingBottom: () => 6
      }
    };
  }

  private buildResultSummary(): any {

    const examen = this.examenDetailsResponse!;

    const nombreResultats = examen.nombreResultats ?? 0;
    const nombreAdmis = examen.nombreAdmis ?? 0;
    const nombreAjournes = examen.nombreAjournes ?? 0;
    const nombreAbsents = examen.nombreAbsents ?? 0;
    const pourcentage = examen.pourcentageReussite ?? 0;

    return {
      margin: [0, 0, 0, 18],

      stack: [

        {
          text: 'RÉSULTATS DE L’EXAMEN',
          style: 'sectionTitle',
          margin: [0, 0, 0, 7]
        },

        {
          table: {
            widths: ['*', '*', '*', '*'],

            body: [
              [
                this.buildPdfStat(
                  nombreResultats,
                  'RÉSULTATS RENSEIGNÉS'
                ),

                this.buildPdfStat(
                  nombreAdmis,
                  'ADMIS'
                ),

                this.buildPdfStat(
                  nombreAjournes,
                  'AJOURNÉS'
                ),

                this.buildPdfStat(
                  nombreAbsents,
                  'ABSENTS'
                )
              ]
            ]
          },

          layout: {
            hLineColor: () => this.PDF_COLORS.border,
            vLineColor: () => this.PDF_COLORS.border,
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,

            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 8,
            paddingBottom: () => 8
          }
        },

        {
          margin: [0, 10, 0, 0],

          table: {
            widths: ['*'],

            body: [
              [
                {
                  stack: [
                    {
                      text: 'TAUX DE RÉUSSITE',
                      fontSize: 7,
                      bold: true,
                      color: this.PDF_COLORS.textSecondary,
                      alignment: 'center'
                    },
                    {
                      text: `${pourcentage.toFixed(2).replace('.', ',')} %`,
                      style: 'successValue',
                      margin: [0, 3, 0, 0]
                    }
                  ],
                  fillColor: this.PDF_COLORS.primaryLight
                }
              ]
            ]
          },

          layout: {
            hLineColor: () => this.PDF_COLORS.primary,
            vLineColor: () => this.PDF_COLORS.primary,
            hLineWidth: () => 0.8,
            vLineWidth: () => 0.8,

            paddingTop: () => 7,
            paddingBottom: () => 7
          }
        }
      ]
    };
  }

  private buildPdfStat(value: number, label: string): any {
    return {
      stack: [
        {
          text: String(value),
          style: 'statValue'
        },
        {
          text: label,
          style: 'statLabel',
          margin: [0, 2, 0, 0]
        }
      ]
    };
  }

  private buildCandidatesSection(): any {

    const eleves = this.examenDetailsResponse?.eleves ?? [];

    const rows: any[][] = [

      [
        {
          text: 'N°',
          style: 'tableHeader',
          fillColor: this.PDF_COLORS.primary,
          alignment: 'center'
        },
        {
          text: 'ÉLÈVE',
          style: 'tableHeader',
          fillColor: this.PDF_COLORS.primary
        },
        {
          text: 'MATRICULE',
          style: 'tableHeader',
          fillColor: this.PDF_COLORS.primary
        },
        {
          text: 'CLASSE',
          style: 'tableHeader',
          fillColor: this.PDF_COLORS.primary
        },
        {
          text: 'SITUATION',
          style: 'tableHeader',
          fillColor: this.PDF_COLORS.primary,
          alignment: 'center'
        }
      ]
    ];

    eleves.forEach((eleve, index) => {

      const nomComplet = [
        eleve.prenom,
        eleve.nom
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      rows.push([
        {
          text: String(index + 1),
          style: 'tableCellCenter'
        },

        {
          text: nomComplet || '-',
          style: 'tableCell'
        },

        {
          text: eleve.matricule || '-',
          style: 'tableCell'
        },

        {
          text: eleve.libelleClasse || '-',
          style: 'tableCell'
        },

        this.buildPdfStatut(eleve.resultatExamenStatut)
      ]);
    });

    return {

      stack: [

        {
          text: 'LISTE DES CANDIDATS',
          style: 'sectionTitle',
          margin: [0, 0, 0, 7]
        },

        {
          table: {
            headerRows: 1,

            widths: [
              25,
              '*',
              92,
              65,
              82
            ],

            body: rows
          },

          layout: {
            hLineColor: () => this.PDF_COLORS.border,
            vLineColor: () => this.PDF_COLORS.border,

            hLineWidth: (i: number) =>
              i === 1 ? 0.8 : 0.4,

            vLineWidth: () => 0.4,

            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 5,
            paddingBottom: () => 5,

            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) {
                return this.PDF_COLORS.primary;
              }

              return rowIndex % 2 === 0
                ? '#F8FAFC'
                : this.PDF_COLORS.white;
            }
          }
        }
      ]
    };
  }

  private buildPdfStatut(statut?: string | null): any {

    switch (statut) {

      case 'ADMIS':
        return {
          text: 'ADMIS',
          alignment: 'center',
          fontSize: 7.5,
          bold: true,
          color: this.PDF_COLORS.success,
          fillColor: this.PDF_COLORS.successLight
        };

      case 'AJOURNE':
        return {
          text: 'AJOURNÉ',
          alignment: 'center',
          fontSize: 7.5,
          bold: true,
          color: this.PDF_COLORS.warning,
          fillColor: this.PDF_COLORS.warningLight
        };

      case 'ABSENT':
        return {
          text: 'ABSENT',
          alignment: 'center',
          fontSize: 7.5,
          bold: true,
          color: this.PDF_COLORS.danger,
          fillColor: this.PDF_COLORS.dangerLight
        };

      default:
        return {
          text: 'NON RENSEIGNÉ',
          alignment: 'center',
          fontSize: 7.5,
          bold: true,
          color: this.PDF_COLORS.textSecondary,
          fillColor: '#F1F5F9'
        };
    }
  }

  private buildSignatureSection(): any {

    return {
      margin: [0, 22, 0, 0],

      table: {
        widths: ['*', 170],

        body: [
          [
            {
              text: ''
            },

            {
              stack: [
                {
                  text: 'LA DIRECTION',
                  style: 'signatureTitle',
                  alignment: 'center'
                },

                {
                  text: '\n\n\n'
                },

                {
                  text: 'Signature et cachet',
                  fontSize: 7.5,
                  color: this.PDF_COLORS.textSecondary,
                  alignment: 'center'
                }
              ]
            }
          ]
        ]
      },

      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

  private getNomFichierPdf(): string {
    const code = this.examenDetailsResponse?.code ?? 'EXAMEN';
    const annee = this.examenDetailsResponse?.libelleAnneeScolaire
      ?.replace(/\s/g, '-')
      ?? '';

    return `Liste-${code}-${annee}.pdf`;
  }

  retourListe(): void {
    void this.router.navigate([this.REDIRECT_PATH]);
  }

  annuler(): void {
    this.retourListe();
  }
}