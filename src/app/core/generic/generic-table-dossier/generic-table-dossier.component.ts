import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportFileService } from '../../services/export-file.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ConfigOrganizationService } from '../../../features/administration/configorganization/services/configorganization.service';
import { ReferentielService } from '../../../features/administration/referentiel/service/referentiel.service';
import { ComptabiliteResourceService } from '../../../features/comptabilite/services/comptabilite-resource.service';
import { ConfirmationDialogModalComponent } from '../../components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { EncodateLogo } from '../../enumeration/encodage-logo-data';
import { IFilterConfig } from '../../filtered-config/FiltreConfiguration';
import { InscriptionResponse } from '../../models/dossiereleve/inscription-response';
import { OrganizationMiniResponse } from '../../models/onboarding/organization/organization-mini-response';
import { ParametresEtablissement } from '../../models/referentiels/parametre-etablissement';
import { CommonService } from '../../services/common.service';
import { SharedResourceService } from '../../services/shared-resource.service';
declare const pdfMake: any;

@Component({
  selector: 'app-generic-table-dossier',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './generic-table-dossier.component.html',
  styleUrls: ['./generic-table-dossier.component.css']
})
export class GenericTableDossierComponent implements OnInit {

  @Input() title: string = '';
  @Input() titleFitre: string = '';

  @Input() addButtonLabel: string = '+ Ajouter';
  @Input() addButtonLink: string = '';
  @Input() modifierButtonLink: string = '';
  @Input() detailButtonLink: string = '';
  @Input() iconTableLink: string = '';
  @Input() isNoAjout: boolean | undefined = false;

  @Input() defaultSortColumn: string | null = null;
  @Input() defaultSortDirection: 'asc' | 'desc' = 'asc';
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  @Input() deleteEndPoint: string = '';

  @Input() isEyesIcon: boolean = false;
  @Input() isEyesIconPopup: boolean = false;
  @Input() isEditIcon: boolean = false;
  @Input() isAffecterIcon: boolean = false;
  @Input() isReinscrireIcon: boolean = false;

  @Input() showEditOrDeleteCondition: (item: any) => boolean = () => true;

  @Input() isLockIcon: boolean = false;
  @Input() isUnLockIcon: boolean = false;
  @Input() isLockableIcon: boolean = false;
  @Input() isTableIcon: boolean = false;
  @Input() isSendIcon: boolean = false;
  @Input() noGlobalSearch: boolean = true;
  @Input() isPrnterIcon: boolean = false;

  /********************** icons ***************************/


  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();

  @Input() reinscriptionButtonLink: string = '';

  visible: boolean = false;
  position: string = 'center';

  p = 1;
  @Input() itemsPerPage: number = 5;

  isPopup: boolean = false;

  @Input() lockAction: any = 'désactiver';

  @Input() lockOption: any = 'verrouillage';
  @Input() unLockOption: any = 'déverrouillage';

  keySelected: any;

  filteredData: any[] = [];
  filters: { [key: string]: string } = {};
  globalSearchText: string = '';
  @Input() additionalFilters: {
    key: string;
    label: string;
    type: string;
    values?: any[];
    groups?: {
      groupLabel: string;
      filters: { key: string; label: string; value: any }[];
    }[];
    disabled?: boolean;
  }[] = [];
  @Input() showSearch: boolean = false;
  montantTotalXof: number = 0;
  @Output() totalMontantXof = new EventEmitter<number>();
  @Input() colonneDateFiltrage: string = 'dateEngagement';
  @Output() filtreApplique = new EventEmitter<{ colonne: string; valeur: string }>();

  /*****************************************************************************************************/

  isPopupVisible: boolean = false;
  selectedItem: any = {};
  splitKeys: string[][] = [];

  protected readonly Object = Object;

  //
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 5;
  @Input() tableSizes: number[] = [5, 10, 20, 50, 100];


  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onSizeChange = new EventEmitter<number>();

  currentFilters: any = {};

  //  @Input() showFilters: boolean = false;
  @Input() filteres: any[] = [];

  @Input() tableColumns: any[] = [];
  @Input() tableData: any[] = [];
  @Input() isLoading?: boolean;
  @Input() filtered: IFilterConfig[] = [];
  @Input() showFilters: boolean = false;
  @Input() totalElements: any;

  @Output() filterChange = new EventEmitter<{ filter: IFilterConfig, value: any }>();

  currentDateFrom?: string;
  currentDateTo?: string;

  @Input() generateButtonLabel: string = '+ Générer facture';
  @Input() generatedButtonLink: string = '';
  @Input() generatedButton: boolean = false;


  detailsBulletinEleve?: any;
  inscriptionEleve?: InscriptionResponse = {};
  detailsPaiementEleve?: any;
  matieres?: any;
  totalCoef?: any;
  moyenneGeneraleEleve?: any;

  parametresEtablissement: ParametresEtablissement = {};
  logoUrl: string = '';

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  logoPreview: string | null = null;

  onDateRangeChange(fromKey: string, toKey: string, event: any) {
    this.filterChange.emit({
      filter: { key: 'dateRange', fromKey, toKey } as IFilterConfig,
      value: event
    });
  }

  @Output() selectionChange = new EventEmitter<any[]>();
  selectedRows: any[] = [];

