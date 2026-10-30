import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { BulletinEleveResponse } from '../../../../core/models/dossiereleve/bulletin/bulletin-eleve-response';
import { DetailsInscription } from '../../../../core/models/dossiereleve/details-inscription';
import { InscriptionEleveAnneeCouranteResponse } from '../../../../core/models/dossiereleve/inscription-eleve-annee-courante-response';
import { OrganizationMiniResponse } from '../../../../core/models/onboarding/organization/organization-mini-response';
import { Eleve } from '../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../core/models/referentiels/annee-scolaire';
import { ConfigOrganizationService } from '../../../administration/configorganization/services/configorganization.service';
import { DossierEleveService } from '../../../administration/dossier-eleve/service/dossier-eleve.service';
import { DossierResourceService } from '../../../administration/dossier-eleve/service/dossier-resource.service';
import { ParentSessionService } from '../../service/parent-session.service';

declare const pdfMake: any;


interface EleveActif {
  id: number;
  matriculeEleve?: string;
  matricule?: string;
  nom: string;
  prenom: string;
  classeEleve?: string;
  classe?: string;
  niveauEleve?: string;
  niveau?: string;
  photo?: string | null;
}

@Component({
  selector: 'app-scolarite-eleve-component',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './scolarite-eleve-component.html',
  styleUrl: './scolarite-eleve-component.css',
})
export class ScolariteEleveComponent implements OnInit, OnDestroy {

