import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportFileService } from '../../services/export-file.service';

import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReferentielService } from '../../../features/administration/referentiel/service/referentiel.service';
import { ConfirmationDialogModalComponent } from '../../components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { EncodateLogo } from '../../enumeration/encodage-logo-data';
import { IFilterConfig } from '../../filtered-config/FiltreConfiguration';
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
  detailsInscriptionEleve?: any;
  matieres?: any;
  totalCoef?: any;
  moyenneGeneraleEleve?: any;

  parametresEtablissement: ParametresEtablissement = {};
  logoUrl: string = '';

  onDateRangeChange(fromKey: string, toKey: string, event: any) {
    this.filterChange.emit({
      filter: { key: 'dateRange', fromKey, toKey } as IFilterConfig,
      value: event
    });
  }

  private readonly router = inject(Router);
  private readonly sharedResourceService = inject(SharedResourceService);
  private readonly serviceCommun = inject(CommonService);
  private readonly exportService = inject(ExportFileService);
  private readonly modalService = inject(NgbModal);
  private readonly toast = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly referentielService = inject(ReferentielService);

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
      this.router.navigate([baseLink, this.selectedItem.id], {
        state: { data: this.selectedItem }
      });
    } else {
      this.router.navigate([baseLink, row.id], {
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
    this.serviceCommun.desactiverResource(endpoint, row.id).subscribe(
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
    this.serviceCommun.activeResource(endpoint, row.id).subscribe(
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
      // Nouvelle colonne : tri ascendant par défaut
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    if (this.sortDirection) {
      this.filteredData.sort((a, b) => {
        const valueA = a[columnKey];
        const valueB = b[columnKey];

        if (valueA == null || valueB == null) return 0;
        // Gestion spécifique pour les dates
        if (columnKey === 'dateEngagement' || columnKey === 'dateDemande' || columnKey === 'dateValeur') {
          const dateA = new Date(valueA);
          const dateB = new Date(valueB);

          if (this.sortDirection === 'asc') {
            return dateA.getTime() - dateB.getTime(); // Tri ascendant
          } else {
            return dateB.getTime() - dateA.getTime(); // Tri descendant
          }
        }

        // Gestion standard pour les autres colonnes
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return this.sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }
      });
    } else {
      // Sans tri : réinitialiser les données à leur état d'origine
      this.filteredData = [...this.tableData];
    }
  }

  ngOnInit(): void {
    this.sortTable('dateEngagement');
    this.matieres = this.detailsBulletinEleve?.bulletinMatiereDetailsDTOS || [];
    this.getParametresEtablissement();
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
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Ajoute un espace entre la lettre minuscule et la majuscule
      .replace(/^./, (str) => str.toUpperCase()); // Met la première lettre en majuscule
  }

  // Méthode pour fermer le popup
  closePopup(): void {
    this.isPopupVisible = false; // Cache le popup
    this.selectedItem = {}; // Réinitialise l'élément sélectionné
    this.splitKeys = []; // Vide les clés divisées
  }

  sendDepense(baseLink: any, row: any) {
    this.router.navigate([baseLink, row.id], {
      state: { data: row }
    });
  }

  @Output() selectionChange = new EventEmitter<any[]>(); // ✅ Événement pour transmettre les données

  selectedRows: any[] = [];

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

  // reçu

  generatePdfDuRecu(row: any) {
    if (row.id) {
      this.getDetailsInscriptionEleve(row.id);
    }
  }

  getDetailsInscriptionEleve(inscriptionId: number) {
    this.sharedResourceService.afficherDetailsResource('inscription', inscriptionId).subscribe({
      next: (data) => {
        this.detailsInscriptionEleve = data;
        console.log('details inscription', this.detailsInscriptionEleve)
        this.imprimerRecu();
      }
    });
  }

  imprimerRecu() {
    pdfMake.createPdf(this.getDocumentRecuInscription()).open();
  }

  DownloadPdfRecu() {
    const document: any = this.getDocumentRecuInscription();
    pdfMake.createPdf(document).download('"Recu_"' + this.detailsInscriptionEleve.classe + '.pdf');
  }

  getDocumentRecuInscription(): any {
    if (!this.detailsInscriptionEleve) return {};

    // Extraction et formatage des données du JSON d'inscription
    const codeDossier = this.detailsInscriptionEleve.code || '';
    const eleve = this.detailsInscriptionEleve.eleveDTO || {};
    const classe = this.detailsInscriptionEleve.classeDTO?.libelle || '';
    const anneeScolaire = this.detailsInscriptionEleve.anneeScolaireDTO?.libelle || '';
    const montant = this.detailsInscriptionEleve.montantInscription || 0;

    // Formatage de la date d'inscription (ex: 30/05/2026)
    let dateInscriptionFormatted = '';
    if (this.detailsInscriptionEleve.dateInscription) {
      const d = new Date(this.detailsInscriptionEleve.dateInscription);
      dateInscriptionFormatted = d.toLocaleDateString('fr-FR');
    }

    // Correction du montant : Remplacement des espaces bizarres par un espace standard
    const formatDevise = (val: number) => {
      const brute = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(val);
      return brute.replace(/[\u00A0\u202F]/g, ' ').replace('F CFA', 'F CFA');
    };

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        // EN-TÊTE DE L'ÉTABLISSEMENT
        {
          columns: [
            {
              text: 'LOGO ECOLE', // Diminué de 16 à 12
              fontSize: 12,
              bold: true,
              color: '#1A5276',
              width: 100,
              alignment: 'left'
            },
            {
              text: [
                { text: "ÉCOLE LES DAUPHINS\n", fontSize: 11, bold: true, color: '#1A5276' }, // Diminué de 13 à 11
                { text: "Derrière le casino du cap vert, Dakar\n", fontSize: 8, color: '#555555' }, // Diminué à 8
                { text: "Tél: 33 820 10 92 - BP 6268 Dakar étoile\n", fontSize: 8, color: '#555555' },
                { text: "Web: www.ecolelesdauphins.org\n", fontSize: 8, color: '#4A90E2' },
                { text: "« L'école pour grandir »", fontSize: 8, italic: true, bold: true }
              ],
              alignment: 'right',
              margin: [0, 0, 0, 0]
            }
          ]
        },

        // Séparateur discret
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E0E0E0' }], margin: [0, 12, 0, 12] },

        // TITRE DU REÇU & NUMÉRO DE DOSSIER
        {
          columns: [
            { text: `ANNÉE SCOLAIRE : ${anneeScolaire}`, fontSize: 9.5, bold: true, color: '#333333' }, // Diminué de 11 à 9.5
            { text: `Date : ${dateInscriptionFormatted}`, fontSize: 9.5, bold: true, alignment: 'right', color: '#555555' } // Diminué de 11 à 9.5
          ]
        },
        {
          text: 'REÇU D\'INSCRIPTION', // Diminué de 20 à 15
          fontSize: 15,
          alignment: 'center',
          bold: true,
          color: '#1A5276',
          margin: [0, 15, 0, 4],
          letterSpacing: 1
        },
        {
          text: `N° ${codeDossier}`, // Diminué de 11 à 9.5
          fontSize: 9.5,
          alignment: 'center',
          bold: true,
          color: '#7F8C8D',
          margin: [0, 0, 0, 20]
        },

        // BLOC INFORMATIONS ÉLÈVE & INSCRIPTION
        {
          style: 'infoTable',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: [{ text: 'Code Élève : ', bold: true }, { text: eleve.matricule || '' }], fontSize: 10 },
                { text: [{ text: 'Classe Cible : ', bold: true }, { text: classe }], fontSize: 10 }
              ],
              [
                { text: [{ text: 'Nom complet : ', bold: true }, { text: `${eleve.prenom || ''} ${eleve.nom || ''}`.toUpperCase() }], fontSize: 10 },
                { text: [{ text: 'Sexe : ', bold: true }, { text: eleve.sexe || '' }], fontSize: 10 }
              ],
              [
                { text: [{ text: 'Né(e) le : ', bold: true }, { text: eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '' }, { text: ' à ' }, { text: eleve.lieuNaissance || '' }], fontSize: 10 },
                { text: [{ text: 'Nationalité : ', bold: true }, { text: eleve.nationalite || '' }], fontSize: 10 }
              ]
            ]
          },
          layout: {
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 10,
            paddingBottom: () => 10,
            fillColor: '#F8F9F9',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E5E7E9',
            vLineColor: () => '#E5E7E9'
          },
          margin: [0, 0, 0, 25]
        },

        // TABLEAU FINANCIER
        {
          table: {
            widths: ['*', 120],
            headerRows: 1,
            body: [
              [
                { text: 'Désignation / Libellé de l\'opération', style: 'tableHeader', alignment: 'left' },
                { text: 'Montant versé', style: 'tableHeader', alignment: 'right' }
              ],
              [
                { text: `Frais d'inscription scolaire — Classe de ${classe}\n(Dossier de candidature validé)`, alignment: 'left', fontSize: 10.5, margin: [0, 8, 0, 8] },
                { text: formatDevise(montant), alignment: 'right', fontSize: 10.5, bold: true, margin: [0, 8, 0, 8] }
              ],
              [
                { text: 'TOTAL PAYÉ', bold: true, alignment: 'left', fontSize: 10.5, fillColor: '#EAEDED', margin: [0, 6, 0, 6] },
                { text: formatDevise(montant), bold: true, alignment: 'right', fontSize: 11, fillColor: '#EAEDED', color: '#27AE60', margin: [0, 6, 0, 6] }
              ]
            ]
          },
          layout: {
            hLineWidth: (i: any, node: any) => { return (i === 0 || i === node.table.body.length) ? 1.5 : 1; },
            vLineWidth: () => 1,
            hLineColor: (i: any, node: any) => { return (i === 0 || i === node.table.body.length) ? '#1A5276' : '#E5E7E9'; },
            vLineColor: () => '#E5E7E9',
            paddingLeft: () => 10,
            paddingRight: () => 10
          },
          margin: [0, 0, 0, 35]
        },

        // MENTION LÉGALE & SIGNATURE
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'IMPORTANT :', bold: true, fontSize: 8.5, color: '#C0392B', margin: [0, 0, 0, 4] },
                { text: 'Ce reçu tient lieu de preuve officielle d\'inscription pour l\'année scolaire en cours. Il doit être conservé soigneusement par les parents pour toute réclamation administrative ou fiscale.', fontSize: 8, color: '#7F8C8D', leadingLineHeight: 1.2 }
              ]
            },
            { width: '10%', text: '' },
            {
              width: '40%',
              stack: [
                { text: `Fait à Dakar, le ${dateInscriptionFormatted}`, fontSize: 8.5, italic: true, alignment: 'center' },
                { text: 'L\'Agent Comptable / Le Trésorier', bold: true, fontSize: 9.5, alignment: 'center', margin: [0, 6, 0, 45] },
                { text: 'Signature & Cachet de l\'École', fontSize: 8, alignment: 'center', color: '#BDC3C7', decoration: 'underline' }
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
          fillColor: '#1A5276',
          margin: [0, 4, 0, 4]
        }
      }
    };
  }

  getDocumentRecuInscription11(): any {
    if (!this.detailsInscriptionEleve) return {};

    const codeDossier = this.detailsInscriptionEleve.code || '';
    const eleve = this.detailsInscriptionEleve.eleveDTO || {};
    const classe = this.detailsInscriptionEleve.classeDTO?.libelle || '';
    const anneeScolaire = this.detailsInscriptionEleve.anneeScolaireDTO?.libelle || '';
    const montant = this.detailsInscriptionEleve.montantInscription || 0;

    let dateInscriptionFormatted = '';
    if (this.detailsInscriptionEleve.dateInscription) {
      const d = new Date(this.detailsInscriptionEleve.dateInscription);
      dateInscriptionFormatted = d.toLocaleDateString('fr-FR');
    }

    const formatDevise = (val: number) => {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(val);
    };

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          columns: [
            {
              text: 'LOGO\nECOLE',
              fontSize: 16,
              bold: true,
              color: '#1A5276',
              width: 100,
              alignment: 'left'
            },
            {
              text: [
                { text: "ÉCOLE LES DAUPHINS\n", fontSize: 13, bold: true, color: '#1A5276' },
                { text: "Derrière le casino du cap vert, Dakar\n", fontSize: 9, color: '#555555' },
                { text: "Tél: 33 820 10 92 - BP 6268 Dakar étoile\n", fontSize: 9, color: '#555555' },
                { text: "Web: www.ecolelesdauphins.org\n", fontSize: 9, color: '#4A90E2' },
                { text: "« L'école pour grandir »", fontSize: 9, italic: true, bold: true }
              ],
              alignment: 'right',
              margin: [0, 0, 0, 0]
            }
          ]
        },

        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E0E0E0' }], margin: [0, 15, 0, 15] },

        {
          columns: [
            { text: `ANNÉE SCOLAIRE : ${anneeScolaire}`, fontSize: 11, bold: true, color: '#333333' },
            { text: `Date : ${dateInscriptionFormatted}`, fontSize: 11, bold: true, alignment: 'right', color: '#555555' }
          ]
        },
        {
          text: 'REÇU D\'INSCRIPTION',
          fontSize: 20,
          alignment: 'center',
          bold: true,
          color: '#1A5276',
          margin: [0, 20, 0, 5],
          letterSpacing: 1
        },
        {
          text: `N° ${codeDossier}`,
          fontSize: 11,
          alignment: 'center',
          bold: true,
          color: '#7F8C8D',
          margin: [0, 0, 0, 25]
        },

        {
          style: 'infoTable',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: [{ text: 'Code Élève : ', bold: true }, { text: eleve.matricule || '' }], fontSize: 10 },
                { text: [{ text: 'Classe Cible : ', bold: true }, { text: classe }], fontSize: 10 }
              ],
              [
                { text: [{ text: 'Nom complet : ', bold: true }, { text: `${eleve.prenom || ''} ${eleve.nom || ''}`.toUpperCase() }], fontSize: 10 },
                { text: [{ text: 'Sexe : ', bold: true }, { text: eleve.sexe || '' }], fontSize: 10 }
              ],
              [
                { text: [{ text: 'Né(e) le : ', bold: true }, { text: eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '' }, { text: ' à ' }, { text: eleve.lieuNaissance || '' }], fontSize: 10 },
                { text: [{ text: 'Nationalité : ', bold: true }, { text: eleve.nationalite || '' }], fontSize: 10 }
              ]
            ]
          },
          layout: {
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 10,
            paddingBottom: () => 10,
            fillColor: '#F8F9F9',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E5E7E9',
            vLineColor: () => '#E5E7E9'
          },
          margin: [0, 0, 0, 30]
        },

        {
          table: {
            widths: ['*', 120],
            headerRows: 1,
            body: [
              [
                { text: 'Désignation / Libellé de l\'opération', style: 'tableHeader', alignment: 'left' },
                { text: 'Montant versé', style: 'tableHeader', alignment: 'right' }
              ],
              [
                { text: `Frais d'inscription scolaire — Classe de ${classe}\n(Dossier de candidature validé)`, alignment: 'left', fontSize: 11, margin: [0, 8, 0, 8] },
                { text: formatDevise(montant), alignment: 'right', fontSize: 11, bold: true, margin: [0, 8, 0, 8] }
              ],
              [
                { text: 'TOTAL PAYÉ', bold: true, alignment: 'left', fontSize: 11, fillColor: '#EAEDED', margin: [0, 6, 0, 6] },
                { text: formatDevise(montant), bold: true, alignment: 'right', fontSize: 12, fillColor: '#EAEDED', color: '#27AE60', margin: [0, 6, 0, 6] }
              ]
            ]
          },
          layout: {
            hLineWidth: (i: any, node: any) => { return (i === 0 || i === node.table.body.length) ? 1.5 : 1; },
            vLineWidth: () => 1,
            hLineColor: (i: any, node: any) => { return (i === 0 || i === node.table.body.length) ? '#1A5276' : '#E5E7E9'; },
            vLineColor: () => '#E5E7E9',
            paddingLeft: () => 10,
            paddingRight: () => 10
          },
          margin: [0, 0, 0, 40]
        },

        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'IMPORTANT :', bold: true, fontSize: 9, color: '#C0392B', margin: [0, 0, 0, 4] },
                { text: 'Ce reçu tient lieu de preuve officielle d\'inscription pour l\'année scolaire en cours. Il doit être conservé soigneusement par les parents pour toute réclamation administrative ou fiscale.', fontSize: 8.5, color: '#7F8C8D', leadingLineHeight: 1.2 }
              ]
            },
            { width: '10%', text: '' },
            {
              width: '40%',
              stack: [
                { text: `Fait à Dakar, le ${dateInscriptionFormatted}`, fontSize: 9, italic: true, alignment: 'center' },
                { text: 'L\'Agent Comptable / Le Trésorier', bold: true, fontSize: 10, alignment: 'center', margin: [0, 6, 0, 50] },
                { text: 'Signature & Cachet de l\'École', fontSize: 8.5, alignment: 'center', color: '#BDC3C7', decoration: 'underline' }
              ]
            }
          ]
        }
      ],

      styles: {
        tableHeader: {
          bold: true,
          fontSize: 10.5,
          color: '#FFFFFF',
          fillColor: '#1A5276',
          margin: [0, 4, 0, 4]
        }
      }
    };
  }

  // Bulletin

  generatePdfDuBulletin(row: any) {
    if (row.id) {
      this.getDetailsBulletinEleve(row.id);
    }
  }

  getDetailsBulletinEleve(bulletinId: number) {
    this.sharedResourceService.afficherDetailsResource('bulletin', bulletinId).subscribe({
      next: (data) => {
        this.detailsBulletinEleve = data;
        this.imprimerBulletin();
      }
    });
  }

  imprimerBulletin() {
    pdfMake.createPdf(this.getDocumentFicheBulletin()).open();
  }

  DownloadPdf() {
    const document: any = this.getDocumentFicheBulletin();
    pdfMake.createPdf(document).download('"BULLETIN_"' + this.detailsBulletinEleve.classe + '.pdf');
  }

  getDocumentFichePaiement1(): any {
    const matieres = this.detailsBulletinEleve?.bulletinMatiereDetailsDTOS || [];

    const totalCoef = matieres.reduce((sum: any, m: any) => sum + (Number(m.coefficient) || 0), 0);

    const totalNotePonderee = matieres.reduce((sum: any, m: any) => {
      const coef = Number(m.coefficient) || 0;
      const moyenne = Number(m.moyenne_finale) || 0;
      return sum + coef * moyenne;
    }, 0);
    const moyenneGenerale = totalCoef ? (totalNotePonderee / totalCoef).toFixed(2) : '0.00';

    return {
      content: [
        {
          columns: [

            [

              {
                image: EncodateLogo.image,
                width: 120,
                alignment: 'left',
                bold: true,
                margin: [0, 3, 0, 0],
                opacity: 1,
              },

            ],

            [
              {
                text: 'Derrière le casino du cap vert',
                fontSize: 10,
                bold: true,
                alignment: 'right',
              },
              {
                text: 'Tél: 33 820 10 92 - BP 6268 Dakar étoile',
                fontSize: 10,
                bold: true,
                alignment: 'right',
              },
              {
                text: 'Web: www.ecolelesdauphins.org / Email: ecolelesdauphin@gmail.com',
                fontSize: 10,
                bold: true,
                alignment: 'right',
              },
              {
                text: 'l\'Ecole pour grandir',
                fontSize: 14,
                bold: true,
                alignment: 'right',
              },
            ],
          ]
        },

        {
          text: ` Année scolaire : ${this.detailsBulletinEleve?.anneeScolaire}`,
          fontSize: 10,
          margin: [0, 15, 0, 15],
          alignment: 'right'
        },
        {
          text: 'BULLETIN DE NOTE',
          fontSize: 16,
          alignment: 'center',
          bold: true,
          margin: [0, 8, 0, 0]
        },
        {
          text: ` Nom et Prénom : ${this.detailsBulletinEleve?.nomCompletEleve}`,
          fontSize: 11,
          margin: [0, 15, 0, 15],
          alignment: 'left'
        },

        {
          columns: [

            [
              {
                text: ` Né le : ${this.detailsBulletinEleve?.dateNaissanceEleve} `,
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'left'
              },

            ],
            [
              {
                text: ` à : ${this.detailsBulletinEleve?.lieuNaissanceEleve}`,
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'center'
              }
            ],
            [

            ],
          ]
        },

        {
          columns: [

            [
              {
                text: ` Classe : ${this.detailsBulletinEleve?.classe} `,
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'left'
              },

            ],
            [
              {
                text: ` Nombre élève : ${this.detailsBulletinEleve?.nombre_eleve}`,
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'center'
              }
            ],
            [
              {
                text: ` Semestre : ${this.detailsBulletinEleve?.sessionSemestre} `,
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'left'
              },

            ],
          ]
        },

        {
          fontSize: 11,
          margin: [0, 10, 0, 10],
          table: {
            widths: [120, 30, 50, 65, 60, '*'],
            headerRows: 1,
            body: [
              [
                {
                  text: 'Matière',
                  fontSize: 11,
                  alignement: 'left',
                },
                {
                  text: 'Coéf',
                  fontSize: 11,
                  alignement: 'right',

                },
                {
                  text: 'MCC',
                  fontSize: 11,
                  alignement: 'right',

                },
                {
                  text: 'Composition',
                  fontSize: 11,
                  alignement: 'right',

                },

                {
                  text: 'Moyenne',
                  fontSize: 11,
                  alignement: 'right',

                },

                {
                  text: 'Appréciation',
                  fontSize: 11,
                  alignement: 'right',

                },
              ],
              ...this.detailsBulletinEleve?.bulletinMatiereDetailsDTOS?.map((b: any) => ([
                { text: b.matiere, alignment: 'left', fontSize: 10 },
                { text: b.coefficient.toString(), alignment: 'right', fontSize: 10 },
                { text: b.moyenne_devoirs.toString(), alignment: 'right', fontSize: 10 },
                { text: b.note_composition.toString(), alignment: 'right', fontSize: 10 },
                { text: b.moyenne_finale.toString(), alignment: 'right', fontSize: 10 },
                { text: b.appreciation_matiere, alignment: 'left', fontSize: 10 }
              ])),

              [
                {
                  text: 'TOTAL',
                  alignment: 'left',
                  fontSize: 11,
                },

                {
                  text: totalCoef.toString(),
                  fontSize: 11, alignment: 'right'
                },
                {
                  text: '',
                  fontSize: 11,
                  alignement: 'right',

                },
                {
                  text: '',
                  fontSize: 11,
                  alignement: 'right',

                },

                {
                  text: totalNotePonderee.toString(),
                  fontSize: 11, alignment: 'right'
                },

                {
                  text: '',
                  fontSize: 11,
                  alignement: 'right',

                },

              ],
            ]

          },

        },

        {
          fontSize: 11,
          columns: [

            [
              {
                text: ` Moyenne élève : ${moyenneGenerale}`,
                fontSize: 11,
                margin: [0, 15, 0, 8],
                alignment: 'left'
              },

            ],
            [
              {
                text: ` Moyenne classe : ${this.detailsBulletinEleve?.moyenne_classe}`,
                fontSize: 11,
                margin: [0, 15, 0, 8],
                alignment: 'center'
              }
            ],
          ]
        },

        {
          table: {
            widths: ["*"],
            body: [
              [
                [

                  {
                    text: 'Détails informations',
                    alignment: 'left',
                    fontSize: 12,
                    margin: [3, 10, 0, 10],
                  },

                ]
              ],
            ]
          }
        },

        {
          columns: [

            [
              {
                text: ` Semestre : ${this.detailsBulletinEleve?.sessionSemestre}`,
                fontSize: 11,
                margin: [0, 15, 0, 5],
                alignment: 'left'
              },

            ],
            [
              {
                text: ` Appréciation : ${this.detailsBulletinEleve?.appreciation_general}`,
                fontSize: 11,
                margin: [0, 15, 0, 5],
                alignment: 'center'
              }
            ],
            [

              {
                text: ` Absence/Retard : ${this.detailsBulletinEleve?.appreciation_general}`,
                fontSize: 11,
                margin: [0, 15, 0, 5],
                alignment: 'right'
              },
            ],
          ]
        },
        {
          text: 'Signature',
          style: 'sign',
          alignment: 'right',
          decoration: 'underline',
        },


      ],

      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        name: {
          fontSize: 14,
          bold: true
        },
        total: {
          fontSize: 12,
          bold: true,
          italics: true
        },
        ligne: {
          fontSize: 12,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },
        tableHeader: {
          bold: true,
          fontSize: 14,
          alignment: 'center'
        },

      }
    };

  }

  getDocumentFicheBulletin(): any {
    const details = this.detailsBulletinEleve;
    const matieres = details?.bulletinMatiereDetailsDTOS || [];

    // Calculs financiers/académiques des totaux
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
