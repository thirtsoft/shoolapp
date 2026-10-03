import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { DetailsInscription } from '../../../../../../core/models/dossiereleve/details-inscription';
import { OrganizationMiniResponse } from '../../../../../../core/models/onboarding/organization/organization-mini-response';
import { Eleve } from '../../../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ConfigOrganizationService } from '../../../../configorganization/services/configorganization.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';
declare const pdfMake: any;

@Component({
  selector: 'app-details-inscription-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './details-inscription-component.html',
  styleUrl: './details-inscription-component.css',
})
export class DetailsInscriptionComponent implements OnInit, OnDestroy {

  errorMessage?: string;
  inscriptionId?: number;

  Math: any;

  detailsInscription: DetailsInscription = {};
  eleve?: Eleve;
  anneeScolaire?: AnneeScolaire;
  classe?: string;

  title = 'Détails inscription';

  actionForm!: FormGroup;

  modalActionLabel = '';
  targetEtatCode = '';
  isMotifRequired = false;

  libelleEtat = EtatLibelle;

  photoPreview = '';

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  logoPreview: string | null = null;

  public readonly modalService = inject(NgbModal);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.inscriptionId = Number(
      this.activeRoute.snapshot.params['id']
    );

    this.initActionForm();
    if (this.inscriptionId) {
      this.getDetailsInscription(this.inscriptionId);
    }
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

  get isAConfirmee(): boolean {
    return this.normalizeEtat(
      this.detailsInscription?.etat
    ) === this.normalizeEtat(
      this.libelleEtat.LIBELLE_ETAT_A_CONFIRMEE
    );
  }