  private readonly router = inject(Router);
  private readonly sharedResourceService = inject(SharedResourceService);
  private readonly cmptabiliteResourceService = inject(ComptabiliteResourceService);
  private readonly serviceCommun = inject(CommonService);
  private readonly exportService = inject(ExportFileService);
  private readonly modalService = inject(NgbModal);
  private readonly toast = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly referentielService = inject(ReferentielService);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);

  onFilterChange(key: any, value: any) {
    this.currentFilters[key] = value;
    const filterConfig = this.filtered.find(f => f.key === key);
    if (filterConfig?.onChange) {
      filterConfig.onChange(value);
    }
    this.emitFiltered();
  }

  emitFiltered() {
    const activeFilters = this.currentFilters
      .filter(([_, v]: any) => v !== null && v !== undefined && v !== '')
      .reduce((acc: any, [key, value]: any) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  generateLink(baseLink: string, row: any): void {
    if (this.isPopup) {
      const param = this.selectedItem.id ?? this.selectedItem.uuid;
      this.router.navigate([baseLink, param], {
        state: { data: this.selectedItem }
      });
    } else {
      const rowParam = row.id ?? row.uuid;
      this.router.navigate([baseLink, rowParam], {
        state: { data: row }
      });
    }
  }

  generateReinscriptionLink(baseLink: string, row: any): void {
    localStorage.setItem('eleve', row.id)
    this.router.navigate([baseLink, row.id], {
      state: { data: row }
    });
  }

  imprimer(row: any) {
    const docDefinition: any = {
      content: [
        { text: 'NOTE D\'INFORMATION', style: 'header', alignment: 'center' },
        { text: `Date de création : ${row.dateCreation || 'N/A'}`, alignment: 'right', italics: true, margin: [0, 0, 0, 20] },

        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Référence :', bold: true, fillColor: '#f2f2f2' },
                { text: row.reference || 'N/A', bold: true }
              ]
            ]
          },
          margin: [0, 0, 0, 20]
        },

        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1.5, lineColor: '#cccccc' }] },

        { text: 'Contenu / Description :', style: 'subHeader', margin: [0, 15, 0, 10] },
        { text: row.description || 'Aucune description fournie.', style: 'bodyText' }
      ],

      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#1a365d',
          margin: [0, 0, 0, 10]
        },
        subHeader: {
          fontSize: 14,
          bold: true,
          color: '#2c5282',
          decoration: 'underline'
        },
        bodyText: {
          fontSize: 12,
          lineHeight: 1.5,
          alignment: 'justify'
        }
      },
      footer: (currentPage: number, pageCount: number) => {
        return { text: `Page ${currentPage} sur ${pageCount}`, alignment: 'center', fontSize: 9, margin: [0, 10, 0, 0] };
      }
    };
    pdfMake.createPdf(docDefinition).open();
  }


  isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  desactiverElement(endpoint: string, row: any): void {
    const param = row.id ?? row.uuid;
    this.serviceCommun.desactiverResource(endpoint, param).subscribe(
      //  this.serviceCommun.desactiverResource(endpoint, row.id).subscribe(
      (response) => {

        this.toast.success('success', `L'élément "${row.libelle}" a été ${this.lockAction} avec succès.`);
        setTimeout(() => window.location.reload(), 500)
      },
      (error) => {
        const errorMessage = error.error || 'Une erreur est survenue lors de la désactivation.';
        this.toast.error('error', `Erreur : ${errorMessage}`);
      }
    );
  }

  activerElement(endpoint: string, row: any): void {
    const param = row.id ?? row.uuid;
    this.serviceCommun.activeResource(endpoint, param).subscribe(
      //  this.serviceCommun.activeResource(endpoint, row.id).subscribe(
      (response) => {

        this.toast.success('success', `L'élément "${row.libelle}" a été ${this.lockAction} avec succès.`);
        setTimeout(() => window.location.reload(), 500)
      },
      (error) => {
        const errorMessage = error.error || 'Une erreur est survenue lors de la désactivation.';
        this.toast.error('error', `Erreur : ${errorMessage}`);
      }
    );
  }

  openConfirmationDialog(
    action: 'desactiver' | 'activer',
    endpoint: string,
    row: any
  ): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.title = action === 'desactiver' ? `Confirmer ${this.lockOption}` : 'Confirmer ${this.unLockOption}';
    modalRef.componentInstance.message =
      action === 'desactiver'
        ? `Êtes-vous sûr de vouloir ${this.lockAction} cet élément ?`
        : `Êtes-vous sûr de vouloir ${this.unLockOption} cet élément ?`;
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';


    modalRef.result
      .then((result) => {
        if (result) {
          if (action === 'desactiver') {
            this.desactiverElement(endpoint, row);
          } else if (action === 'activer') {
            this.activerElement(endpoint, row);
          }

        }
      })
      .catch(() => {

      });
  }

  shouldShowButton(row: any): boolean {
    if ('etat' in row && row.etat !== 'Brouillon' && row.etat !== 'Rejetée' && row.etat !== 'Non validée' && row.etat !== 'En modification') {
      return false;
    }
    if ('actif' in row || 'est_valide' in row) {
      return (row.actif === 1 || row.est_valide === true);
    }

    return true;
  }

  shouldShowButtonModification(row: any): boolean {
    if (row.etat === 'En modification') {
      return false
    } else {
      return true;
    }

  }

  shouldDisableCheckbox(row: any): boolean {
    return 'etat' in row && row.etat !== 'Envoyée';
  }

  exportToPDF() {
    this.exportService.exportToPDF(
      this.tableColumns,
      this.filteredData,
      this.title,
      `${this.title}_data`
    );

  }

  exportToExcel() {
    this.exportService.exportToExcel(
      this.tableColumns,
      this.filteredData,
      `${this.title}_data`
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData'] && this.tableData) {
      this.filteredData = [...this.tableData];
      this.montantTotalXof = this.filteredData.reduce((total, item) => {
        const montant = item.montantXof ?? item.montantXOF ?? 0;
        return total + montant;
      }, 0);
      this.totalMontantXof.emit(this.montantTotalXof);
      this.applyFilters();
      this.sortTable('dateEngagement');
    }
    this.sortTable('dateEngagement');
    if (changes['p']) {
      this.onPageChange.emit(this.p);
    }
  }

  getParametresEtablissement(): void {
    this.referentielService.getParametresEtablissement().subscribe(
      (config: ParametresEtablissement) => {
        this.parametresEtablissement = config;
      },
      error => {
        console.error('Erreur chargement config', error);
      }
    );
  }

  private loadOrganizationInfos(): void {
    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.error.set('Organisation non trouvée');
      this.loading.set(false);
      this.toast.warning('Attention', 'Organisation non trouvée');
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
          this.toast.error('Erreur', 'Impossible de charger les informations');
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


  applyFilters(): void {
    this.filteredData = this.tableData.filter((row) => {
      let dateValue: Date | null = null;

      const dateKey = this.colonneDateFiltrage;
      if (dateKey && row[dateKey]) {
        dateValue = new Date(row[dateKey]);
      }

      const anneeFiltrage = dateValue ? dateValue.getFullYear().toString() : '';
      const moisFiltrage = dateValue ? (dateValue.getMonth() + 1).toString().padStart(2, '0') : '';

      const globalSearchMatch = this.globalSearchText
        ? Object.values(row).some(value => value?.toString().toLowerCase().includes(this.globalSearchText.toLowerCase()))
        : true;

      const additionalFiltersMatch = this.additionalFilters.every(filter => {
        if (filter.disabled) {
          return true;
        }

        const key = filter.key;
        const filterValue = this.filters[key]?.toLowerCase();
        const cellValue = row[key] != null ? row[key].toString().toLowerCase() : '';

        if (filterValue) {
          const isMatch = cellValue.includes(filterValue);

          this.keySelected = key;
          return isMatch;
        }

        return true;
      });

      return globalSearchMatch && additionalFiltersMatch;
    });

    this.p = 1;

    this.montantTotalXof = this.filteredData.reduce((total, item) =>
      total + (item.montantXof ? item.montantXof : 0), 0
    );

    this.totalMontantXof.emit(this.montantTotalXof);
  }


  handleColumnFilterChange(event: Event, key: string): void {
    const inputElement = event.target as HTMLInputElement | HTMLSelectElement;
    const selectedValue = inputElement.value.trim();

    this.filtreApplique.emit({ colonne: key, valeur: selectedValue });
    this.filters[key] = selectedValue;
    this.applyFilters();
    this.toggleOtherMovementFilter(selectedValue);
  }


  toggleOtherMovementFilter(selectedValue: string): void {
    const otherMovementFilter = this.additionalFilters.find(
      filter => filter.key === 'autreMouvement' && filter.label === 'Autre type de mouvement'
    );
    if (otherMovementFilter) {
      if (this.keySelected === 'libelleTypeMouvement' && !selectedValue || selectedValue === 'Autre mouvements de trésorerie') {
        otherMovementFilter.disabled = false;
      }
      this.cdr.detectChanges();
    }
  }

  handleGlobalSearch(event: Event): void {
    this.globalSearchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  handlePageChange(newPage: number): void {
    this.p = newPage;
    this.onPageChange.emit(newPage);
  }

  handleSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = Number(selectElement.value);
    this.itemsPerPage = newSize;
    this.p = 1;
    this.onSizeChange.emit(newSize);
  }

  /*********************************** fin search test ************************************************/
  sortTable(columnKey: string): void {
    if (this.sortColumn === columnKey) {
      // Cycle entre les trois états : asc -> desc -> null -> asc
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = null;
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    if (this.sortDirection) {
      this.filteredData.sort((a, b) => {
        const valueA = a[columnKey];
        const valueB = b[columnKey];

        if (valueA == null || valueB == null) return 0;
        if (columnKey === 'dateEngagement' || columnKey === 'dateDemande' || columnKey === 'dateValeur') {
          const dateA = new Date(valueA);
          const dateB = new Date(valueB);

          if (this.sortDirection === 'asc') {
            return dateA.getTime() - dateB.getTime();
          } else {
            return dateB.getTime() - dateA.getTime();
          }
        }
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return this.sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }
      });
    } else {
      this.filteredData = [...this.tableData];
    }
  }

  ngOnInit(): void {
    this.sortTable('dateEngagement');
    this.matieres = this.detailsBulletinEleve?.bulletinMatiereDetailsDTOS || [];
    this.getParametresEtablissement();
    this.loadOrganizationInfos();
  }

  splitObjectKeys(): string[][] {
    if (!this.selectedItem || Object.keys(this.selectedItem).length === 0) {
      return [[], []];
    }
    const keys = Object.keys(this.selectedItem);
    const midIndex = Math.ceil(keys.length / 2);
    return [keys.slice(0, midIndex), keys.slice(midIndex)];
  }

  formatKey(key: string): string {
    return key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/^./, (str) => str.toUpperCase());
  }

  closePopup(): void {
    this.isPopupVisible = false;
    this.selectedItem = {};
    this.splitKeys = [];
  }

  /*   sendDepense(baseLink: any, row: any) {
      this.router.navigate([baseLink, row.id], {
        state: { data: row }
      });
    }
   */
  toggleAllRows(event: any): void {
    const isChecked = event.target.checked;
    this.filteredData.forEach(row => {
      row.checked = isChecked && row.etat === "Envoyée";
    });

    this.selectedRows = isChecked
      ? this.filteredData.filter(row => row.etat === "Envoyée")
      : [];

    this.selectionChange.emit(this.selectedRows);
  }


  toggleRow(row: any): void {
    row.checked = !row.checked;

    if (row.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(selectedRow => selectedRow !== row);
    }

    console.log('Lignes sélectionnées :', this.selectedRows);

    this.selectionChange.emit(this.selectedRows);
  }


  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  get startItem(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.totalElements, (this.currentPage + 1) * this.pageSize);
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  changeSize(size: number) {
    console.log('Taille sélectionnée:', size);
    this.sizeChange.emit(+size);
  }

  get visiblePages(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }


  updateVisiblePages() {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

  }

  generatePdfDuRecu(row: any) {
    if (row.id) {
      this.getinscriptionEleve(row.id);
    }
  }

  getinscriptionEleve(inscriptionId: number) {
    this.sharedResourceService.afficherUneResource('inscription', inscriptionId).subscribe({
      next: (data: any) => {
        this.inscriptionEleve = data;
        console.log('details inscription', this.inscriptionEleve)
        this.imprimerRecu();
      }
    });
  }

  async imprimerRecu(): Promise<void> {
    const document = await this.getDocumentRecuInscription();
    pdfMake.createPdf(document).open();
  }

  async DownloadPdfRecu(): Promise<void> {
    const document = await this.getDocumentRecuInscription();
    const classe = this.inscriptionEleve?.classe || 'inscription';

    pdfMake.createPdf(document).download(`Recu_${classe}.pdf`);
  }

  async getDocumentRecuInscription(): Promise<any> {

    if (!this.inscriptionEleve) {
      return {};
    }

    const inscription = this.inscriptionEleve;
    const organization = this.organizationData || {};

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
    const matriculeEleve = inscription.matriculeEleve || '';
    const nomCompletEleve = `${inscription.nomComplet || ''}`.trim().toUpperCase();
    const sexe = inscription.sexe || '';
    const dateNaissance = inscription.dateNaissance || '-';
    const lieuNaissance = inscription.lieuNaissance || '';
    const nationalite = inscription.nationalite || '';
    const niveau = inscription.niveau || '';
    const classe = inscription.classe || '';
    const serie = inscription.serie?.trim() || '';
    const anneeScolaire = inscription.anneeScolaire || '';
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
        text: anneeScolaire
          ? `Année scolaire : ${anneeScolaire}`
          : '',
        fontSize: 8.5,
        color: '#667085',
        alignment: 'right',
        margin: [0, 0, 0, 4]
      },

      {
        text: dateInscriptionFormatted
          ? `Date : ${dateInscriptionFormatted}`
          : '',
        fontSize: 8.5,
        color: '#667085',
        alignment: 'right'
      }

    ];

    const informationsEleveBody: any[] = [

      // Ligne 1
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

      // Ligne 2
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

      // Ligne 3
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

      // Ligne 4
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

      // Ligne 5
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

      // Marges légèrement réduites pour garantir une seule page
      pageMargins: [
        40,
        35,
        40,
        65
      ],

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

          margin: [
            0,
            0,
            0,
            10
          ]
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

          margin: [
            0,
            0,
            0,
            9
          ]
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

          margin: [
            0,
            0,
            0,
            0
          ]
        },


        {
          text: 'REÇU D’INSCRIPTION',

          fontSize: 15,

          alignment: 'center',

          bold: true,

          color: '#1A5276',

          margin: [
            0,
            12,
            0,
            3
          ],

          characterSpacing: 1
        },


        {
          text: `N° ${codeDossier}`,

          fontSize: 9.5,

          alignment: 'center',

          bold: true,

          color: '#7F8C8D',

          margin: [
            0,
            0,
            0,
            13
          ]
        },

        {
          table: {

            widths: [
              '*',
              '*'
            ],

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

          margin: [
            0,
            0,
            0,
            17
          ]
        },

        {

          table: {

            widths: [
              '*',
              '*',
              '*'
            ],

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

          margin: [
            0,
            0,
            0,
            17
          ]
        },

        {

          table: {

            widths: [
              '*',
              120
            ],

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
                  text:
                    `Frais d'inscription scolaire — Année ${anneeScolaire}`,

                  alignment: 'left',

                  fontSize: 10.5,

                  margin: [
                    0,
                    7,
                    0,
                    7
                  ]
                },

                {
                  text: formatDevise(montantRecu),

                  alignment: 'right',

                  fontSize: 10.5,

                  bold: true,

                  margin: [
                    0,
                    7,
                    0,
                    7
                  ]
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

                  text:
                    'Ce reçu constitue une preuve officielle de l’encaissement du montant indiqué pour l’inscription de l’élève. Il doit être conservé soigneusement pour toute réclamation administrative ou comptable.',

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

                  text:
                    `Fait à Dakar, le ${dateInscriptionFormatted}`,

                  fontSize: 8.5,

                  italic: true,

                  alignment: 'center'

                },

                {

                  text:
                    'L’Agent Comptable / Le Trésorier',

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

                  text:
                    'Signature & Cachet de l’École',

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

                  text:
                    'Document généré avec Scoolli · scoolli.com',

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

  generatePdfPaiement(row: any) {
    if (row.id) {
      this.getDetailsPaiemntEleve(row.id);
    }
  }

  getDetailsPaiemntEleve(paiementId: number) {
    this.cmptabiliteResourceService.afficherDetailsResource('payement', paiementId).subscribe({
      next: (data) => {
        this.detailsPaiementEleve = data;
        console.log('details paiement', this.detailsPaiementEleve)
        this.imprimerRecuPay();
      }
    });
  }

  async imprimerRecuPay(): Promise<void> {
    try {
      const document = await this.getDocumentRecuPaiament();
      pdfMake.createPdf(document).open();
    } catch (error) {
      console.error('Erreur lors de la génération du reçu PDF :', error);
      this.toast.error('Erreur', 'Impossible de générer le reçu de paiement.');
    }
  }

  async DownloadPdfRecuPay(): Promise<void> {
    try {
      const document = await this.getDocumentRecuPaiament();
      const numeroRecu = this.detailsPaiementEleve?.numeroRecu || 'paiement';

      pdfMake.createPdf(document).download(`Recu_${numeroRecu}.pdf`);

    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu PDF :', error);

      this.toast.error('Erreur', 'Impossible de télécharger le reçu de paiement.');
    }
  }

  async getDocumentRecuPaiament(): Promise<any> {

    const paiement = this.detailsPaiementEleve;

    if (!paiement) {
      return {};
    }

    const organization = this.organizationData || {};

    let logoBase64 = await this.getOrganizationLogoBase64();
    let isOrganizationLogo = true;
    if (!logoBase64) {
      logoBase64 = await this.getScoolliLogoBase64();
      isOrganizationLogo = false;
    }

    const numeroRecu = paiement.numeroRecu || '—';
    const numeroFacture = paiement.numeroFacture || '—';
    const montant = Number(paiement.montant || 0);
    const nomEleve = paiement.nomCompletEleve || '—';
    const moyenPaiement = paiement.moyenPaiement || '—';
    const reference = paiement.reference || '—';
    const etat = paiement.etat || '—';
    const datePaiement = paiement.datePaiement
      ? paiement.datePaiement
      : '—';
    const dateValidation = paiement.dateValidation
      ? paiement.dateValidation
      : '—';

    const nomOrganisation = organization.libelle || 'ÉTABLISSEMENT SCOLAIRE';
    const adresseOrganisation = organization.adresse || '';
    const telephoneOrganisation = organization.telephone || '';
    const emailOrganisation = organization.email || '';

    const formatDevise = (val: number) => {
      const brute = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(val);
      return brute.replace(/[\u00A0\u202F]/g, ' ').replace('F CFA', 'F CFA');
    };

    const headerLeft: any[] = [];

    if (logoBase64) {
      headerLeft.push({
        image: logoBase64,
        width: isOrganizationLogo ? 78 : 88,
        height: isOrganizationLogo ? undefined : undefined,
        margin: [0, 0, 0, 8]
      });

    }

    headerLeft.push({
      text: nomOrganisation,
      fontSize: 14,
      bold: true,

      color: '#173F68',

      margin: [0, 0, 0, 4]

    });

    if (adresseOrganisation) {

      headerLeft.push({

        text: adresseOrganisation,

        fontSize: 8.5,

        color: '#667085',

        margin: [0, 0, 0, 2]

      });

    }

    if (telephoneOrganisation) {

      headerLeft.push({

        text: `Tél. : ${telephoneOrganisation}`,

        fontSize: 8.5,

        color: '#667085',

        margin: [0, 0, 0, 2]

      });

    }

    if (emailOrganisation) {

      headerLeft.push({

        text: emailOrganisation,

        fontSize: 8.5,

        color: '#667085',

        margin: [0, 0, 0, 2]

      });

    }

    const headerRight: any[] = [

      {

        text: 'REÇU DE PAIEMENT',

        fontSize: 19,

        bold: true,

        color: '#173F68',

        alignment: 'right',

        margin: [0, 0, 0, 8]

      },

      {

        text: `N° ${numeroRecu}`,

        fontSize: 9,

        bold: true,

        color: '#667085',

        alignment: 'right',

        margin: [0, 0, 0, 4]

      },

      {

        text: `Facture : ${numeroFacture}`,

        fontSize: 9,

        color: '#667085',

        alignment: 'right',

        margin: [0, 0, 0, 4]

      },

      {

        text: `Date : ${datePaiement}`,

        fontSize: 9,

        color: '#667085',

        alignment: 'right',

        margin: [0, 0, 0, 8]

      },

      {

        text: etat,

        fontSize: 8,

        bold: true,

        color: etat.toLowerCase() === 'validée'
          ? '#027A48'
          : '#B54708',

        alignment: 'right'

      }

    ];

    const paymentRows = [

      [

        {

          text: 'DESCRIPTION',

          style: 'tableHeader',

          alignment: 'left'

        },

        {

          text: 'MOYEN DE PAIEMENT',

          style: 'tableHeader',

          alignment: 'center'

        },

        {

          text: 'MONTANT',

          style: 'tableHeader',

          alignment: 'right'

        }

      ],

      [

        {

          text:
            `Paiement de la facture ${numeroFacture}`,

          fontSize: 9.5,

          color: '#344054',

          margin: [0, 12, 0, 12]

        },

        {

          text: moyenPaiement,

          fontSize: 9,

          color: '#344054',

          alignment: 'center',

          margin: [0, 12, 0, 12]

        },

        {

          text: formatDevise(montant),

          fontSize: 10,

          bold: true,

          color: '#173F68',

          alignment: 'right',

          margin: [0, 12, 0, 12]

        }

      ]

    ];

    return {

      pageSize: 'A4',

      pageMargins: [42, 40, 42, 55],

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

          margin: [0, 0, 0, 18]

        },

        {

          canvas: [

            {

              type: 'line',

              x1: 0,

              y1: 0,

              x2: 510,

              y2: 0,

              lineWidth: 1,

              lineColor: '#2F80C0'

            }

          ],

          margin: [0, 0, 0, 22]

        },


        {

          text: 'REÇU DE PAIEMENT',

          fontSize: 20,

          bold: true,

          color: '#173F68',

          margin: [0, 0, 0, 5]

        },

        {

          text: `N° ${numeroRecu}`,

          fontSize: 9,

          color: '#667085',

          margin: [0, 0, 0, 18]

        },


        {

          table: {

            widths: ['*', '*'],

            body: [

              [

                {

                  stack: [

                    {

                      text: 'ÉLÈVE',

                      fontSize: 8,

                      bold: true,

                      color: '#98A2B3',

                      characterSpacing: 0.5,

                      margin: [0, 0, 0, 5]

                    },

                    {

                      text: nomEleve,

                      fontSize: 11,

                      bold: true,

                      color: '#173F68',

                      margin: [0, 0, 0, 3]

                    },

                    {

                      text: `Facture : ${numeroFacture}`,

                      fontSize: 8.5,

                      color: '#667085'

                    }

                  ],

                  fillColor: '#F2F7FC',

                  margin: [12, 12, 12, 12]

                },

                {

                  stack: [

                    {

                      text: 'INFORMATIONS DU PAIEMENT',

                      fontSize: 8,

                      bold: true,

                      color: '#98A2B3',

                      characterSpacing: 0.5,

                      margin: [0, 0, 0, 5]

                    },

                    {

                      text: `Date de paiement : ${datePaiement}`,

                      fontSize: 8.5,

                      color: '#344054',

                      margin: [0, 0, 0, 3]

                    },

                    {

                      text: `Date de validation : ${dateValidation}`,

                      fontSize: 8.5,

                      color: '#344054',

                      margin: [0, 0, 0, 3]

                    },

                    {

                      text: `État : ${etat}`,

                      fontSize: 8.5,

                      bold: true,

                      color: '#027A48'

                    }

                  ],

                  fillColor: '#F2F7FC',

                  margin: [12, 12, 12, 12]

                }

              ]

            ]

          },

          layout: {

            hLineWidth: () => 0,

            vLineWidth: () => 0

          },

          margin: [0, 0, 0, 22]

        },


        {

          text: 'DÉTAIL DU PAIEMENT',

          fontSize: 8,

          bold: true,

          color: '#98A2B3',

          characterSpacing: 0.5,

          margin: [0, 0, 0, 8]

        },

        {

          table: {

            widths: ['*', 150, 120],

            headerRows: 1,

            body: paymentRows

          },

          layout: {

            hLineWidth: (

              i: number,

              node: any

            ) => {

              if (
                i === 0 ||
                i === node.table.body.length
              ) {

                return 0.8;

              }

              return 0.4;

            },

            vLineWidth: () => 0,

            hLineColor: () => '#D9E2EC',

            paddingLeft: () => 8,

            paddingRight: () => 8,

            paddingTop: () => 0,

            paddingBottom: () => 0

          },

          margin: [0, 0, 0, 18]

        },


        {

          columns: [

            {

              width: '*',

              stack: [

                {

                  text: 'RÉFÉRENCE DU PAIEMENT',

                  fontSize: 8,

                  bold: true,

                  color: '#98A2B3',

                  characterSpacing: 0.5,

                  margin: [0, 0, 0, 5]

                },

                {

                  text: reference,

                  fontSize: 9,

                  color: '#344054'

                }

              ]

            },

            {

              width: 180,

              stack: [

                {

                  text: 'TOTAL PAYÉ',

                  fontSize: 8,

                  bold: true,

                  color: '#FFFFFF',

                  fillColor: '#173F68',

                  margin: [10, 8, 10, 4]

                },

                {

                  text: formatDevise(montant),

                  fontSize: 15,

                  bold: true,

                  color: '#FFFFFF',

                  fillColor: '#173F68',

                  alignment: 'right',

                  margin: [10, 4, 10, 10]

                }

              ]

            }

          ],

          margin: [0, 0, 0, 28]

        },

        {

          columns: [

            {

              width: '*',

              stack: [

                {

                  text: 'IMPORTANT',

                  fontSize: 8.5,

                  bold: true,

                  color: '#173F68',

                  margin: [0, 0, 0, 5]

                },

                {

                  text:
                    'Ce reçu constitue la preuve de l’enregistrement du paiement indiqué ci-dessus. Il doit être conservé pour toute démarche administrative ou comptable.',

                  fontSize: 8,

                  color: '#667085',

                  lineHeight: 1.2

                }

              ],

              fillColor: '#F2F7FC',

              margin: [12, 12, 12, 12]

            }

          ],

          margin: [0, 0, 0, 30]

        },


        {

          columns: [

            {

              width: '*',

              text: ''

            },

            {

              width: 190,

              stack: [

                {

                  text: 'Signature / Cachet',

                  fontSize: 8,

                  color: '#667085',

                  alignment: 'center',

                  margin: [0, 0, 0, 35]

                },

                {

                  canvas: [

                    {

                      type: 'line',

                      x1: 20,

                      y1: 0,

                      x2: 170,

                      y2: 0,

                      lineWidth: 0.6,

                      lineColor: '#98A2B3'

                    }

                  ]

                }

              ]

            }

          ],

          margin: [0, 0, 0, 10]

        }

      ],


      styles: {

        tableHeader: {

          bold: true,

          fontSize: 8,

          color: '#FFFFFF',

          fillColor: '#173F68',

          margin: [0, 7, 0, 7]

        }

      },


      footer: (

        currentPage: number,

        pageCount: number

      ) => {

        return {

          margin: [42, 10, 42, 0],

          stack: [

            {

              canvas: [

                {

                  type: 'line',

                  x1: 0,

                  y1: 0,

                  x2: 510,

                  y2: 0,

                  lineWidth: 0.4,

                  lineColor: '#EAECF0'

                }

              ],

              margin: [0, 0, 0, 7]

            },

            {

              columns: [

                {

                  text:
                    'Document généré avec Scoolli · scoolli.com',

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

              margin: [0, 3, 0, 0]

            }

          ]

        };

      }

    };

  }

  generatePdfDuBulletin(row: any) {
    if (row.id) {
      this.getDetailsBulletinEleve(row.id);
    }
  }

  getDetailsBulletinEleve(bulletinId: number) {
    this.sharedResourceService.afficherDetailsResource('bulletin', bulletinId).subscribe({
      next: (data) => {
        this.detailsBulletinEleve = data;
        console.log('Details bulletin', this.detailsBulletinEleve)
        this.imprimerBulletin();
      }
    });
  }
  
  async imprimerBulletin(): Promise<void> {
    const document = await this.getDocumentFicheBulletin();
    pdfMake.createPdf(document).open();
  }

  async DownloadPdf(): Promise<void> {
    const document = await this.getDocumentFicheBulletin();
    const classe = this.detailsBulletinEleve?.classe || 'BULLETIN';

    pdfMake.createPdf(document).download(`BULLETIN_${classe}.pdf`);
  }

  async getDocumentFicheBulletin(): Promise<any> {
    const details = this.detailsBulletinEleve || {};
    const matieres = Array.isArray(details.bulletinMatiereDetailsDTOS)
      ? details.bulletinMatiereDetailsDTOS
      : [];

    const organization = this.organizationData || {};
    const nomEtablissement = organization.libelle || 'ÉCOLE LES DAUPHINS';
    const adresseEtablissement = organization.adresse || 'Derrière le casino du Cap Vert, Dakar';
    const telephoneEtablissement = organization.telephone || '33 820 10 92';
    const emailEtablissement = organization.email || '';
    const siteEtablissement = organization.siteWeb || 'www.ecolelesdauphins.org';
    const bpEtablissement = organization.boitePostale || 'BP 6268 Dakar Étoile';
    const sloganEtablissement = organization.slogan || '« L’école pour grandir »';

    const nomEleve = details.nomCompletEleve || 'Non renseigné';
    const dateNaissance = details.dateNaissanceEleve || 'Non renseignée';
    const lieuNaissance = details.lieuNaissanceEleve || 'Non renseigné';
    const classe = details.classe || 'Non renseignée';
    const anneeScolaire = details.anneeScolaire || 'Non renseignée';
    const sessionSemestre = details.sessionSemestre || 'Non renseigné';
    const matriculeEleve = details.matriculeEleve || 'MAT-2026-000002';
    const sexeEleve = details.sexe || 'Non renseigné';
    const nationaliteEleve = details.nationalite || 'Sénégalaise';
    const situationEleve = details.situationEleve || 'Non redoublant';
    const statutEleve = details.statutEleve || 'Scolarisé(e)';

    const nombreEleves = Number(details.nombreEleve || 0);

    const rangEleve = details.rangEleve !== null &&
      details.rangEleve !== undefined
      ? Number(details.rangEleve)
      : 0;

    const absenceRetard = details.absenceRetard !== null &&
      details.absenceRetard !== undefined
      ? Number(details.absenceRetard)
      : 0;

    const moyenneGeneraleEleve = Number(details.moyenneEleve || 0);
    const moyenneClasse = Number(details.moyenneClasse || 0);
    const appreciationGenerale = details.appreciationGenerale || 'Non renseignée';

    let rangFormate = '-';

    if (rangEleve > 0) {
      rangFormate =
        rangEleve === 1
          ? `1er / ${nombreEleves}`
          : `${rangEleve}e / ${nombreEleves}`;
    }

    const totalCoef = matieres.reduce(
      (sum: number, m: any) =>
        sum + (Number(m.coefficient) || 0),
      0
    );

    const totalNotePonderee = matieres.reduce(
      (sum: number, m: any) => {
        const coef = Number(m.coefficient) || 0;
        const moyenne = Number(m.moyenneFinale) || 0;

        return sum + (coef * moyenne);
      },
      0
    );

    const dateEdition = new Date();

    const dateEditionFormatee = dateEdition.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });


    const bulletinId = details.id !== null &&
      details.id !== undefined
      ? String(details.id).padStart(6, '0')
      : '000000';

    const referenceBulletin = `BUL-${new Date().getFullYear()}-${bulletinId}`;

    let logoBase64: string | null = await this.getOrganizationLogoBase64();

    let isOrganizationLogo = true;

    if (!logoBase64) {
      logoBase64 = await this.getScoolliLogoBase64();
      isOrganizationLogo = false;
    }

    // ============================================================
    // 10. DRAPEAU DU SÉNÉGAL
    // ============================================================

    const drapeauSenegal = {
      canvas: [
        // Bande verte
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: 9,
          h: 22,
          color: '#00853F'
        },

        // Bande jaune
        {
          type: 'rect',
          x: 9,
          y: 0,
          w: 9,
          h: 22,
          color: '#FDEF42'
        },

        // Bande rouge
        {
          type: 'rect',
          x: 18,
          y: 0,
          w: 9,
          h: 22,
          color: '#E31B23'
        },

        // Étoile verte au centre de la bande jaune
        {
          type: 'polyline',
          closePath: true,
          points: [
            { x: 13.5, y: 4 },
            { x: 14.9, y: 8.2 },
            { x: 19.3, y: 8.2 },
            { x: 15.8, y: 10.8 },
            { x: 17.1, y: 15 },
            { x: 13.5, y: 12.4 },
            { x: 9.9, y: 15 },
            { x: 11.2, y: 10.8 },
            { x: 7.7, y: 8.2 },
            { x: 12.1, y: 8.2 }
          ],
          lineWidth: 0,
          color: '#00853F'
        }
      ],
      width: 27,
      height: 22
    };


    const blocRepublique = {
      stack: [
        {
          ...drapeauSenegal,
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'REPUBLIQUE DU SENEGAL',
          alignment: 'center',
          bold: true,
          fontSize: 11,
          margin: [0, 0, 0, 2]
        },
        {
          text: "MINISTERE DE L'EDUCATION NATIONALE",
          alignment: 'center',
          bold: true,
          fontSize: 8.5,
          margin: [0, 0, 0, 0]
        }
      ],
      alignment: 'center'
    };

    const blocEtablissement: any = {
      stack: [
        {
          text: nomEtablissement.toUpperCase(),
          bold: true,
          fontSize: 11,
          margin: [0, 0, 0, 3]
        },
        {
          text: adresseEtablissement,
          fontSize: 7.5,
          margin: [0, 0, 0, 1]
        },
        {
          text: `Tél : ${telephoneEtablissement} - ${bpEtablissement}`,
          fontSize: 7.5,
          margin: [0, 0, 0, 1]
        },
        {
          text: siteEtablissement,
          fontSize: 7.5,
          margin: [0, 0, 0, 1]
        },
        ...(emailEtablissement
          ? [{
            text: emailEtablissement,
            fontSize: 7.5,
            margin: [0, 0, 0, 1]
          }]
          : []),
        {
          text: sloganEtablissement,
          italics: true,
          fontSize: 7.5,
          margin: [0, 2, 0, 0]
        }
      ],
      alignment: 'left',
      margin: [0, -8, 0, 0]
    };

    const blocLogo: any = logoBase64
      ? {
        image: logoBase64,
        width: isOrganizationLogo ? 78 : 88,
        maxHeight: 65,
        height: 72,
        fit: [72, 72],
        alignment: 'left',
        margin: [0, 0, 10, 0]
      }
      : {
        text: '',
        width: 72,
        margin: [0, 0, 10, 0]
      };


    const informationsEleve = {
      table: {
        widths: [75, '*', 75, '*'],
        body: [
          [
            {
              text: 'Nom et prénom',
              bold: true,
              fontSize: 8
            },
            {
              text: nomEleve,
              fontSize: 8
            },
            {
              text: 'Matricule',
              bold: true,
              fontSize: 8
            },
            {
              text: matriculeEleve,
              fontSize: 8
            }
          ],
          [
            {
              text: 'Date de naissance',
              bold: true,
              fontSize: 8
            },
            {
              text: dateNaissance,
              fontSize: 8
            },
            {
              text: 'Lieu de naissance',
              bold: true,
              fontSize: 8
            },
            {
              text: lieuNaissance,
              fontSize: 8
            }
          ],
          [
            {
              text: 'Classe',
              bold: true,
              fontSize: 8
            },
            {
              text: classe,
              fontSize: 8
            },
            {
              text: 'Sexe',
              bold: true,
              fontSize: 8
            },
            {
              text: sexeEleve,
              fontSize: 8
            }
          ],
          [
            {
              text: 'Nationalité',
              bold: true,
              fontSize: 8
            },
            {
              text: nationaliteEleve,
              fontSize: 8
            },
            {
              text: 'Situation',
              bold: true,
              fontSize: 8
            },
            {
              text: situationEleve,
              fontSize: 8
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#D9D9D9',
        vLineColor: () => '#D9D9D9',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 5, 0, 12]
    };

    // ============================================================
    // 14. TABLEAU DES NOTES
    // ============================================================

    const tableauNotesBody: any[] = [
      [
        {
          text: 'Discipline',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        },
        {
          text: 'Coef.',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        },
        {
          text: 'MCC',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        },
        {
          text: 'Composition',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        },
        {
          text: 'Moy. /20',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        },
        {
          text: 'Total',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        },
        {
          text: 'Appréciation',
          bold: true,
          alignment: 'center',
          fontSize: 7.5
        }
      ]
    ];

    matieres.forEach((m: any) => {
      const coef =
        Number(m.coefficient) || 0;

      const moyenneDevoirs =
        Number(m.moyenneDevoirs) || 0;

      const noteComposition =
        Number(m.noteComposition) || 0;

      const moyenneFinale =
        Number(m.moyenneFinale) || 0;

      const appreciationMatiere =
        m.appreciationMatiere || '';

      const totalMatiere =
        moyenneFinale * coef;

      tableauNotesBody.push([
        {
          text: m.matiere || '',
          fontSize: 7.5,
          alignment: 'left'
        },
        {
          text: coef.toString(),
          fontSize: 7.5,
          alignment: 'center'
        },
        {
          text: moyenneDevoirs.toFixed(2),
          fontSize: 7.5,
          alignment: 'center'
        },
        {
          text: noteComposition.toFixed(2),
          fontSize: 7.5,
          alignment: 'center'
        },
        {
          text: moyenneFinale.toFixed(2),
          fontSize: 7.5,
          alignment: 'center'
        },
        {
          text: totalMatiere.toFixed(2),
          fontSize: 7.5,
          alignment: 'center'
        },
        {
          text: appreciationMatiere,
          fontSize: 7.5,
          alignment: 'center'
        }
      ]);
    });

    tableauNotesBody.push([
      {
        text: 'TOTAL',
        bold: true,
        alignment: 'right',
        fontSize: 7.5,
        colSpan: 1
      },
      {
        text: totalCoef.toString(),
        bold: true,
        alignment: 'center',
        fontSize: 7.5
      },
      {
        text: '',
        colSpan: 2,
        fontSize: 7.5
      },
      {},
      {
        text: '',
        fontSize: 7.5
      },
      {
        text: totalNotePonderee.toFixed(2),
        bold: true,
        alignment: 'center',
        fontSize: 7.5
      },
      {
        text: '',
        fontSize: 7.5
      }
    ]);

    const tableauNotes = {
      table: {
        headerRows: 1,
        widths: ['*', 35, 50, 58, 52, 50, 75],
        body: tableauNotesBody
      },
      layout: {
        fillColor: (rowIndex: number) =>
          rowIndex === 0
            ? '#E9ECEF'
            : null,

        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,

        hLineColor: () => '#BDBDBD',
        vLineColor: () => '#BDBDBD',

        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 0, 0, 12]
    };

    // ============================================================
    // 15. SYNTHÈSE
    // ============================================================

    const synthese = {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            {
              text: 'MOYENNE GÉNÉRALE',
              bold: true,
              alignment: 'center',
              fontSize: 7.5
            },
            {
              text: 'MOYENNE CLASSE',
              bold: true,
              alignment: 'center',
              fontSize: 7.5
            },
            {
              text: 'RANG',
              bold: true,
              alignment: 'center',
              fontSize: 7.5
            },
            {
              text: 'EFFECTIF',
              bold: true,
              alignment: 'center',
              fontSize: 7.5
            }
          ],
          [
            {
              text: `${moyenneGeneraleEleve.toFixed(2)} / 20`,
              bold: true,
              alignment: 'center',
              fontSize: 10
            },
            {
              text: `${moyenneClasse.toFixed(2)} / 20`,
              bold: true,
              alignment: 'center',
              fontSize: 10
            },
            {
              text: rangFormate,
              bold: true,
              alignment: 'center',
              fontSize: 10
            },
            {
              text: nombreEleves.toString(),
              bold: true,
              alignment: 'center',
              fontSize: 10
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#C8C8C8',
        vLineColor: () => '#C8C8C8',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 5,
        paddingBottom: () => 5
      },
      margin: [0, 0, 0, 8]
    };

    // ============================================================
    // 16. ABSENCES / STATUT
    // ============================================================

    const informationsComplementaires = {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            {
              text: 'ABSENCES / RETARDS',
              bold: true,
              fontSize: 7.5,
              alignment: 'center'
            },
            {
              text: 'STATUT',
              bold: true,
              fontSize: 7.5,
              alignment: 'center'
            },
            {
              text: 'SITUATION',
              bold: true,
              fontSize: 7.5,
              alignment: 'center'
            }
          ],
          [
            {
              text: absenceRetard.toString(),
              fontSize: 8,
              alignment: 'center'
            },
            {
              text: statutEleve,
              fontSize: 8,
              alignment: 'center'
            },
            {
              text: situationEleve,
              fontSize: 8,
              alignment: 'center'
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#D0D0D0',
        vLineColor: () => '#D0D0D0',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 0, 0, 10]
    };

    // ============================================================
    // 17. APPRECIATION GÉNÉRALE
    // ============================================================

    const appreciationBloc = {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'APPRÉCIATION GÉNÉRALE',
              bold: true,
              fontSize: 8,
              alignment: 'left'
            }
          ],
          [
            {
              text: appreciationGenerale,
              fontSize: 9,
              margin: [2, 2, 2, 2],
              minHeight: 28
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#C8C8C8',
        vLineColor: () => '#C8C8C8',
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 5,
        paddingBottom: () => 5
      },
      margin: [0, 0, 0, 15]
    };

    // ============================================================
    // 18. SIGNATURE / CACHET
    // ============================================================

    const signatureBloc = {
      columns: [
        {
          width: '*',
          text: ''
        },
        {
          width: 190,
          stack: [
            {
              text: "Le Chef d'établissement",
              bold: true,
              alignment: 'center',
              fontSize: 8.5
            },
            {
              text: '\n\n\n',
              alignment: 'center'
            },
            {
              text: 'Signature et cachet',
              italics: true,
              alignment: 'center',
              fontSize: 7.5
            }
          ]
        }
      ],
      margin: [0, 3, 0, 20]
    };

    // ============================================================
    // 19. PIED DE PAGE
    // ============================================================

    const footer = (
      currentPage: number,
      pageCount: number
    ) => {
      return {
        margin: [40, 0, 40, 15],
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 0.5,
                lineColor: '#BDBDBD'
              }
            ],
            margin: [0, 0, 0, 5]
          },
          {
            columns: [
              {
                width: '*',
                stack: [
                  {
                    text: 'Document généré par Scoolli.com',
                    fontSize: 6.5,
                    color: '#666666'
                  },
                  {
                    text: `Référence : ${referenceBulletin}`,
                    fontSize: 6.5,
                    color: '#666666'
                  }
                ]
              },
              {
                width: 'auto',
                stack: [
                  {
                    text: `Édité le ${dateEditionFormatee}`,
                    fontSize: 6.5,
                    color: '#666666',
                    alignment: 'right'
                  },
                  {
                    text: `Page ${currentPage} / ${pageCount}`,
                    fontSize: 6.5,
                    color: '#666666',
                    alignment: 'right'
                  }
                ]
              }
            ]
          },
          {
            text: 'Scoolli — Gestion scolaire simple, moderne et efficace',
            alignment: 'center',
            fontSize: 6.5,
            color: '#777777',
            margin: [0, 3, 0, 0]
          }
        ]
      };
    };

    // ============================================================
    // 20. DOCUMENT PDF
    // ============================================================

    const documentDefinition: any = {
      pageSize: 'A4',

      pageMargins: [40, 32, 40, 58],

      footer: footer,

      content: [

        // --------------------------------------------------------
        // EN-TÊTE
        // --------------------------------------------------------

        {
          columns: [
            {
              width: '*',
              stack: [
                blocRepublique
              ],
              margin: [0, 0, 10, 0]
            },
            {
              width: '*',
              columns: [
                blocLogo,
                blocEtablissement
              ],
              columnGap: 5
            }
          ],
          margin: [0, 0, 0, 8]
        },

        // --------------------------------------------------------
        // BARRE SÉPARATRICE
        // --------------------------------------------------------

        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#333333'
            }
          ],
          margin: [0, 0, 0, 10]
        },

        // --------------------------------------------------------
        // ANNÉE / SEMESTRE
        // --------------------------------------------------------

        {
          columns: [
            {
              text: `ANNÉE SCOLAIRE : ${anneeScolaire}`,
              bold: true,
              fontSize: 8.5,
              alignment: 'left'
            },
            {
              text: sessionSemestre.toUpperCase(),
              bold: true,
              fontSize: 8.5,
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 10]
        },

        // --------------------------------------------------------
        // TITRE
        // --------------------------------------------------------

        {
          stack: [
            {
              text: 'BULLETIN DE NOTES',
              bold: true,
              fontSize: 15,
              alignment: 'center',
              characterSpacing: 0.5
            },
            {
              text: `Référence : ${referenceBulletin}`,
              fontSize: 7,
              alignment: 'center',
              color: '#666666',
              margin: [0, 3, 0, 12]
            }
          ]
        },

        // --------------------------------------------------------
        // INFORMATIONS ÉLÈVE
        // --------------------------------------------------------

        {
          text: "INFORMATIONS DE L'ÉLÈVE",
          bold: true,
          fontSize: 9,
          margin: [0, 0, 0, 4]
        },

        informationsEleve,

        // --------------------------------------------------------
        // TABLEAU NOTES
        // --------------------------------------------------------

        {
          text: 'RÉSULTATS ACADÉMIQUES',
          bold: true,
          fontSize: 9,
          margin: [0, 0, 0, 4]
        },

        tableauNotes,

        // --------------------------------------------------------
        // SYNTHÈSE
        // --------------------------------------------------------

        {
          text: 'SYNTHÈSE DU SEMESTRE',
          bold: true,
          fontSize: 9,
          margin: [0, 0, 0, 4]
        },

        synthese,

        informationsComplementaires,

        // --------------------------------------------------------
        // APPRECIATION
        // --------------------------------------------------------

        appreciationBloc,

        // --------------------------------------------------------
        // SIGNATURE
        // --------------------------------------------------------

        signatureBloc
      ],

      defaultStyle: {
        fontSize: 8,
        font: 'Roboto'
      },

      styles: {
        header: {
          bold: true
        }
      },

      info: {
        title: `Bulletin de notes - ${nomEleve}`,
        author: 'Scoolli.com',
        subject: `Bulletin de notes ${anneeScolaire} - ${sessionSemestre}`,
        creator: 'Scoolli.com',
        keywords: 'bulletin, notes, école, scoolli'
      }
    };

    return documentDefinition;
  }

  getDocumentFicheBulletinV3(): any {

    const details = this.detailsBulletinEleve;

    const matieres =
      details?.bulletinMatiereDetailsDTOS || [];

    // ============================================================
    // CALCULS GÉNÉRAUX
    // ============================================================

    const totalCoef = matieres.reduce(
      (sum: number, m: any) =>
        sum + (Number(m.coefficient) || 0),
      0
    );

    const totalNotePonderee = matieres.reduce(
      (sum: number, m: any) => {

        const coef =
          Number(m.coefficient) || 0;

        const moyenne =
          Number(m.moyenneFinale) || 0;

        return sum + (coef * moyenne);
      },
      0
    );

    // ============================================================
    // INFORMATIONS BULLETIN
    // ============================================================

    const moyenneGeneraleEleve =
      Number(details?.moyenneEleve || 0).toFixed(2);

    const moyenneClasse =
      Number(details?.moyenneClasse || 0).toFixed(2);

    const nombreEleves =
      Number(details?.nombreEleve || 0);

    const rangEleve =
      details?.rangEleve !== null &&
        details?.rangEleve !== undefined
        ? details.rangEleve
        : '-';

    const totalAbsences =
      details?.absenceRetard !== null &&
        details?.absenceRetard !== undefined
        ? Number(details.absenceRetard)
        : 0;

    const appreciationGenerale =
      details?.appreciationGenerale ||
      'Non renseignée';

    // ============================================================
    // DOCUMENT PDF
    // ============================================================

    return {

      pageSize: 'A4',

      pageMargins: [
        40,
        40,
        40,
        40
      ],

      content: [

        // ========================================================
        // EN-TÊTE DE L'ÉTABLISSEMENT
        // ========================================================

        {
          columns: [

            {
              image: EncodateLogo.image,
              width: 100,
              alignment: 'left'
            },

            {
              text: [

                {
                  text:
                    "ÉCOLE LES DAUPHINS\n",
                  fontSize: 12,
                  bold: true
                },

                {
                  text:
                    "Derrière le casino du cap vert, Dakar\n",
                  fontSize: 9,
                  color: '#555555'
                },

                {
                  text:
                    "Tél: 33 820 10 92 - BP 6268 Dakar étoile\n",
                  fontSize: 9,
                  color: '#555555'
                },

                {
                  text:
                    "Web: www.ecolelesdauphins.org\n",
                  fontSize: 9,
                  color: '#4A90E2',
                  link:
                    'http://www.ecolelesdauphins.org'
                },

                {
                  text:
                    "« L'école pour grandir »",
                  fontSize: 10,
                  italic: true,
                  bold: true
                }

              ],

              alignment: 'right',

              margin: [
                0,
                5,
                0,
                0
              ]
            }

          ]
        },

        // ========================================================
        // LIGNE
        // ========================================================

        {
          canvas: [

            {
              type: 'line',

              x1: 0,
              y1: 0,

              x2: 515,
              y2: 0,

              lineWidth: 1,

              lineColor: '#E0E0E0'
            }

          ],

          margin: [
            0,
            15,
            0,
            15
          ]
        },

        // ========================================================
        // ANNÉE SCOLAIRE / SEMESTRE
        // ========================================================

        {
          columns: [

            {
              text:
                `ANNÉE SCOLAIRE : ${details?.anneeScolaire || ''}`,

              fontSize: 11,

              bold: true,

              color: '#333333'
            },

            {
              text:
                `${details?.sessionSemestre?.toUpperCase() || ''}`,

              fontSize: 11,

              bold: true,

              alignment: 'right',

              color: '#1A5276'
            }

          ]
        },

        // ========================================================
        // TITRE
        // ========================================================

        {
          text: 'BULLETIN DE NOTES',

          fontSize: 18,

          alignment: 'center',

          bold: true,

          color: '#1A5276',

          margin: [
            0,
            15,
            0,
            20
          ],

          characterSpacing: 1
        },

        // ========================================================
        // INFORMATIONS ÉLÈVE
        // ========================================================

        {
          style: 'infoTable',

          table: {

            widths: [
              '*',
              '*'
            ],

            body: [

              [

                {
                  text: [

                    {
                      text: 'Élève : ',
                      bold: true
                    },

                    {
                      text:
                        details?.nomCompletEleve || ''
                    }

                  ],

                  fontSize: 11
                },

                {

                  text: [

                    {
                      text: 'Classe : ',
                      bold: true
                    },

                    {
                      text:
                        details?.classe || ''
                    }

                  ],

                  fontSize: 11
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
                      text:
                        details?.dateNaissanceEleve || ''
                    },

                    {
                      text: ' à '
                    },

                    {
                      text:
                        details?.lieuNaissanceEleve || ''
                    }

                  ],

                  fontSize: 10
                },

                {

                  text: [

                    {
                      text: 'Effectif de la classe : ',
                      bold: true
                    },

                    {
                      text:
                        `${nombreEleves} élèves`
                    }

                  ],

                  fontSize: 10
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

          margin: [
            0,
            0,
            0,
            25
          ]
        },

        // ========================================================
        // TABLEAU DES NOTES
        // ========================================================

        {

          table: {

            widths: [
              '*',
              40,
              50,
              70,
              60,
              65,
              '*'
            ],

            headerRows: 1,

            body: [

              // ----------------------------------------------------
              // HEADER
              // ----------------------------------------------------

              [

                {
                  text: 'Matière',
                  style: 'tableHeader',
                  alignment: 'left'
                },

                {
                  text: 'Coéf',
                  style: 'tableHeader'
                },

                {
                  text: 'MCC',
                  style: 'tableHeader'
                },

                {
                  text: 'Compo.',
                  style: 'tableHeader'
                },

                {
                  text: 'Moy/20',
                  style: 'tableHeader'
                },

                {
                  text: 'Total',
                  style: 'tableHeader'
                },

                {
                  text: 'Appréciation',
                  style: 'tableHeader',
                  alignment: 'left'
                }

              ],

              // ----------------------------------------------------
              // MATIÈRES
              // ----------------------------------------------------

              ...matieres.map((m: any) => {

                // Mapping CORRECT avec le JSON backend
                const coef =
                  Number(m.coefficient) || 0;

                const moyenneDevoirs =
                  Number(m.moyenneDevoirs) || 0;

                const noteComposition =
                  Number(m.noteComposition) || 0;

                const moyenneFinale =
                  Number(m.moyenneFinale) || 0;

                const appreciationMatiere =
                  m.appreciationMatiere || '';

                const totalMatiere =
                  (moyenneFinale * coef).toFixed(2);

                return [

                  {
                    text:
                      m.matiere || '',

                    alignment: 'left',

                    fontSize: 10,

                    bold: true
                  },

                  {
                    text:
                      coef.toString(),

                    alignment: 'center',

                    fontSize: 10
                  },

                  {
                    text:
                      moyenneDevoirs.toFixed(2),

                    alignment: 'center',

                    fontSize: 10
                  },

                  {
                    text:
                      noteComposition.toFixed(2),

                    alignment: 'center',

                    fontSize: 10
                  },

                  {
                    text:
                      moyenneFinale.toFixed(2),

                    alignment: 'center',

                    fontSize: 10,

                    bold: true,

                    color:
                      moyenneFinale < 10
                        ? '#C0392B'
                        : '#2C3E50'
                  },

                  {
                    text:
                      totalMatiere,

                    alignment: 'center',

                    fontSize: 10
                  },

                  {
                    text:
                      appreciationMatiere,

                    alignment: 'left',

                    fontSize: 9,

                    italic: true
                  }

                ];

              }),

              // ----------------------------------------------------
              // TOTAL
              // ----------------------------------------------------

              [

                {
                  text: 'TOTAL',

                  bold: true,

                  alignment: 'left',

                  fontSize: 10,

                  fillColor: '#EAEDED'
                },

                {

                  text:
                    totalCoef.toString(),

                  bold: true,

                  alignment: 'center',

                  fontSize: 10,

                  fillColor: '#EAEDED'
                },

                {
                  text: '',
                  fillColor: '#EAEDED'
                },

                {
                  text: '',
                  fillColor: '#EAEDED'
                },

                {
                  text: '',
                  fillColor: '#EAEDED'
                },

                {

                  text:
                    totalNotePonderee.toFixed(2),

                  bold: true,

                  alignment: 'center',

                  fontSize: 10,

                  fillColor: '#EAEDED',

                  color: '#1A5276'
                },

                {
                  text: '',
                  fillColor: '#EAEDED'
                }

              ]

            ]

          },

          layout: {

            hLineWidth:
              (i: number, node: any) =>
                (
                  i === 0 ||
                  i === node.table.body.length
                )
                  ? 1.5
                  : 1,

            vLineWidth: () => 1,

            hLineColor:
              (i: number, node: any) =>
                (
                  i === 0 ||
                  i === node.table.body.length
                )
                  ? '#2C3E50'
                  : '#E5E7E9',

            vLineColor: () =>
              '#E5E7E9',

            paddingTop: () => 6,

            paddingBottom: () => 6

          },

          margin: [
            0,
            0,
            0,
            25
          ]
        },

        // ========================================================
        // SYNTHÈSE ET RÉSULTATS
        // ========================================================

        {

          columns: [

            // ----------------------------------------------------
            // STATISTIQUES
            // ----------------------------------------------------

            {

              width: '55%',

              table: {

                widths: [
                  '*',
                  60
                ],

                body: [

                  [

                    {
                      text:
                        'Moyenne Générale de l\'élève',

                      bold: true,

                      fontSize: 10
                    },

                    {
                      text:
                        `${moyenneGeneraleEleve} / 20`,

                      bold: true,

                      alignment: 'right',

                      fontSize: 11,

                      color:
                        Number(moyenneGeneraleEleve) >= 10
                          ? '#27AE60'
                          : '#C0392B'
                    }

                  ],

                  [

                    {
                      text:
                        'Moyenne de la classe',

                      fontSize: 10
                    },

                    {
                      text:
                        `${moyenneClasse} / 20`,

                      alignment: 'right',

                      fontSize: 10
                    }

                  ],

                  [

                    {
                      text:
                        'Rang de l\'élève',

                      bold: true,

                      fontSize: 10
                    },

                    {
                      text:
                        rangEleve === '-'
                          ? '-'
                          : `${rangEleve} ${rangEleve === 1 ? 'er' : 'ème'}`,

                      bold: true,

                      alignment: 'right',

                      fontSize: 10,

                      color: '#1A5276'
                    }

                  ],

                  [

                    {
                      text:
                        'Absences & Retards non justifiés',

                      fontSize: 10
                    },

                    {

                      text:
                        `${totalAbsences} incident(s)`,

                      alignment: 'right',

                      fontSize: 10,

                      color:
                        totalAbsences > 0
                          ? '#E67E22'
                          : '#2C3E50'
                    }

                  ]

                ]

              },

              layout: {

                paddingTop: () => 6,

                paddingBottom: () => 6,

                hLineColor: () =>
                  '#F2F4F4'

              }

            },

            // ----------------------------------------------------
            // ESPACE
            // ----------------------------------------------------

            {
              width: '5%',
              text: ''
            },

            // ----------------------------------------------------
            // OBSERVATIONS
            // ----------------------------------------------------

            {

              width: '40%',

              table: {

                widths: [
                  '*'
                ],

                body: [

                  [

                    {
                      text:
                        'OBSERVATIONS DU CONSEIL',

                      bold: true,

                      fontSize: 9,

                      color: '#7F8C8D',

                      alignment: 'center',

                      fillColor: '#F2F4F4'
                    }

                  ],

                  [

                    {

                      text:
                        appreciationGenerale,

                      fontSize: 11,

                      bold: true,

                      alignment: 'center',

                      margin: [
                        0,
                        15,
                        0,
                        15
                      ],

                      italic: true

                    }

                  ]

                ]

              },

              layout: {

                hLineWidth: () => 1,

                vLineWidth: () => 1,

                hLineColor: () =>
                  '#BDC3C7',

                vLineColor: () =>
                  '#BDC3C7'

              }

            }

          ]

        },

        // ========================================================
        // SIGNATURE
        // ========================================================

        {

          margin: [
            0,
            45,
            0,
            0
          ],

          columns: [

            {
              text: '',
              width: '*'
            },

            {

              width: 200,

              stack: [

                {

                  text:
                    `Fait à Dakar, le ${details?.dateCreation || ''}`,

                  fontSize: 9,

                  italic: true,

                  alignment: 'center'

                },

                {

                  text:
                    'Le Chef d\'Établissement',

                  bold: true,

                  fontSize: 10,

                  alignment: 'center',

                  margin: [
                    0,
                    5,
                    0,
                    45
                  ]

                },

                {

                  text:
                    'Signature & Cachet',

                  fontSize: 9,

                  alignment: 'center',

                  color: '#BDC3C7',

                  decoration: 'underline'

                }

              ]

            }

          ]

        }

      ],

      // ==========================================================
      // STYLES
      // ==========================================================

      styles: {

        tableHeader: {

          bold: true,

          fontSize: 10,

          color: '#FFFFFF',

          fillColor: '#2C3E50',

          alignment: 'center',

          margin: [
            0,
            2,
            0,
            2
          ]

        },

        infoTable: {}

      }

    };
  }


  getDocumentFicheBulletinV1(): any {
    const details = this.detailsBulletinEleve;
    const matieres = details?.bulletinMatiereDetailsDTOS || [];
    const totalCoef = matieres.reduce((sum: number, m: any) => sum + (Number(m.coefficient) || 0), 0);
    const totalNotePonderee = matieres.reduce((sum: number, m: any) => {
      const coef = Number(m.coefficient) || 0;
      const moyenne = Number(m.moyenne_finale) || 0;
      return sum + (coef * moyenne);
    }, 0);

    // Utilisation des bonnes variables camelCase provenant du JSON corrigé
    const moyenneGeneraleEleve = details?.moyenneEleve ? details.moyenneEleve.toFixed(2) : '0.00';
    const moyenneClasse = details?.moyenneClasse ? details.moyenneClasse.toFixed(2) : '0.00';
    const nombreEleves = details?.nombreEleve || 0;
    const rangEleve = details?.rangEleve || '-';
    const totalAbsences = details?.absenceRetard !== undefined ? details.absenceRetard : 0;
    const appreciationGenerale = details?.appreciationGenerale || 'Non renseignée';

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        // EN-TÊTE DE L'ÉTABLISSEMENT
        {
          columns: [
            {
              image: EncodateLogo.image,
              width: 100,
              alignment: 'left'
            },
            {
              text: [
                { text: "ÉCOLE LES DAUPHINS\n", fontSize: 12, bold: true },
                { text: "Derrière le casino du cap vert, Dakar\n", fontSize: 9, color: '#555555' },
                { text: "Tél: 33 820 10 92 - BP 6268 Dakar étoile\n", fontSize: 9, color: '#555555' },
                { text: "Web: www.ecolelesdauphins.org\n", fontSize: 9, color: '#4A90E2', link: 'http://www.ecolelesdauphins.org' },
                { text: "« L'école pour grandir »", fontSize: 10, italic: true, bold: true }
              ],
              alignment: 'right',
              margin: [0, 5, 0, 0]
            }
          ]
        },

        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E0E0E0' }], margin: [0, 15, 0, 15] },

        // TITRE DU DOCUMENT & ANNÉE
        {
          columns: [
            { text: `ANNÉE SCOLAIRE : ${details?.anneeScolaire || ''}`, fontSize: 11, bold: true, color: '#333333' },
            { text: `${details?.sessionSemestre?.toUpperCase() || ''}`, fontSize: 11, bold: true, alignment: 'right', color: '#1A5276' }
          ]
        },
        { text: 'BULLETIN DE NOTES', fontSize: 18, alignment: 'center', bold: true, color: '#1A5276', margin: [0, 15, 0, 20], letterSpacing: 1 },

        // BLOC INFORMATIONS ÉLÈVE
        {
          style: 'infoTable',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: [{ text: 'Élève : ', bold: true }, { text: details?.nomCompletEleve || '' }], fontSize: 11 },
                { text: [{ text: 'Classe : ', bold: true }, { text: details?.classe || '' }], fontSize: 11 }
              ],
              [
                { text: [{ text: 'Né(e) le : ', bold: true }, { text: details?.dateNaissanceEleve || '' }, { text: ' à ' }, { text: details?.lieuNaissanceEleve || '' }], fontSize: 10 },
                { text: [{ text: 'Effectif de la classe : ', bold: true }, { text: `${nombreEleves} élèves` }], fontSize: 10 }
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
          margin: [0, 0, 0, 25]
        },

        // TABLEAU DES NOTES
        {
          table: {
            widths: ['*', 40, 50, 70, 60, 65, '*'],
            headerRows: 1,
            body: [
              // Header du tableau
              [
                { text: 'Matière', style: 'tableHeader', alignment: 'left' },
                { text: 'Coéf', style: 'tableHeader' },
                { text: 'MCC', style: 'tableHeader' },
                { text: 'Compo.', style: 'tableHeader' },
                { text: 'Moy/20', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' },
                { text: 'Appréciation', style: 'tableHeader', alignment: 'left' }
              ],
              // Contenu dynamique
              ...matieres.map((m: any) => {
                const moy = Number(m.moyenne_finale) || 0;
                const coef = Number(m.coefficient) || 0;
                const totalMatiere = (moy * coef).toFixed(2);
                return [
                  { text: m.matiere, alignment: 'left', fontSize: 10, bold: true },
                  { text: coef.toString(), alignment: 'center', fontSize: 10 },
                  { text: m.moyenne_devoirs.toFixed(2), alignment: 'center', fontSize: 10 },
                  { text: m.note_composition.toFixed(2), alignment: 'center', fontSize: 10 },
                  { text: moy.toFixed(2), alignment: 'center', fontSize: 10, bold: true, color: moy < 10 ? '#C0392B' : '#2C3E50' },
                  { text: totalMatiere, alignment: 'center', fontSize: 10 },
                  { text: m.appreciation_matiere || '', alignment: 'left', fontSize: 9, italic: true }
                ];
              }),
              // Ligne de Totalisation
              [
                { text: 'TOTAL', bold: true, alignment: 'left', fontSize: 10, fillColor: '#EAEDED' },
                { text: totalCoef.toString(), bold: true, alignment: 'center', fontSize: 10, fillColor: '#EAEDED' },
                { text: '', fillColor: '#EAEDED' },
                { text: '', fillColor: '#EAEDED' },
                { text: '', fillColor: '#EAEDED' },
                { text: totalNotePonderee.toFixed(2), bold: true, alignment: 'center', fontSize: 10, fillColor: '#EAEDED', color: '#1A5276' },
                { text: '', fillColor: '#EAEDED' }
              ]
            ]
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1.5 : 1,
            vLineWidth: () => 1,
            hLineColor: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? '#2C3E50' : '#E5E7E9',
            vLineColor: () => '#E5E7E9',
            paddingTop: () => 6,
            paddingBottom: () => 6
          },
          margin: [0, 0, 0, 25]
        },

        // SECTION SYNTHÈSE ET RÉSULTATS
        {
          columns: [
            // Bloc de gauche : Les statistiques de notes
            {
              width: '55%',
              table: {
                widths: ['*', 60],
                body: [
                  [
                    { text: 'Moyenne Générale de l\'élève', bold: true, fontSize: 10 },
                    { text: `${moyenneGeneraleEleve} / 20`, bold: true, alignment: 'right', fontSize: 11, color: Number(moyenneGeneraleEleve) >= 10 ? '#27AE60' : '#C0392B' }
                  ],
                  [
                    { text: 'Moyenne de la classe', fontSize: 10 },
                    { text: `${moyenneClasse} / 20`, alignment: 'right', fontSize: 10 }
                  ],
                  [
                    { text: 'Rang de l\'élève', bold: true, fontSize: 10 },
                    { text: `${rangEleve} ${rangEleve === 1 ? 'er' : 'ème'}`, bold: true, alignment: 'right', fontSize: 10, color: '#1A5276' }
                  ],
                  [
                    { text: 'Absences & Retards non justifiés', fontSize: 10 },
                    { text: `${totalAbsences} incident(s)`, alignment: 'right', fontSize: 10, color: totalAbsences > 0 ? '#E67E22' : '#2C3E50' }
                  ]
                ]
              },
              layout: {
                paddingTop: () => 6,
                paddingBottom: () => 6,
                hLineColor: () => '#F2F4F4'
              }
            },
            // Espace de séparation
            { width: '5%', text: '' },
            // Bloc de droite : Observations & Conseil des professeurs
            {
              width: '40%',
              table: {
                widths: ['*'],
                body: [
                  [{ text: 'OBSERVATIONS DU CONSEIL', bold: true, fontSize: 9, color: '#7F8C8D', alignment: 'center', fillColor: '#F2F4F4' }],
                  [{
                    text: appreciationGenerale,
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                    italic: true
                  }]
                ]
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#BDC3C7',
                vLineColor: () => '#BDC3C7'
              }
            }
          ]
        },

        // ZONE SIGNATURE
        {
          margin: [0, 50, 0, 0],
          columns: [
            { text: '', width: '*' },
            {
              width: 200,
              stack: [
                { text: `Fait à Dakar, le ${details?.dateCreation || ''}`, fontSize: 9, italic: true, alignment: 'center' },
                { text: 'Le Chef d\'Établissement', bold: true, fontSize: 10, alignment: 'center', margin: [0, 5, 0, 45] },
                { text: 'Signature & Cachet', fontSize: 9, alignment: 'center', color: '#BDC3C7', decoration: 'underline' }
              ]
            }
          ]
        }
      ],

      styles: {
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#FFFFFF',
          fillColor: '#2C3E50',
          alignment: 'center',
          margin: [0, 2, 0, 2]
        }
      }
    };
  }





}