  private readonly dossierService = inject(DossierEleveService);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly parentSessionService = inject(ParentSessionService);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastrService);

  eleve: EleveActif | null = null;

  inscription: InscriptionEleveAnneeCouranteResponse | null = null;

  bulletins: BulletinEleveResponse[] = [];

  inscriptionLoading = false;
  bulletinsLoading = false;

  inscriptionError = false;
  bulletinsError = false;

  eleveId: number | null = null;

  Math: any;

  detailsInscription: DetailsInscription = {};
  eleveData?: Eleve;
  anneeScolaire?: AnneeScolaire;
  classe?: string;


  photoPreview = '';

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  logoPreview: string | null = null;

  ngOnInit(): void {
    this.chargerEleveActif();
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

  ngOnDestroy(): void {
    if (this.photoPreview) {
      URL.revokeObjectURL(this.photoPreview);
    }
  }

  private chargerEleveActif(): void {
    const eleveId = this.parentSessionService.getEleveId();
    if (!eleveId) {
      console.warn('Aucun élève actif trouvé dans ParentSessionService');
      return;
    }

    this.eleveId = eleveId;

    const eleveActif = this.parentSessionService.eleveActif();

    if (eleveActif) {
      this.eleve = eleveActif as EleveActif;
    }

    this.chargerScolarite(eleveId);
  }

  private chargerScolarite(eleveId: number): void {
    this.chargerInscription(eleveId);
    this.chargerBulletins(eleveId);
  }

  public chargerInscription(eleveId: number): void {
    this.inscriptionLoading = true;
    this.inscriptionError = false;

    this.dossierService
      .getInscriptionAnneeCourante(eleveId)
      .subscribe({

        next: (response: any) => {
          this.inscription = response;
          this.inscriptionLoading = false;

        },

        error: (error: any) => {

          console.error(
            'Erreur lors du chargement de l’inscription :',
            error
          );

          this.inscription = null;
          this.inscriptionError = true;
          this.inscriptionLoading = false;
        }
      });
  }


  public chargerBulletins(eleveId: number): void {
    this.bulletinsLoading = true;
    this.bulletinsError = false;
    this.dossierService
      .getBulletinsAnneeCourante(eleveId)
      .subscribe({

        next: (response: any[]) => {

          this.bulletins = response ?? [];

          this.bulletins.sort((a, b) =>
            (b.sessionSemestreId ?? 0) - (a.sessionSemestreId ?? 0)
          );

          this.bulletinsLoading = false;

        },

        error: (error: any) => {

          console.error(
            'Erreur lors du chargement des bulletins :',
            error
          );

          this.bulletins = [];
          this.bulletinsError = true;
          this.bulletinsLoading = false;
        }

      });
  }

  retourner(): void {
    console.log(
      'Retour à la page précédente'
    );

  }

  consulterBulletin(bulletin: BulletinEleveResponse): void {
    console.log('Consulter le bulletin :', bulletin);
  }

  telechargerBulletin(bulletin: BulletinEleveResponse): void {
    console.log('Télécharger le bulletin :', bulletin);
  }


  getInitiales(): string {
    if (!this.eleve) {
      return '';
    }
    return (
      `${this.eleve.prenom?.charAt(0) ?? ''}` +
      `${this.eleve.nom?.charAt(0) ?? ''}`
    ).toUpperCase();
  }

  getMatricule(): string {
    if (!this.eleve) {
      return '-';
    }
    return (
      this.eleve.matriculeEleve ??
      this.eleve.matricule ??
      this.inscription?.matriculeEleve ??
      '-'
    );
  }

  getClasse(): string {
    return (
      this.inscription?.classeLibelle ??
      this.eleve?.classeEleve ??
      this.eleve?.classe ??
      '-'
    );
  }

  getNiveau(): string {
    return (
      this.eleve?.niveauEleve ??
      this.eleve?.niveau ??
      '-'
    );
  }

  getPhoto(): string | null {
    return this.eleve?.photo ?? null;
  }

  getStatutInscription(): string {
    if (!this.inscription) {
      return '';
    }
    if (this.inscription.etatLibelle) {
      return this.inscription.etatLibelle;
    }
    return this.inscription.actif
      ? 'INSCRIT'
      : 'INACTIF';
  }

  getStatutClass(statut: string | null | undefined): string {
    if (!statut) {
      return 'status-neutral';
    }
    switch (statut.toUpperCase()) {

      case 'INSCRIT':
        return 'status-success';

      case 'DISPONIBLE':
        return 'status-info';

      default:
        return 'status-neutral';
    }
  }

  getBulletinPeriode(bulletin: BulletinEleveResponse): string {

    switch (bulletin.sessionSemestreId) {

      case 1:
        return 'SEMESTRE_1';

      case 2:
        return 'SEMESTRE_2';

      default:
        return `SESSION_${bulletin.sessionSemestreId ?? '-'}`;
    }
  }

  getBulletinPeriodeLibelle(bulletin: BulletinEleveResponse): string {

    switch (bulletin.sessionSemestreId) {

      case 1:
        return 'Semestre 1';

      case 2:
        return 'Semestre 2';

      default:
        return 'Bulletin';
    }
  }


  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(parsedDate);
  }


  //
  get fullName(): string {
    const prenom = this.eleve?.prenom || '';
    const nom = this.eleve?.nom || '';

    return `${prenom} ${nom}`.trim() || 'Élève';
  }

  get classLabel(): string {
    return (this.detailsInscription?.classe || '-');
  }

  get niveauLabel(): string {
    return (this.detailsInscription?.niveau || '-');
  }

  get paymentProgress(): number {
    if (this.montantInscription <= 0) {
      return 0;
    }
    return Math.min(
      100,
      (this.montantRecu / this.montantInscription) * 100
    );
  }

  get serieLabel(): string {
    const serie = this.detailsInscription.serie;
    return serie?.trim() || '-';
  }

  get anneeScolaireLabel(): string {
    return (
      this.detailsInscription?.anneeScolaireDTO?.libelle ||
      this.anneeScolaire?.libelle ||
      '-'
    );
  }

  get montantInscription(): number {
    return Number((this.detailsInscription as any)?.montantInscription || 0);
  }

  get montantRecu(): number {
    return Number((this.detailsInscription as any)?.montantRecu || 0);
  }

  get resteAPaye(): number {
    return Number((this.detailsInscription as any)?.resteAPaye || 0);
  }

  get isPaid(): boolean {
    return this.resteAPaye <= 0;
  }

  get paymentMethod(): string {
    return (this.detailsInscription?.moyenPaiement || '-');
  }

  get dateInscription() {
    return (this.detailsInscription?.dateInscription);
  }

  parseDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);

    if (match) {
      const [, day, month, year] = match;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }

    const date = new Date(value);

    return isNaN(date.getTime()) ? null : date;
  }

  get dateInscriptionParsed(): Date | null {
    return this.parseDate(this.detailsInscription?.dateInscription);
  }

  async voirDetailEtTelecharger(inscriptionId: number): Promise<void> {
    this.dossierResource
      .afficherDetailsResource('inscription', inscriptionId)
      .subscribe({
        next: async (data: any) => {
          this.detailsInscription = data || {};

          this.eleveData = this.detailsInscription?.getEleveResponse;
          this.loadPhotoEleve();

          this.anneeScolaire = this.detailsInscription?.anneeScolaireDTO;
          this.classe = this.detailsInscription?.classe;

          await this.DownloadPdfRecu();
        },

        error: (err: any) => {
          console.error('Erreur récupération inscription :', err);

          this.toastService.error(
            err?.error?.message ||
            'Erreur lors de la récupération des informations de l’inscription.',
            'Erreur'
          );
        }
      });
  }

  private loadPhotoEleve(): void {
    this.photoPreview = '';
    const photo: any = (this.eleve as any)?.photo;
    if (!photo?.available || !photo?.photoUuid) {
      this.photoPreview = this.getPhotoFallback();
      return;
    }

    this.dossierService.getPhotoContent(photo.photoUuid)
      .subscribe({
        next: (blob: Blob) => {
          if (this.photoPreview) {
            URL.revokeObjectURL(this.photoPreview);
          }
          this.photoPreview = URL.createObjectURL(blob);
        },
        error: error => {
          console.error('Erreur lors du chargement de la photo de l’élève :', error);
          this.photoPreview = this.getPhotoFallback();
        }
      });
  }

  getPhotoFallback(): string {
    const sexe = this.normalizeText((this.eleve as any)?.sexe);

    if (sexe === 'feminin' || sexe === 'femme' || sexe === 'f') {
      return 'assets/img/femme.png';
    }
    return 'assets/img/homme.png';
  }

  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) {
      return;
    }
    const fallback = this.getPhotoFallback();
    if (!img.src.endsWith(fallback)) {
      img.src = fallback;
    }
  }

  private normalizeText(value?: string | null): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }


  async imprimerUneInscription(): Promise<void> {
    const document = await this.getDocumentRecuInscription();
    pdfMake.createPdf(document).print();
  }

  async DownloadPdfRecu() {
    const document = await this.getDocumentRecuInscription();
    const code = this.detailsInscription?.code || 'inscription';
    pdfMake.createPdf(document).download(`Recu_${code}.pdf`);
  }

  async getDocumentRecuInscription(): Promise<any> {

    if (!this.detailsInscription) {
      return {};
    }

    const inscription = this.detailsInscription;
    const organization = this.organizationData || {};
    const eleve = this.detailsInscription?.getEleveResponse;

    const nomOrganisation = organization.libelle?.trim() || 'ÉCOLE LES DAUPHINS';
    const adresseOrganisation = organization.adresse?.trim() ||
      'Derrière le casino du cap vert, Dakar';

    const telephoneOrganisation = organization.telephone?.trim() ||
      '33 820 10 92 - BP 6268 Dakar étoile';

    const emailOrganisation = organization.email?.trim() || '';
    const sloganOrganisation = organization.slogan?.trim() ||
      'L’école pour grandir';

    let logoBase64: string | null = await this.getOrganizationLogoBase64();

    let isOrganizationLogo = true;

    if (!logoBase64) {
      logoBase64 = await this.getScoolliLogoBase64();
      isOrganizationLogo = false;
    }

    const codeDossier = inscription.code || '';
    const matriculeEleve = eleve?.matricule || '';
    const nomCompletEleve = `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim();
    const sexe = eleve?.sexe || '';
    const dateNaissance = eleve?.dateNaissance ? new Date(eleve?.dateNaissance).toLocaleDateString('fr-FR') : '';
    const lieuNaissance = eleve?.lieuNaissance || '';
    const nationalite = eleve?.nationalite || '';
    const niveau = inscription.niveau || '';
    const classe = inscription.classe || '';
    const serie = inscription.serie?.trim() || '';
    const anneeScolaire = this.anneeScolaire?.libelle || '';
    const dateInscriptionFormatted = inscription.dateInscription || '-';

    const montantRecu = Number(inscription.montantRecu || 0);
    const resteAPaye = Number(inscription.resteAPaye || 0);
    const moyenPaiement = inscription.moyenPaiement || '';
    const etat = inscription.etat || '';

    const formatDevise = (val: number): string => {

      const brute = new Intl.NumberFormat(
        'fr-FR',
        {
          style: 'currency',
          currency: 'XOF',
          minimumFractionDigits: 0
        }
      ).format(val);

      return brute.replace(/[\u00A0\u202F]/g, ' ');
    };

    const headerLeft: any[] = [];

    if (logoBase64) {
      headerLeft.push({
        image: logoBase64,
        width: isOrganizationLogo ? 78 : 88,
        maxHeight: 65,
        fit: [88, 65],
        margin: [0, 0, 0, 6]
      });
    }

    headerLeft.push({
      text: nomOrganisation,
      fontSize: 14,
      bold: true,
      color: '#1A5276',
      margin: [0, 0, 0, 3]
    });

    if (adresseOrganisation) {
      headerLeft.push({
        text: adresseOrganisation,
        fontSize: 8,
        color: '#555555',
        margin: [0, 0, 0, 1]
      });
    }

    if (telephoneOrganisation) {
      headerLeft.push({
        text: `Tél : ${telephoneOrganisation}`,
        fontSize: 8,
        color: '#555555',
        margin: [0, 0, 0, 1]
      });
    }

    if (emailOrganisation) {
      headerLeft.push({
        text: `Email : ${emailOrganisation}`,
        fontSize: 8,
        color: '#555555',
        margin: [0, 0, 0, 1]
      });
    }

    if (sloganOrganisation) {
      headerLeft.push({
        text: `« ${sloganOrganisation} »`,
        fontSize: 8,
        italic: true,
        bold: true,
        color: '#1A5276',
        margin: [0, 1, 0, 0]
      });
    }

    const headerRight: any[] = [

      {
        text: 'REÇU D’INSCRIPTION',
        fontSize: 15,
        bold: true,
        color: '#1A5276',
        alignment: 'right',
        margin: [0, 0, 0, 6]
      },

      {
        text: `N° ${codeDossier}`,
        fontSize: 9.5,
        bold: true,
        color: '#7F8C8D',
        alignment: 'right',
        margin: [0, 0, 0, 4]
      },

      {
        text: anneeScolaire ? `Année scolaire : ${anneeScolaire}` : '',
        fontSize: 8.5,
        color: '#667085',
        alignment: 'right',
        margin: [0, 0, 0, 4]
      },

      {
        text: dateInscriptionFormatted ? `Date : ${dateInscriptionFormatted}` : '',
        fontSize: 8.5,
        color: '#667085',
        alignment: 'right'
      }

    ];

    const informationsEleveBody: any[] = [
      [
        {
          text: [
            {
              text: 'Matricule : ',
              bold: true
            },
            {
              text: matriculeEleve
            }
          ],
          fontSize: 9.5
        },

        {
          text: [
            {
              text: 'Niveau : ',
              bold: true
            },
            {
              text: niveau
            }
          ],
          fontSize: 9.5
        }

      ],

      [

        {
          text: [
            {
              text: 'Nom complet : ',
              bold: true
            },
            {
              text: nomCompletEleve
            }
          ],
          fontSize: 9.5
        },

        {
          text: [
            {
              text: 'Classe : ',
              bold: true
            },
            {
              text: classe
            }
          ],
          fontSize: 9.5
        }

      ],
      [

        {
          text: [
            {
              text: 'Sexe : ',
              bold: true
            },
            {
              text: sexe
            }
          ],
          fontSize: 9.5
        },

        {
          text: serie
            ? [
              {
                text: 'Série : ',
                bold: true
              },
              {
                text: serie
              }
            ]
            : '',
          fontSize: 9.5
        }

      ],
      [

        {
          text: [
            {
              text: 'Né(e) le : ',
              bold: true
            },
            {
              text: dateNaissance
            },
            {
              text: ' à '
            },
            {
              text: lieuNaissance
            }
          ],
          fontSize: 9.5
        },

        {
          text: ''
        }

      ],

      [

        {
          text: [
            {
              text: 'Nationalité : ',
              bold: true
            },
            {
              text: nationalite
            }
          ],
          fontSize: 9.5
        },

        {
          text: ''
        }

      ]

    ];

    return {

      pageSize: 'A4',
      pageMargins: [40, 35, 40, 65],
      content: [
        {
          columns: [

            {
              width: '*',
              stack: headerLeft
            },

            {
              width: 'auto',
              stack: headerRight
            }
          ],
          columnGap: 20,
          margin: [0, 0, 0, 10]
        },

        {
          canvas: [

            {
              type: 'line',

              x1: 0,
              y1: 0,

              x2: 515,
              y2: 0,

              lineWidth: 1,

              lineColor: '#2F80C0'
            }

          ],
          margin: [0, 0, 0, 9]
        },

        {
          columns: [
            {
              text: `ANNÉE SCOLAIRE : ${anneeScolaire}`,
              fontSize: 9.5,
              bold: true,
              color: '#333333'
            },
            {
              text: `Date : ${dateInscriptionFormatted}`,
              fontSize: 9.5,
              bold: true,
              alignment: 'right',
              color: '#555555'
            }

          ],

          margin: [0, 0, 0, 0]
        },

        {
          text: 'REÇU D’INSCRIPTION',
          fontSize: 15,
          alignment: 'center',
          bold: true,
          color: '#1A5276',
          margin: [0, 12, 0, 3],
          characterSpacing: 1
        },

        {
          text: `N° ${codeDossier}`,
          fontSize: 9.5,
          alignment: 'center',
          bold: true,
          color: '#7F8C8D',
          margin: [0, 0, 0, 13]
        },
        {
          table: {
            widths: ['*', '*'],
            body: informationsEleveBody
          },
          layout: {
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 7,
            paddingBottom: () => 7,
            fillColor: '#F8F9F9',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E5E7E9',
            vLineColor: () => '#E5E7E9'
          },
          margin: [0, 0, 0, 17]
        },

        {

          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: [
                    {
                      text: 'Motif : ',
                      bold: true
                    },
                    {
                      text: 'Frais d’inscription scolaire'
                    }
                  ],

                  fontSize: 9.5
                },

                {
                  text: [
                    {
                      text: 'Moyen paiement : ',
                      bold: true
                    },
                    {
                      text: moyenPaiement || '-'
                    }
                  ],

                  fontSize: 9.5
                },

                {
                  text: [
                    {
                      text: 'État : ',
                      bold: true
                    },
                    {
                      text: etat || '-'
                    }
                  ],

                  fontSize: 9.5
                }

              ]

            ]

          },

          layout: {
            paddingLeft: () => 10,
            paddingRight: () => 10,
            paddingTop: () => 8,
            paddingBottom: () => 8,
            fillColor: '#F8F9F9',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E5E7E9',
            vLineColor: () => '#E5E7E9'
          },
          margin: [0, 0, 0, 17]
        },

        {
          table: {
            widths: ['*', 120],
            headerRows: 1,
            body: [
              [
                {
                  text: 'Désignation / Libellé de l’opération',
                  style: 'tableHeader',
                  alignment: 'left'
                },

                {
                  text: 'Montant reçu',
                  style: 'tableHeader',
                  alignment: 'right'
                }
              ],
              [

                {
                  text: `Frais d'inscription scolaire — Année ${anneeScolaire}`,
                  alignment: 'left',
                  fontSize: 10.5,
                  margin: [0, 7, 0, 7]
                },
                {
                  text: formatDevise(montantRecu),
                  alignment: 'right',
                  fontSize: 10.5,
                  bold: true,
                  margin: [0, 7, 0, 7]
                }
              ],

              [

                {
                  text: 'TOTAL REÇU',
                  bold: true,
                  alignment: 'left',
                  fontSize: 10.5,
                  fillColor: '#EAEDED',
                  margin: [
                    0,
                    5,
                    0,
                    5
                  ]
                },

                {
                  text: formatDevise(montantRecu),

                  bold: true,

                  alignment: 'right',

                  fontSize: 11,

                  fillColor: '#EAEDED',

                  color: '#27AE60',

                  margin: [
                    0,
                    5,
                    0,
                    5
                  ]
                }

              ],

              [

                {
                  text: 'RESTE À PAYER',

                  bold: true,

                  alignment: 'left',

                  fontSize: 10.5,

                  fillColor: '#F8F9F9',

                  margin: [
                    0,
                    5,
                    0,
                    5
                  ]
                },

                {
                  text: formatDevise(resteAPaye),

                  bold: true,

                  alignment: 'right',

                  fontSize: 10.5,

                  fillColor: '#F8F9F9',

                  color:
                    resteAPaye > 0
                      ? '#C0392B'
                      : '#27AE60',

                  margin: [
                    0,
                    5,
                    0,
                    5
                  ]
                }

              ]

            ]

          },

          layout: {

            hLineWidth:
              (i: number, node: any) => {

                return (
                  i === 0 ||
                  i === node.table.body.length
                )
                  ? 1.5
                  : 1;

              },

            vLineWidth: () => 1,

            hLineColor:
              (i: number, node: any) => {

                return (
                  i === 0 ||
                  i === node.table.body.length
                )
                  ? '#1A5276'
                  : '#E5E7E9';

              },

            vLineColor: () =>
              '#E5E7E9',

            paddingLeft: () => 10,

            paddingRight: () => 10

          },

          margin: [
            0,
            0,
            0,
            25
          ]
        },


        {

          columns: [

            {

              width: '50%',

              stack: [

                {

                  text: 'IMPORTANT :',

                  bold: true,

                  fontSize: 8.5,

                  color: '#C0392B',

                  margin: [
                    0,
                    0,
                    0,
                    4
                  ]

                },

                {

                  text: 'Ce reçu constitue une preuve officielle de l’encaissement du montant indiqué pour l’inscription de l’élève. Il doit être conservé soigneusement pour toute réclamation administrative ou comptable.',

                  fontSize: 8,

                  color: '#7F8C8D',

                  lineHeight: 1.2

                }

              ]

            },

            {

              width: '10%',

              text: ''

            },

            {

              width: '40%',

              stack: [

                {

                  text: `Fait à Dakar, le ${dateInscriptionFormatted}`,

                  fontSize: 8.5,

                  italic: true,

                  alignment: 'center'

                },

                {

                  text: 'L’Agent Comptable / Le Trésorier',

                  bold: true,

                  fontSize: 9.5,

                  alignment: 'center',

                  margin: [
                    0,
                    5,
                    0,
                    42
                  ]

                },

                {

                  text: 'Signature & Cachet de l’École',

                  fontSize: 8,

                  alignment: 'center',

                  color: '#BDC3C7',

                  decoration: 'underline'

                }

              ]

            }

          ],

          margin: [
            0,
            0,
            0,
            25
          ]

        }

      ],


      styles: {

        tableHeader: {

          bold: true,

          fontSize: 10,

          color: '#FFFFFF',

          fillColor: '#1A5276',

          margin: [
            0,
            4,
            0,
            4
          ]

        }

      },

      footer: (
        currentPage: number,
        pageCount: number
      ) => {

        return {

          margin: [
            40,
            10,
            40,
            0
          ],

          stack: [

            {

              canvas: [

                {

                  type: 'line',

                  x1: 0,

                  y1: 0,

                  x2: 515,

                  y2: 0,

                  lineWidth: 0.4,

                  lineColor: '#EAECF0'

                }

              ],

              margin: [
                0,
                0,
                0,
                7
              ]

            },

            {

              columns: [

                {

                  text: 'Document généré avec Scoolli · scoolli.com',

                  fontSize: 7,

                  color: '#98A2B3',

                  alignment: 'left'

                },

                {

                  text:
                    `Page ${currentPage} / ${pageCount}`,

                  fontSize: 7,

                  color: '#98A2B3',

                  alignment: 'right'

                }

              ]

            },

            {

              text:
                'Une solution Wokite Technologies & Innovation',

              fontSize: 6.5,

              color: '#B0B5BF',

              alignment: 'center',

              margin: [
                0,
                3,
                0,
                0
              ]

            }

          ]

        };

      }

    };
  }

  private async getOrganizationLogoBase64(): Promise<string | null> {
    const logoUuid = this.organizationData?.logo?.logoUuid;
    if (!this.organizationData?.logo?.available || !logoUuid) {
      return null;
    }

    try {
      const blob = await firstValueFrom(
        this.organizationConfigService.getLogoContent(logoUuid));

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

  private async getAssetBase64(assetPath: string): Promise<string | null> {
    try {
      const response = await fetch(assetPath);

      if (!response.ok) {
        console.error(
          `Impossible de charger l'image : ${assetPath}`,
          response.status
        );
        return null;
      }

      const blob = await response.blob();

      return await this.convertBlobToPngBase64(blob);

    } catch (error) {

      console.error(
        `Erreur chargement asset ${assetPath}:`,
        error
      );

      return null;
    }
  }

  private async convertBlobToPngBase64(blob: Blob): Promise<string | null> {
    try {
      const objectUrl = URL.createObjectURL(blob);

      try {

        const image = await new Promise<HTMLImageElement>(
          (resolve, reject) => {

            const img = new Image();

            img.onload = () => resolve(img);

            img.onerror = () => {
              reject(
                new Error(
                  `Impossible de décoder l'image (${blob.type})`
                )
              );
            };

            img.src = objectUrl;
          }
        );

        const canvas = document.createElement('canvas');

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        if (
          canvas.width <= 0 ||
          canvas.height <= 0
        ) {
          throw new Error(
            'Dimensions de l’image invalides'
          );
        }

        const context =
          canvas.getContext('2d');

        if (!context) {
          throw new Error(
            'Impossible de créer le contexte Canvas'
          );
        }

        context.drawImage(
          image,
          0,
          0
        );

        return canvas.toDataURL(
          'image/png'
        );

      } finally {

        URL.revokeObjectURL(objectUrl);
      }

    } catch (error) {

      console.error(
        'Impossible de convertir l’image en PNG :',
        error
      );

      return null;
    }
  }

}