  get isValidee(): boolean {
    return this.normalizeEtat(
      this.detailsInscription?.etat
    ) === this.normalizeEtat(
      this.libelleEtat.LIBELLE_ETAT_VALIDEE
    );
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

  getDetailsInscription(inscriptionId: number): void {
    this.dossierResource
      .afficherDetailsResource('inscription', inscriptionId)
      .subscribe({
        next: (data: any) => {
          this.detailsInscription = data || {};

          this.eleve = this.detailsInscription?.getEleveResponse;
          this.loadPhotoEleve();
          this.anneeScolaire = this.detailsInscription?.anneeScolaireDTO;
          this.classe = this.detailsInscription?.classe;
        },

        error: (err: any) => {
          console.error('Erreur récupération inscription :', err);

          this.toastService.error(
            err?.error?.message || 'Erreur lors de la récupération des informations de l’inscription.',
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

    this.dossierEleveService.getPhotoContent(photo.photoUuid)
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

  initActionForm(): void {
    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });
  }

  openEtatModal(content: any, action: 'confirmer' | 'rejeter'): void {
    this.modalActionLabel = action;
    this.targetEtatCode = action === 'confirmer' ? 'E4' : 'E11';
    this.isMotifRequired = action === 'rejeter';

    if (!this.actionForm) {
      this.initActionForm();
    }
    const motifControl = this.actionForm.get('motifAnnulation');

    if (this.isMotifRequired) {
      motifControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      motifControl?.clearValidators();
    }
    motifControl?.updateValueAndValidity();
    this.actionForm.reset();

    this.modalService
      .open(content, {
        centered: true,
        backdrop: 'static',
        size: 'md'
      })
      .result
      .then(
        (result) => {
          if (result === 'confirm') {
            const payload = {
              nouvelEtatCode: this.targetEtatCode,
              motifAnnulation:
                this.isMotifRequired
                  ? this.actionForm.value.motifAnnulation || null
                  : null
            };
            this.changerEtat(action, Number(this.inscriptionId), payload);
          }
        },
        () => { }
      );
  }

  changerEtat(action: 'confirmer' | 'rejeter', inscriptionId: number, payload: any): void {
    this.dossierResource.changeEtatResource('inscription', inscriptionId, payload)
      .subscribe({

        next: () => {

          const successMessages = {
            confirmer:
              'L’inscription a été confirmée avec succès.',
            rejeter:
              'L’inscription a été rejetée avec succès.'
          };

          this.toastService.success(
            successMessages[action],
            'Succès'
          );

          this.getDetailsInscription(Number(this.inscriptionId));
        },

        error: (err: any) => {
          this.toastService.error(
            err?.error?.message ||
            err?.message || 'Impossible de modifier l’état de l’inscription.',
            'Erreur'
          );
        }
      });
  }

  getStatusClass(): string {
    const etat = this.normalizeEtat(this.detailsInscription?.etat);
    if (etat === this.normalizeEtat(this.libelleEtat.LIBELLE_ETAT_VALIDEE)) {
      return 'status-validated';
    }

    if (etat === this.normalizeEtat(this.libelleEtat.LIBELLE_ETAT_A_CONFIRMEE)) {
      return 'status-pending';
    }
    if (etat.includes('REJET') || etat.includes('ANNU')) {
      return 'status-rejected';
    }
    return 'status-default';
  }

  getStatusIcon(): string {
    if (this.isValidee) {
      return 'fa-check-circle';
    }
    if (this.isAConfirmee) {
      return 'fa-clock';
    }
    return 'fa-info-circle';
  }

  private normalizeEtat(value?: string | null): string {
    return this.normalizeText(value);
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

  private async getAssetBase64(
    assetPath: string
  ): Promise<string | null> {

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

  private async convertBlobToPngBase64(
    blob: Blob
  ): Promise<string | null> {

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

  async imprimerCarteScolaire(): Promise<void> {
    /*    const document = await this.getDocumentCarteScolaire();
       pdfMake.createPdf(document).print(); */

    const document = await this.getDocumentCarteScolaire();
    const code = this.detailsInscription?.code || 'inscription';
    pdfMake.createPdf(document).download(`Carte_${code}.pdf`);
  }


  async getDocumentCarteScolaire(): Promise<any> {

    const eleve: any = this.eleve || {};
    const organization: any = this.organizationData || {};

    const nom = (eleve.nom || '').toString().trim();
    const prenom = (eleve.prenom || '').toString().trim();
    const matricule = (eleve.matricule || '-').toString().trim();

    const classe = (
      this.classLabel ||
      eleve.classe?.libelle ||
      '-'
    ).toString().trim();

    const sexe = (eleve.sexe || '-').toString().trim();

    const dateNaissance = eleve.dateNaissance
      ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')
      : '-';

    const lieuNaissance =
      (eleve.lieuNaissance || '-').toString().trim();

    const anneeScolaire =
      (this.anneeScolaireLabel || '-').toString().trim();

    // ============================================================
    // INFORMATIONS ÉCOLE
    // ============================================================

    const nomEcole = (
      organization.libelle ||
      'Établissement scolaire'
    ).toString().trim();

    // ============================================================
    // LOGO ÉCOLE
    // ============================================================

    let logoBase64: string | null =
      await this.getOrganizationLogoBase64();

    if (!logoBase64) {
      logoBase64 =
        await this.getScoolliLogoBase64();
    }

    // ============================================================
    // DRAPEAU DU SÉNÉGAL
    // ============================================================

    const drapeauSenegal =
      await this.getAssetBase64('assets/img/Senegal.png');

    // ============================================================
    // PHOTO ÉLÈVE
    // ============================================================

    let photoBase64: string | null = null;

    const photo = eleve.photo;
    const photoUuid = photo?.photoUuid;

    if (photo?.available && photoUuid) {

      try {

        const blob = await firstValueFrom(
          this.dossierEleveService.getPhotoContent(photoUuid)
        );

        photoBase64 = await new Promise<string>(
          (resolve, reject) => {

            const reader = new FileReader();

            reader.onloadend = () => {
              resolve(reader.result as string);
            };

            reader.onerror = reject;

            reader.readAsDataURL(blob);
          }
        );

      } catch (error) {

        console.error(
          'Erreur récupération photo élève pour la carte :',
          error
        );

        photoBase64 = null;
      }
    }

    // ============================================================
    // PHOTO PAR DÉFAUT
    // ============================================================

    if (!photoBase64) {

      const sexeNormalise =
        this.normalizeText(sexe);

      const fallbackPhoto =
        (
          sexeNormalise === 'feminin' ||
          sexeNormalise === 'femme' ||
          sexeNormalise === 'f'
        )
          ? 'assets/img/femme.png'
          : 'assets/img/homme.png';

      photoBase64 =
        await this.getAssetBase64(fallbackPhoto);
    }

    // ============================================================
    // DOCUMENT
    // ============================================================

    return {

      // ==========================================================
      // FORMAT CARTE
      // ==========================================================

      pageSize: {
        width: 242.65,
        height: 153.07
      },

      pageMargins: [
        8,
        6,
        8,
        12
      ],

      // ==========================================================
      // FOND
      // ==========================================================

      background: () => ({
        canvas: [

          // Fond blanc
          {
            type: 'rect',
            x: 3,
            y: 3,
            w: 236.65,
            h: 147.07,
            color: '#FFFFFF'
          },

          // Bordure extérieure
          {
            type: 'rect',
            x: 3,
            y: 3,
            w: 236.65,
            h: 147.07,
            lineColor: '#1A5276',
            lineWidth: 1
          }
        ]
      }),

      // ==========================================================
      // CONTENU
      // ==========================================================

      content: [

        // ========================================================
        // EN-TÊTE INSTITUTIONNEL
        // ========================================================

        {
          columns: [

            // ----------------------------------------------------
            // LOGO ÉCOLE
            // ----------------------------------------------------

            {
              width: 34,

              stack: logoBase64
                ? [
                  {
                    image: logoBase64,
                    fit: [30, 30],
                    alignment: 'center',
                    margin: [0, 0, 0, 0]
                  }
                ]
                : []
            },

            // ----------------------------------------------------
            // INFORMATIONS INSTITUTIONNELLES
            // ----------------------------------------------------

            {
              width: '*',

              stack: [

                {
                  text: 'RÉPUBLIQUE DU SÉNÉGAL',

                  fontSize: 7.2,
                  bold: true,

                  alignment: 'center',

                  color: '#222222',

                  margin: [
                    0,
                    0,
                    0,
                    0
                  ]
                },

                {
                  text: 'Un Peuple – Un But – Une Foi',

                  fontSize: 4.8,
                  italics: true,

                  alignment: 'center',

                  color: '#555555',

                  margin: [
                    0,
                    0,
                    0,
                    0
                  ]
                },

                {
                  text: 'MINISTÈRE DE L’ÉDUCATION NATIONALE',

                  fontSize: 5.4,
                  bold: true,

                  alignment: 'center',

                  color: '#333333',

                  margin: [
                    0,
                    0,
                    0,
                    0
                  ]
                },

                {
                  text:
                    'INSPECTION D’ACADÉMIE DE DAKAR – I.E.F. DE DAKAR',

                  fontSize: 4.7,
                  bold: true,

                  alignment: 'center',

                  color: '#333333',

                  noWrap: true,

                  margin: [
                    0,
                    0,
                    0,
                    0
                  ]
                }
              ]
            },

            // ----------------------------------------------------
            // DRAPEAU DU SÉNÉGAL
            // ----------------------------------------------------

            {
              width: 32,

              stack: drapeauSenegal
                ? [
                  {
                    image: drapeauSenegal,

                    fit: [27, 22],

                    alignment: 'center',

                    margin: [
                      0,
                      1,
                      0,
                      0
                    ]
                  }
                ]
                : []
            }
          ],

          columnGap: 2,

          margin: [
            0,
            0,
            0,
            1
          ]
        },

        // ========================================================
        // NOM DE L'ÉTABLISSEMENT
        // ========================================================

        {
          text: nomEcole,

          fontSize: 5.8,

          bold: true,

          color: '#34495E',

          alignment: 'center',

          margin: [
            0,
            0,
            0,
            1
          ]
        },

        // ========================================================
        // TITRE : CARTE D'IDENTITÉ SCOLAIRE
        // ========================================================

        {
          table: {

            widths: ['*'],

            body: [

              [
                {
                  text: 'CARTE D’IDENTITÉ SCOLAIRE',

                  fontSize: 6.4,

                  bold: true,

                  color: '#FFFFFF',

                  alignment: 'center',

                  fillColor: '#1A5276',

                  margin: [
                    0,
                    2,
                    0,
                    2
                  ],

                  characterSpacing: 0.3
                }
              ]
            ]
          },

          layout: {

            hLineWidth: () => 0.8,

            vLineWidth: () => 0.8,

            hLineColor: () => '#1A5276',

            vLineColor: () => '#1A5276',

            paddingLeft: () => 2,

            paddingRight: () => 2,

            paddingTop: () => 0,

            paddingBottom: () => 0
          },

          margin: [
            35,
            1,
            35,
            2
          ]
        },

        // ========================================================
        // CORPS DE LA CARTE
        // ========================================================

        {
          columns: [

            // ----------------------------------------------------
            // PHOTO
            // ----------------------------------------------------

            {
              width: 53,

              stack: [

                {
                  table: {

                    widths: [47],

                    body: [

                      [
                        {
                          image: photoBase64 || '',

                          fit: [43, 50],

                          alignment: 'center',

                          margin: [
                            1,
                            1,
                            1,
                            1
                          ]
                        }
                      ]
                    ]
                  },

                  layout: {

                    hLineWidth: () => 0.7,

                    vLineWidth: () => 0.7,

                    hLineColor: () => '#C7D8E5',

                    vLineColor: () => '#C7D8E5',

                    paddingLeft: () => 1,

                    paddingRight: () => 1,

                    paddingTop: () => 1,

                    paddingBottom: () => 1
                  }
                }
              ]
            },

            // ----------------------------------------------------
            // INFORMATIONS ÉLÈVE
            // ----------------------------------------------------

            {
              width: '*',

              stack: [

                // ------------------------------------------------
                // ANNÉE / MATRICULE
                // ------------------------------------------------

                {
                  columns: [

                    {
                      width: '*',

                      text: [
                        {
                          text: 'Année scolaire : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: anneeScolaire,
                          bold: true,
                          color: '#1A5276'
                        }
                      ],

                      fontSize: 4.6
                    },

                    {
                      width: 78,

                      text: [
                        {
                          text: 'Matricule : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: matricule,
                          bold: true,
                          color: '#2C3E50'
                        }
                      ],

                      fontSize: 4.6
                    }
                  ],

                  margin: [
                    2,
                    0,
                    0,
                    1.2
                  ]
                },

                // ------------------------------------------------
                // NOM / SEXE
                // ------------------------------------------------

                {
                  columns: [

                    {
                      width: '*',

                      text: [
                        {
                          text: 'Nom : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: nom || '-',
                          bold: true,
                          color: '#1A5276'
                        }
                      ],

                      fontSize: 5.0
                    },

                    {
                      width: 78,

                      text: [
                        {
                          text: 'Sexe : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: sexe,
                          bold: true,
                          color: '#2C3E50'
                        }
                      ],

                      fontSize: 5.0
                    }
                  ],

                  margin: [
                    2,
                    0,
                    0,
                    1.2
                  ]
                },

                // ------------------------------------------------
                // PRÉNOM / CLASSE
                // ------------------------------------------------

                {
                  columns: [

                    {
                      width: '*',

                      text: [
                        {
                          text: 'Prénom : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: prenom || '-',
                          bold: true,
                          color: '#1A5276'
                        }
                      ],

                      fontSize: 5.0
                    },

                    {
                      width: 78,

                      text: [
                        {
                          text: 'Classe : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: classe,
                          bold: true,
                          color: '#2C3E50'
                        }
                      ],

                      fontSize: 5.0
                    }
                  ],

                  margin: [
                    2,
                    0,
                    0,
                    1.2
                  ]
                },

                // ------------------------------------------------
                // DATE / LIEU DE NAISSANCE
                // ------------------------------------------------

                {
                  columns: [

                    {
                      width: '*',

                      text: [
                        {
                          text: 'Date naissance : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: dateNaissance,
                          bold: true,
                          color: '#2C3E50'
                        }
                      ],

                      fontSize: 4.8
                    },

                    {
                      width: 78,

                      text: [
                        {
                          text: 'À : ',
                          bold: true,
                          color: '#34495E'
                        },
                        {
                          text: lieuNaissance,
                          bold: true,
                          color: '#2C3E50'
                        }
                      ],

                      fontSize: 4.8
                    }
                  ],

                  margin: [
                    2,
                    0,
                    0,
                    0
                  ]
                }
              ],

              margin: [
                0,
                1,
                0,
                0
              ]
            }
          ],

          columnGap: 6,

          margin: [
            0,
            1,
            0,
            1.5
          ]
        },

        // ========================================================
        // LIGNE DE SÉPARATION
        // ========================================================

        {
          canvas: [

            {
              type: 'line',

              x1: 0,
              y1: 0,

              x2: 226,
              y2: 0,

              lineWidth: 0.35,

              lineColor: '#D9E3EA'
            }
          ],

          margin: [
            0,
            0,
            0,
            1
          ]
        },

        // ========================================================
        // MENTION
        // ========================================================

        {
          text:
            'Cette carte est strictement personnelle et reste la propriété de l’établissement.',

          fontSize: 4.0,

          italics: true,

          color: '#7F8C8D',

          alignment: 'center',

          margin: [
            0,
            0,
            0,
            1
          ]
        },

        // ========================================================
        // RESPONSABLE DE L'ÉTABLISSEMENT
        // ========================================================

        {
          text:
            'Le Responsable de l’établissement',

          fontSize: 4.2,

          bold: true,

          color: '#34495E',

          alignment: 'right',

          decoration: 'underline',

          decorationStyle: 'solid',

          margin: [
            0,
            1,
            8,
            0
          ]
        }
      ],

      // ==========================================================
      // PIED DE PAGE
      // ==========================================================

      footer: (
        currentPage: number,
        pageCount: number
      ) => {

        return {

          margin: [
            8,
            0,
            8,
            2
          ],

          columns: [

            {
              text:
                'Document généré avec Scoolli · scoolli.com',

              fontSize: 3.6,

              color: '#98A2B3',

              alignment: 'left'
            },

            {
              text:
                `Page ${currentPage} / ${pageCount}`,

              fontSize: 3.6,

              color: '#98A2B3',

              alignment: 'right'
            }
          ]
        };
      },

      // ==========================================================
      // STYLES
      // ==========================================================

      styles: {

        defaultStyle: {
          font: 'Roboto',
          color: '#2C3E50'
        }
      }
    };
  }

  goBack(): void {
    window.history.back();
  }

}
