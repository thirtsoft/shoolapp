import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { OrganizationMiniResponse } from '../../../../../core/models/onboarding/organization/organization-mini-response';
import { DetailsPaieResponse } from '../../../../../core/models/rh/details-paie-response.model';
import { ConfigOrganizationService } from '../../../../administration/configorganization/services/configorganization.service';
import { RhResourceService } from '../../../../rh/services/rh-resource-service';

declare const pdfMake: any;

@Component({
  selector: 'app-mes-paies-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './mes-paies-component.html',
  styleUrl: './mes-paies-component.css',
})
export class MesPaiesComponent implements OnInit {


  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "personnel";
  columns: any = [];
  paiesData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  organizationData: OrganizationMiniResponse = {};
  paie: DetailsPaieResponse | null = null;

  logoUrl = '';

  loading = signal(false);
  error = signal('');
  logoPreview: string | null = null;

  private readonly rhResource = inject(RhResourceService);

  private readonly toastService = inject(ToastrService);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    void this.chargerMesPaies();
    this.loadOrganizationInfos();
  }

  async chargerMesPaies() {
    try {
      await Promise.all([
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un type contrat'
      },
    ];
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    this.hasActiveFilters = Object.values(this.activeFilters).some(val =>
      val !== null && val !== undefined && val !== ''
    );
    this.currentPage = 0;
    this.chargerLesDonnees(this.hasActiveFilters);
  }

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.rhResource.fetchFilterDataTable(
        'paies/me',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.rhResource.getResourcePaged('paies/me', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.paiesData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.paiesData = this.paiesData.map((item: any) => ({
          ...item,
          paie: ''
        }));

        this.columns = [
          { key: 'personnelFullName', header: 'Personnel' },
          { key: 'referenceContrat', header: 'Contrat' },
          { key: 'netAPayer', header: 'Montant' },
          { key: 'mois', header: 'Mois' },
          { key: 'annee', header: 'Année' },
          { key: 'etatLibelle', header: 'Etat' },
          { key: 'paie', header: 'Reçu' },
          { key: 'dateCalcul', header: 'Date' },
        ];

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
    }
    return Object.keys(filtreObj).length > 0 ? filtreObj : null;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  onRowAction(event: { action: string; row: any }): void {
    if (event.action === 'generer-paie-pdf') {
      void this.genererPaiePdf(event.row);
    }
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

  async chargerDetailsPaie(uuid: string): Promise<DetailsPaieResponse | null> {
    try {
      const response: any = await firstValueFrom(
        this.rhResource.getDetailsPaie(uuid)
      );

      this.paie = response;
      return response;
    } catch (error) {
      console.error(
        'Erreur lors du chargement des détails de la paie :',
        error
      );

      this.toastService.error(
        'Erreur',
        'Impossible de charger les détails de la paie.'
      );

      return null;
    }
  }

  getNumeroPaie(): string {
    if (!this.paie) {
      return 'Non renseigné';
    }
    return this.paie.numeroPaie || 'Non renseigné';
  }

  getPeriodePaie(): string {
    if (!this.paie) {
      return 'Non renseignée';
    }
    const mois = this.paie.mois || '';
    const annee = this.paie.annee || '';
    if (!mois && !annee) {
      return 'Non renseignée';
    }
    if (!mois) {
      return String(annee);
    }
    if (!annee) {
      return String(mois);
    }
    return `${mois} / ${annee}`;
  }

  getTypeRemuneration(): string {
    if (!this.paie) {
      return 'Non renseigné';
    }

    const modeRemuneration = this.paie.contratPaieResponse?.modeRemuneration;

    if (modeRemuneration === 'HORAIRE') {
      return 'Rémunération horaire';
    }

    if (modeRemuneration === 'MENSUEL') {
      return 'Rémunération mensuelle';
    }

    return this.paie.type || 'Non renseigné';
  }

  isPaiePayee(): boolean {
    return this.normaliserEtat(this.paie?.etatLibelle) === 'PAYEE';
  }

  isPaieEnCours(): boolean {
    return this.normaliserEtat(this.paie?.etatLibelle) === 'EN_COURS';
  }

  normaliserEtat(value: string | null | undefined): string {
    return (value || '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  }

  getPersonnelFullName(): string {
    const personnel = this.paie?.personnelResponse;
    if (!personnel) {
      return 'Non renseigné';
    }

    const firstName = personnel.firstName?.trim() || '';
    const lastName = personnel.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Non renseigné';
  }

  formatMontant(value: number | null | undefined): string {
    return `${value?.toString()} FCFA`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return 'Non renseignée';
    }
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);

      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Non renseignée';
    }

    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getMontantNetPaie(): number {
    return Number(this.paie?.netAPayer || 0);
  }

  getMontantDejaPaye(): number {
    return Number(this.paie?.montantDejaPaye || 0);
  }

  getMontantRestantPaie(): number {
    return Number(this.paie?.montantRestantAPayer || 0);
  }

  getMoyenPaiementLabel(moyenPaiement: any): string {

    if (!moyenPaiement) {
      return 'Moyen de paiement';
    }

    return (
      moyenPaiement.libelle ||
      moyenPaiement.label ||
      moyenPaiement.nom ||
      moyenPaiement.code ||
      'Moyen de paiement'
    );
  }

  async genererPaiePdf(row: any): Promise<void> {
    if (!row?.uuid) {
      this.toastService.error('Erreur', 'Identifiant de la paie introuvable.');
      return;
    }

    try {
      this.loading.set(true);
      const paie = await this.chargerDetailsPaie(row.uuid);
      if (!paie) {
        return;
      }

      const document = await this.getDocumentFichePaie();

      const numeroPaie = paie.numeroPaie?.trim() || 'bulletin-paie';

      pdfMake.createPdf(document).download(`${numeroPaie}.pdf`);

    } catch (error) {
      console.error(
        'Erreur lors du téléchargement du bulletin de paie :',
        error
      );

      this.toastService.error(
        'Erreur', 'Impossible de générer le bulletin de paie.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  async getDocumentFichePaie(): Promise<any> {
    if (!this.paie) {
      throw new Error('Les informations de la paie sont indisponibles.');
    }

    const p = this.paie;

    const organisationLogo = await this.getOrganizationLogoBase64();
    const scoolliLogo = organisationLogo
      ? null
      : await this.getScoolliLogoBase64();

    const personnel = p.personnelResponse;
    const contrat = p.contratPaieResponse;
    const demandeAvance = p.demandeAvanceSalairePaieResponse;

    const paiements = Array.isArray(p.paiementsPaieResponses)
      ? p.paiementsPaieResponses
      : [];

    const pdfColors = {
      primary: '#2c5282',
      primaryDark: '#1e3a5f',
      primaryLight: '#ebf4ff',
      blueSoft: '#f4f8fc',
      text: '#1f2937',
      textLight: '#64748b',
      border: '#d8e1eb',
      white: '#ffffff',
      success: '#166534',
      successLight: '#ecfdf5',
      warning: '#92400e',
      warningLight: '#fffbeb'
    };

    const normaliserEtatPdf = (value: string | null | undefined): string => {
      return (value || '')
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
    };

    const montant = (value: number | null | undefined): string => {
      return `${this.formatMontant(value)} FCFA`;
    };

    const etatPaie = normaliserEtatPdf(p.etatLibelle);

    const etatPaieAffichage = etatPaie || 'NON_RENSEIGNE';

    const personnelNom = [personnel?.firstName, personnel?.lastName]
      .filter(value => !!value?.trim())
      .join(' ')
      .trim() || 'Non renseigne';

    const numeroPaie = p.numeroPaie?.trim() || 'Non renseigne';
    const periode = this.getPeriodePaie();
    const montantBrut = Number(p.montantBrut || 0);
    const retenues = Number(p.retenues || 0);
    const netAPayer = Number(p.netAPayer || 0);
    const montantDejaPaye = Number(p.montantDejaPaye || 0);
    const montantRestant = Number(p.montantRestantAPayer || 0);
    const organisationNom =
      (this.organizationData as any)?.name ||
      (this.organizationData as any)?.nom ||
      (this.organizationData as any)?.raisonSociale ||
      'Etablissement scolaire';

    const organisationAdresse =
      (this.organizationData as any)?.address ||
      (this.organizationData as any)?.adresse ||
      '';

    const organisationTelephone =
      (this.organizationData as any)?.mobile ||
      (this.organizationData as any)?.telephone ||
      (this.organizationData as any)?.phone ||
      '';

    const organisationEmail = (this.organizationData as any)?.email || '';

    const organisationNinea =
      (this.organizationData as any)?.ninea ||
      (this.organizationData as any)?.NINEA ||
      '';

    const organisationRccm =
      (this.organizationData as any)?.rccm ||
      (this.organizationData as any)?.RCCM ||
      '';

    const modeRemuneration =
      contrat?.modeRemuneration === 'HORAIRE'
        ? 'HORAIRE'
        : contrat?.modeRemuneration === 'MENSUEL'
          ? 'MENSUEL'
          : contrat?.modeRemuneration || 'NON_RENSEIGNE';

    let etatColor = pdfColors.primary;
    let etatBackground = pdfColors.primaryLight;

    if (etatPaie === 'PAYEE') {
      etatColor = pdfColors.success;
      etatBackground = pdfColors.successLight;
    } else if (etatPaie === 'PAYEE_PARTIELLE') {
      etatColor = pdfColors.warning;
      etatBackground = pdfColors.warningLight;
    }

    const logoBlock = organisationLogo
      ? {
        image: organisationLogo,
        width: 58,
        height: 58,
        fit: [58, 58]
      }
      : scoolliLogo
        ? {
          image: scoolliLogo,
          width: 58,
          height: 58,
          fit: [58, 58]
        }
        : {
          text: 'SCOOLLI',
          fontSize: 15,
          bold: true,
          color: pdfColors.primary
        };

    const organisationInformations: any[] = [
      {
        text: organisationNom,
        style: 'organisationName'
      }
    ];

    if (organisationAdresse) {
      organisationInformations.push({
        text: organisationAdresse,
        style: 'organisationInfo'
      });
    }

    const contactLine = [organisationTelephone ? `Tel. : ${organisationTelephone}` : '',
    organisationEmail ? `Email : ${organisationEmail}` : ''
    ]
      .filter(Boolean)
      .join('   |   ');

    if (contactLine) {
      organisationInformations.push({
        text: contactLine,
        style: 'organisationInfo'
      });
    }

    const legalLine = [
      organisationNinea
        ? `NINEA : ${organisationNinea}`
        : '',
      organisationRccm
        ? `RCCM : ${organisationRccm}`
        : ''
    ]
      .filter(Boolean)
      .join('   |   ');

    if (legalLine) {
      organisationInformations.push({
        text: legalLine,
        style: 'organisationInfo'
      });
    }

    const personnelTable = {
      table: {
        widths: ['18%', '32%', '18%', '32%'],
        body: [
          [
            {
              text: 'Nom et prenom',
              style: 'labelCell'
            },
            {
              text: personnelNom,
              style: 'valueCell'
            },
            {
              text: 'Matricule',
              style: 'labelCell'
            },
            {
              text: personnel?.matricule || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'N° CNI',
              style: 'labelCell'
            },
            {
              text: personnel?.cni || 'Non renseigne',
              style: 'valueCell'
            },
            {
              text: 'Statut',
              style: 'labelCell'
            },
            {
              text: personnel?.statut || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'Telephone',
              style: 'labelCell'
            },
            {
              text: personnel?.mobile || 'Non renseigne',
              style: 'valueCell'
            },
            {
              text: 'Email',
              style: 'labelCell'
            },
            {
              text: personnel?.email || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'Adresse',
              style: 'labelCell'
            },
            {
              text: personnel?.address || 'Non renseignee',
              style: 'valueCell',
              colSpan: 3
            },
            {},
            {}
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
      }
    };

    const contratTable = {
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            {
              text: 'Reference',
              style: 'labelCell'
            },
            {
              text: contrat?.reference || 'Non renseignee',
              style: 'valueCell'
            },
            {
              text: 'Type',
              style: 'labelCell'
            },
            {
              text: contrat?.typeContratLibelle ||
                contrat?.typeContratCode || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'Remuneration',
              style: 'labelCell'
            },
            {
              text: modeRemuneration,
              style: 'valueCell'
            },
            {
              text: 'Montant reference',
              style: 'labelCell'
            },
            {
              text: montant(contrat?.montantReference),
              style: 'valueCellRight'
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
      }
    };

    const calculRows: any[] = [
      [
        {
          text: 'Element',
          style: 'tableHeader'
        },
        {
          text: 'Montant',
          style: 'tableHeader',
          alignment: 'right'
        }
      ]
    ];

    if (
      contrat?.modeRemuneration === 'HORAIRE' &&
      p.nombreHeures !== null &&
      p.nombreHeures !== undefined
    ) {
      calculRows.push([
        {
          text: 'Nombre d\'heures',
          style: 'tableCell'
        },
        {
          text: String(p.nombreHeures),
          style: 'tableCellRight'
        }
      ]);

      calculRows.push([
        {
          text: 'Tarif horaire',
          style: 'tableCell'
        },
        {
          text: montant(p.tarifHoraire),
          style: 'tableCellRight'
        }
      ]);
    }

    calculRows.push([
      {
        text: 'Montant brut',
        style: 'tableCell'
      },
      {
        text: montant(montantBrut),
        style: 'tableCellRight'
      }
    ]);

    calculRows.push([
      {
        text: 'Retenues',
        style: 'tableCell'
      },
      {
        text: montant(retenues),
        style: 'tableCellRight'
      }
    ]);

    calculRows.push([
      {
        text: 'NET A PAYER',
        style: 'netAPayerLabel'
      },
      {
        text: montant(netAPayer),
        style: 'netAPayerValue'
      }
    ]);

    const calculPaieTable = {
      table: {
        widths: ['62%', '38%'],
        body: calculRows
      },
      layout: {
        hLineWidth: (i: number) =>
          i === calculRows.length - 1 ? 1 : 0.5,

        vLineWidth: () => 0.5,

        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,

        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) {
            return pdfColors.primary;
          }

          if (rowIndex === calculRows.length - 1) {
            return pdfColors.primaryLight;
          }

          return pdfColors.white;
        },

        paddingLeft: () => 7,
        paddingRight: () => 7,
        paddingTop: (rowIndex: number) => rowIndex === calculRows.length - 1 ? 8 : 4,

        paddingBottom: (rowIndex: number) => rowIndex === calculRows.length - 1 ? 8 : 4
      }
    };

    const situationPaiementTable = {
      table: {
        widths: ['33.33%', '33.33%', '33.34%'],
        body: [
          [
            {
              text: 'NET A PAYER',
              style: 'financialHeader'
            },
            {
              text: 'DEJA PAYE',
              style: 'financialHeader'
            },
            {
              text: 'RESTE A PAYER',
              style: 'financialHeader'
            }
          ],
          [
            {
              text: montant(netAPayer),
              style: 'financialMainValue'
            },
            {
              text: montant(montantDejaPaye),
              style: 'financialValue'
            },
            {
              text: montant(montantRestant),
              style: 'financialRemainingValue'
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,
        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) {
            return pdfColors.primary;
          }

          return pdfColors.white;
        },
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 6,
        paddingBottom: () => 6
      }
    };

    const paiementRows: any[] = [
      [
        {
          text: 'Date',
          style: 'tableHeaderSmall'
        },
        {
          text: 'Moyen',
          style: 'tableHeaderSmall'
        },
        {
          text: 'N° reçu',
          style: 'tableHeaderSmall'
        },
        {
          text: 'Reference',
          style: 'tableHeaderSmall'
        },
        {
          text: 'Montant',
          style: 'tableHeaderSmall',
          alignment: 'right'
        },
        {
          text: 'Etat',
          style: 'tableHeaderSmall'
        }
      ]
    ];

    if (paiements.length > 0) {
      paiements.forEach((paiement) => {
        paiementRows.push([
          {
            text: this.formatDate(
              paiement.datePaiement
            ),
            style: 'tableCellSmall'
          },
          {
            text: paiement.moyenPaiement || 'Non renseigne',
            style: 'tableCellSmall'
          },
          {
            text: paiement.numeroRecu || 'Non renseigne',
            style: 'tableCellSmall'
          },
          {
            text: paiement.reference || '-',
            style: 'tableCellSmall'
          },
          {
            text: montant(paiement.montant),
            style: 'tableCellSmallRight'
          },
          {
            text: normaliserEtatPdf(paiement.etatLibelle) || 'NON_RENSEIGNE',
            style: 'tableCellSmall'
          }
        ]);
      });
    } else {
      paiementRows.push([
        {
          text: 'Aucun paiement enregistre pour cette paie.',
          colSpan: 6,
          style: 'emptyCell',
          alignment: 'center'
        },
        {},
        {},
        {},
        {},
        {}
      ]);
    }

    const historiquePaiementsTable = {
      table: {
        widths: [
          '13%',
          '17%',
          '19%',
          '17%',
          '19%',
          '15%'
        ],
        body: paiementRows
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,

        fillColor: (rowIndex: number) =>
          rowIndex === 0 ? pdfColors.primary : pdfColors.white,

        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4
      }
    };

    const avanceSection: any[] = [];

    if (demandeAvance) {
      avanceSection.push(
        {
          text: 'AVANCE SUR SALAIRE',
          style: 'sectionTitleCompact'
        },
        {
          table: {
            widths: ['20%', '30%', '20%', '30%'],
            body: [
              [
                {
                  text: 'N° demande',
                  style: 'labelCell'
                },
                {
                  text: demandeAvance.numeroDemande || 'Non renseigne',
                  style: 'valueCell'
                },
                {
                  text: 'Montant',
                  style: 'labelCell'
                },
                {
                  text: montant(demandeAvance.montant),
                  style: 'valueCellRight'
                }
              ],
              [
                {
                  text: 'Date',
                  style: 'labelCell'
                },
                {
                  text: this.formatDate(demandeAvance.dateDemande as any),
                  style: 'valueCell'
                },
                {
                  text: 'Etat',
                  style: 'labelCell'
                },
                {
                  text: normaliserEtatPdf(demandeAvance.etatLibelle) || 'NON_RENSEIGNE',
                  style: 'valueCell'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => pdfColors.border,
            vLineColor: () => pdfColors.border,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4
          }
        }
      );
    }

    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [30, 28, 30, 48],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 8,
        color: pdfColors.text
      },
      styles: {
        organisationName: {
          fontSize: 11,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 0, 0, 2]
        },
        organisationInfo: {
          fontSize: 7,
          color: pdfColors.textLight,
          margin: [0, 0.5, 0, 0]
        },

        documentTitle: {
          fontSize: 16,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'center'
        },
        documentSubtitle: {
          fontSize: 8,
          color: pdfColors.textLight,
          alignment: 'center',
          margin: [0, 2, 0, 0]
        },
        sectionTitle: {
          fontSize: 8.5,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 11, 0, 5]
        },

        sectionTitleCompact: {
          fontSize: 8.5,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 10, 0, 5]
        },
        labelCell: {
          fontSize: 7,
          bold: true,
          color: pdfColors.textLight,
          fillColor: pdfColors.blueSoft,
          margin: [0, 1, 0, 1]
        },

        valueCell: {
          fontSize: 7.5,
          color: pdfColors.text,
          margin: [0, 1, 0, 1]
        },

        valueCellRight: {
          fontSize: 7.5,
          color: pdfColors.text,
          alignment: 'right',
          margin: [0, 1, 0, 1]
        },

        tableHeader: {
          fontSize: 7.5,
          bold: true,
          color: pdfColors.white,
          margin: [0, 1, 0, 1]
        },

        tableCell: {
          fontSize: 7.5,
          color: pdfColors.text,
          margin: [0, 1, 0, 1]
        },

        tableCellRight: {
          fontSize: 7.5,
          color: pdfColors.text,
          alignment: 'right',
          margin: [0, 1, 0, 1]
        },

        netAPayerLabel: {
          fontSize: 10,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 2, 0, 2]
        },

        netAPayerValue: {
          fontSize: 11,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'right',
          margin: [0, 2, 0, 2]
        },

        financialHeader: {
          fontSize: 7,
          bold: true,
          color: pdfColors.white,
          alignment: 'center'
        },

        financialMainValue: {
          fontSize: 11,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'center'
        },

        financialValue: {
          fontSize: 9.5,
          bold: true,
          color: pdfColors.text,
          alignment: 'center'
        },

        financialRemainingValue: {
          fontSize: 10.5,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'center'
        },

        tableHeaderSmall: {
          fontSize: 6.5,
          bold: true,
          color: pdfColors.white,
          margin: [0, 1, 0, 1]
        },

        tableCellSmall: {
          fontSize: 6.5,
          color: pdfColors.text,
          margin: [0, 1, 0, 1]
        },

        tableCellSmallRight: {
          fontSize: 6.5,
          color: pdfColors.text,
          alignment: 'right',
          margin: [0, 1, 0, 1]
        },

        emptyCell: {
          fontSize: 7,
          color: pdfColors.textLight,
          italics: true,
          margin: [0, 3, 0, 3]
        }
      },

      content: [
        {
          table: {
            widths: ['15%', '55%', '30%'],
            body: [
              [
                {
                  stack: [logoBlock],
                  alignment: 'left',
                  margin: [0, 0, 0, 0]
                },
                {
                  stack: organisationInformations,
                  alignment: 'left'
                },
                {
                  stack: [
                    {
                      text: 'BULLETIN DE PAIE',
                      fontSize: 10,
                      bold: true,
                      color: pdfColors.primaryDark,
                      alignment: 'right'
                    },
                    {
                      text: periode,
                      fontSize: 8,
                      color: pdfColors.textLight,
                      alignment: 'right',
                      margin: [0, 2, 0, 0]
                    },
                    {
                      text: numeroPaie,
                      fontSize: 7,
                      color: pdfColors.textLight,
                      alignment: 'right',
                      margin: [0, 2, 0, 0]
                    }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 535,
              y2: 0,
              lineWidth: 1.2,
              lineColor: pdfColors.primary
            }
          ],
          margin: [0, 5, 0, 6]
        },
        {
          columns: [
            {
              text: `Periode : ${periode}`,
              fontSize: 7.5,
              color: pdfColors.textLight,
              alignment: 'left'
            },
            {
              text: etatPaieAffichage,
              fontSize: 7.5,
              bold: true,
              color: etatColor,
              fillColor: etatBackground,
              alignment: 'center',
              margin: [5, 2, 5, 2]
            }
          ],
          columnGap: 10
        },

        {
          text: '1. INFORMATIONS DU PERSONNEL',
          style: 'sectionTitle'
        },

        personnelTable,
        {
          text: '2. INFORMATIONS CONTRACTUELLES',
          style: 'sectionTitle'
        },

        contratTable,
        {
          text: '3. CALCUL DE LA PAIE',
          style: 'sectionTitle'
        },

        calculPaieTable,

        ...(p.observation
          ? [
            {
              text: p.observation,
              fontSize: 6.8,
              color: pdfColors.textLight,
              italics: true,
              margin: [0, 4, 0, 0]
            }
          ]
          : []),

        {
          text: '4. SITUATION DU REGLEMENT',
          style: 'sectionTitle'
        },

        situationPaiementTable,
        {
          text: '5. HISTORIQUE DES PAIEMENTS',
          style: 'sectionTitle'
        },

        historiquePaiementsTable,

        ...avanceSection,
        {
          text: 'SIGNATURES',
          style: 'sectionTitleCompact',
          margin: [0, 16, 0, 7]
        },

        {
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'Le Responsable / Comptable',
                  bold: true,
                  fontSize: 7.5,
                  color: pdfColors.text,
                  alignment: 'center'
                },
                {
                  text: '\n\n\n____________________________',
                  fontSize: 7,
                  alignment: 'center'
                },
                {
                  text: 'Cachet de l\'etablissement',
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'center',
                  margin: [0, 3, 0, 0]
                }
              ]
            },
            {
              width: '50%',
              stack: [
                {
                  text: 'Le Salarie',
                  bold: true,
                  fontSize: 7.5,
                  color: pdfColors.text,
                  alignment: 'center'
                },
                {
                  text: '\n\n\n____________________________',
                  fontSize: 7,
                  alignment: 'center'
                },
                {
                  text: personnelNom,
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'center',
                  margin: [0, 3, 0, 0]
                }
              ]
            }
          ],
          margin: [0, 3, 0, 0]
        }
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [30, 8, 30, 0],

          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 535,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: pdfColors.border
                }
              ]
            },

            {
              columns: [
                {
                  width: '40%',
                  text: 'Document genere avec Scoolli · scoolli.com',
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'left',
                  margin: [0, 4, 0, 0]
                },
                {
                  width: '20%',
                  text: `Page ${currentPage} / ${pageCount}`,
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'center',
                  margin: [0, 4, 0, 0]
                },
                {
                  width: '40%',
                  text: 'Une solution Wokite Technologies & Innovation',
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'right',
                  margin: [0, 4, 0, 0]
                }
              ]
            }
          ]
        };
      }
    };

    return documentDefinition;
  }

}

