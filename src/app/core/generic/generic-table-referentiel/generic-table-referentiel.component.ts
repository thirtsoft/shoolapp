import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportFileService } from '../../services/export-file.service';

import { ToastrService } from 'ngx-toastr';
import * as pdfMake from 'pdfmake/build/pdfmake';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogModalComponent } from '../../components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { EncodateLogo } from '../../enumeration/encodage-logo-data';
import { IFilterConfig } from '../../filtered-config/FiltreConfiguration';
import { CommonService } from '../../services/common.service';
import { SharedResourceService } from '../../services/shared-resource.service';


@Component({
  selector: 'app-generic-table-referentiel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RouterLink],
  templateUrl: './generic-table-referentiel.component.html',
  styleUrls: ['./generic-table-referentiel.component.css']
})
export class GenericTableReferentielComponent implements OnInit {

  // Inputs de base
  @Input() title: string = '';
  @Input() titleFitre: string = '';
  @Input() addButtonLabel: string = '+ Ajouter';
  @Input() addButtonLink: string = '';
  @Input() modifierButtonLink: string = '';
  @Input() detailButtonLink: string = '';
  @Input() iconTableLink: string = '';
  @Input() isNoAjout: boolean | undefined = false;
  @Input() deleteEndPoint: string = '';
  @Input() isLoading: boolean = false;

  // Icônes d'action
  @Input() isEditIcon: boolean = false;
  @Input() isEyesIcon: boolean = false;
  @Input() isEyesIconPopup: boolean = false;
  @Input() isLockableIcon: boolean = false;
  @Input() isTableIcon: boolean = false;
  @Input() isAffecterIcon: boolean = false;
  @Input() isReinscrireIcon: boolean = false;

  // Configuration du tableau
  @Input() tableColumns: any[] = [];
  @Input() tableData: any[] = [];
  @Input() filtered: IFilterConfig[] = [];
  @Input() showFilters: boolean = false;
  @Input() totalElements: any;
  @Input() tableSizes: number[] = [5, 10, 20, 50, 100];
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 5;
  @Input() itemsPerPage: number = 5;

  // Filtres additionnels (legacy)
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
  @Input() colonneDateFiltrage: string = 'dateEngagement';

  // Boutons génériques
  @Input() generateButtonLabel: string = '+ Générer facture';
  @Input() generatedButtonLink: string = '';
  @Input() generatedButton: boolean = false;
  @Input() reinscriptionButtonLink: string = '';

  // Options de verrouillage
  @Input() lockAction: any = 'désactiver';
  @Input() lockOption: any = 'verrouillage';
  @Input() unLockOption: any = 'déverrouillage';

  // Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();
  @Output() onPageChange = new EventEmitter<number>();
  @Output() onSizeChange = new EventEmitter<number>();
  @Output() filterChange = new EventEmitter<{ filter: IFilterConfig, value: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() totalMontantXof = new EventEmitter<number>();
  @Output() filtreApplique = new EventEmitter<{ colonne: string; valeur: string }>();

  // État interne
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  filteredData: any[] = [];
  filters: { [key: string]: string } = {};
  globalSearchText: string = '';
  montantTotalXof: number = 0;
  isPopupVisible: boolean = false;
  selectedItem: any = {};
  splitKeys: string[][] = [];
  currentFilters: any = {};
  currentDateFrom: string = '';
  currentDateTo: string = '';
  isPopup: boolean = false;
  keySelected: any;
  selectedRows: any[] = [];
  visible: boolean = false;
  position: string = 'center';
  p = 1;

  // Données bulletin
  detailsBulletinEleve?: any;
  matieres?: any;
  totalCoef?: any;
  moyenneGeneraleEleve?: any;
  filteres: any[] = []; // Note: semble être un doublon de 'filtered'

  // Services injectés
  private readonly router = inject(Router);
  private readonly sharedResourceService = inject(SharedResourceService);
  private readonly serviceCommun = inject(CommonService);
  private readonly exportService = inject(ExportFileService);
  private readonly modalService = inject(NgbModal);
  private readonly toast = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Computed properties
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

  get visiblePages(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  ngOnInit(): void {
    this.sortTable('dateEngagement');
    this.matieres = this.detailsBulletinEleve?.bulletinMatiereDetailsDTOS || [];
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

  // Filtres
  onDateRangeChange(fromKey: string, toKey: string, event: any) {
    this.filterChange.emit({
      filter: { key: 'dateRange', fromKey, toKey } as IFilterConfig,
      value: event
    });
  }

  onFilterChange(key: any, value: any) {
    this.currentFilters[key] = value;
    const filterConfig = this.filtered.find(f => f.key === key);
    if (filterConfig?.onChange) {
      filterConfig.onChange(value);
    }
  }

  applyFilters(): void {
    this.filteredData = this.tableData.filter((row) => {
      let dateValue: Date | null = null;
      const dateKey = this.colonneDateFiltrage;
      if (dateKey && row[dateKey]) {
        dateValue = new Date(row[dateKey]);
      }

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

  // Tri
  sortTable(columnKey: string): void {
    if (this.sortColumn === columnKey) {
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
          return this.sortDirection === 'asc'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
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

  // Pagination
  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  changeSize(size: number) {
    this.sizeChange.emit(+size);
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

  updateVisiblePages() {
    // Méthode conservée si utilisée ailleurs
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
  }

  // Navigation
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

  // Utilitaires
  isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  formatKey(key: string): string {
    return key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/^./, (str) => str.toUpperCase());
  }

  splitObjectKeys(): string[][] {
    if (!this.selectedItem || Object.keys(this.selectedItem).length === 0) {
      return [[], []];
    }
    const keys = Object.keys(this.selectedItem);
    const midIndex = Math.ceil(keys.length / 2);
    return [keys.slice(0, midIndex), keys.slice(midIndex)];
  }

  closePopup(): void {
    this.isPopupVisible = false;
    this.selectedItem = {};
    this.splitKeys = [];
  }

  // Actions sur les éléments
  desactiverElement(endpoint: string, row: any): void {
    this.serviceCommun.desactiverResource(endpoint, row.id).subscribe({
      next: () => {
        this.toast.success('success', `L'élément "${row.libelle}" a été ${this.lockAction} avec succès.`);
        setTimeout(() => window.location.reload(), 500);
      },
      error: (error) => {
        const errorMessage = error.error || 'Une erreur est survenue lors de la désactivation.';
        this.toast.error('error', `Erreur : ${errorMessage}`);
      }
    });
  }

  activerElement(endpoint: string, row: any): void {
    this.serviceCommun.activeResource(endpoint, row.id).subscribe({
      next: () => {
        this.toast.success('success', `L'élément "${row.libelle}" a été ${this.lockAction} avec succès.`);
        setTimeout(() => window.location.reload(), 500);
      },
      error: (error) => {
        const errorMessage = error.error || 'Une erreur est survenue lors de la désactivation.';
        this.toast.error('error', `Erreur : ${errorMessage}`);
      }
    });
  }

  openConfirmationDialog(action: 'desactiver' | 'activer', endpoint: string, row: any): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = action === 'desactiver'
      ? `Confirmer ${this.lockOption}`
      : `Confirmer ${this.unLockOption}`;
    modalRef.componentInstance.message = action === 'desactiver'
      ? `Êtes-vous sûr de vouloir ${this.lockAction} cet élément ?`
      : `Êtes-vous sûr de vouloir ${this.unLockOption} cet élément ?`;
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result.then((result: any) => {
      if (result) {
        if (action === 'desactiver') {
          this.desactiverElement(endpoint, row);
        } else if (action === 'activer') {
          this.activerElement(endpoint, row);
        }
      }
    }).catch(() => {
      // Modal dismissed
    });
  }

  toggleRow(row: any): void {
    row.checked = !row.checked;
    if (row.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(selectedRow => selectedRow !== row);
    }
    this.selectionChange.emit(this.selectedRows);
  }

  // Export
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

  // Bulletin PDF
  generatePdfDuBulletin(row: any) {
    if (row.id) {
      this.getDetailsBulletinEleve(row.id);
    }
  }

  getDetailsBulletinEleve(bulletinId: number) {
    this.sharedResourceService.afficherDetailsResource('bulletin', bulletinId).subscribe({
      next: (data) => {
        this.detailsBulletinEleve = data;
        this.imprimerPaiement();
      }
    });
  }

  imprimerPaiement() {
    pdfMake.createPdf(this.getDocumentFichePaiement()).open();
  }

  DownloadPdf() {
    const document: any = this.getDocumentFichePaiement();
    pdfMake.createPdf(document).download('"BULLETIN_"' + this.detailsBulletinEleve.classe + '.pdf');
  }

  getDocumentFichePaiement(): any {
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
              { text: 'Derrière le casino du cap vert', fontSize: 10, bold: true, alignment: 'right' },
              { text: 'Tél: 33 820 10 92 - BP 6268 Dakar étoile', fontSize: 10, bold: true, alignment: 'right' },
              { text: 'Web: www.ecolelesdauphins.org / Email: ecolelesdauphin@gmail.com', fontSize: 10, bold: true, alignment: 'right' },
              { text: "l'Ecole pour grandir", fontSize: 14, bold: true, alignment: 'right' },
            ],
          ]
        },
        { text: ` Année scolaire : ${this.detailsBulletinEleve?.anneeScolaire}`, fontSize: 10, margin: [0, 15, 0, 15], alignment: 'right' },
        { text: 'BULLETIN DE NOTE', fontSize: 16, alignment: 'center', bold: true, margin: [0, 8, 0, 0] },
        { text: ` Nom et Prénom : ${this.detailsBulletinEleve?.nomCompletEleve}`, fontSize: 11, margin: [0, 15, 0, 15], alignment: 'left' },
        {
          columns: [
            [{ text: ` Né le : ${this.detailsBulletinEleve?.dateNaissanceEleve} `, fontSize: 10, margin: [0, 5, 0, 5], alignment: 'left' }],
            [{ text: ` à : ${this.detailsBulletinEleve?.lieuNaissanceEleve}`, fontSize: 10, margin: [0, 5, 0, 5], alignment: 'center' }],
            [],
          ]
        },
        {
          columns: [
            [{ text: ` Classe : ${this.detailsBulletinEleve?.classe} `, fontSize: 10, margin: [0, 5, 0, 5], alignment: 'left' }],
            [{ text: ` Nombre élève : ${this.detailsBulletinEleve?.nombre_eleve}`, fontSize: 10, margin: [0, 5, 0, 5], alignment: 'center' }],
            [{ text: ` Semestre : ${this.detailsBulletinEleve?.semestre} `, fontSize: 10, margin: [0, 5, 0, 5], alignment: 'left' }],
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
                { text: 'Matière', fontSize: 11, alignment: 'left' },
                { text: 'Coéf', fontSize: 11, alignment: 'right' },
                { text: 'MCC', fontSize: 11, alignment: 'right' },
                { text: 'Composition', fontSize: 11, alignment: 'right' },
                { text: 'Moyenne', fontSize: 11, alignment: 'right' },
                { text: 'Appréciation', fontSize: 11, alignment: 'right' },
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
                { text: 'TOTAL', alignment: 'left', fontSize: 11 },
                { text: totalCoef.toString(), fontSize: 11, alignment: 'right' },
                { text: '', fontSize: 11, alignment: 'right' },
                { text: '', fontSize: 11, alignment: 'right' },
                { text: totalNotePonderee.toString(), fontSize: 11, alignment: 'right' },
                { text: '', fontSize: 11, alignment: 'right' },
              ],
            ]
          },
        },
        {
          fontSize: 11,
          columns: [
            [{ text: ` Moyenne élève : ${moyenneGenerale}`, fontSize: 11, margin: [0, 15, 0, 8], alignment: 'left' }],
            [{ text: ` Moyenne classe : ${this.detailsBulletinEleve?.moyenne_classe}`, fontSize: 11, margin: [0, 15, 0, 8], alignment: 'center' }],
          ]
        },
        {
          table: {
            widths: ["*"],
            body: [[[{ text: 'Détails informations', alignment: 'left', fontSize: 12, margin: [3, 10, 0, 10] }]]]
          }
        },
        {
          columns: [
            [{ text: ` Semestre : ${this.detailsBulletinEleve?.semestre}`, fontSize: 11, margin: [0, 15, 0, 5], alignment: 'left' }],
            [{ text: ` Appréciation globale : ${this.detailsBulletinEleve?.appreciation_general}`, fontSize: 11, margin: [0, 15, 0, 5], alignment: 'center' }],
            [{ text: ` Absence/Retard : ${this.detailsBulletinEleve?.appreciation_general}`, fontSize: 11, margin: [0, 15, 0, 5], alignment: 'right' }],
          ]
        },
        { text: 'Signature', style: 'sign', alignment: 'right', decoration: 'underline' },
      ],
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 20, 0, 10], decoration: 'underline' },
        name: { fontSize: 14, bold: true },
        total: { fontSize: 12, bold: true, italics: true },
        ligne: { fontSize: 12, bold: true, italics: true },
        sign: { margin: [0, 50, 0, 10], alignment: 'right', italics: true },
        tableHeader: { bold: true, fontSize: 14, alignment: 'center' },
      }
    };
  }
}