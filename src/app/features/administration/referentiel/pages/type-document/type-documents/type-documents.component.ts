import { Component, inject, OnInit } from '@angular/core';
import { TypeDocument } from '../../../../../../core/models/referentiels/type-document';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';

@Component({
  selector: 'app-type-documents',
    standalone: true,
    imports: [GenericTableReferentielComponent],
  templateUrl: './type-documents.component.html',
  styleUrls: ['./type-documents.component.css']
})
export class TypeDocumentsComponent implements OnInit {
  errorMessage?: string;
  typeDocuments: TypeDocument[] = [];
  typeDocumentId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataTypeDocument: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "typeDocument";
  columns: any = [];
  typeDocumentData: any = [];

  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesTypeDocuments();
  }
  async chargerLesTypeDocuments() {
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
        label: 'Libellé',
        type: 'text',
        placeholder: 'Rechercher un type document...'
      }
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

      apiCall = this.refentielResource.fetchFilterDataTable(
        'typedocument',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('typedocument', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.typeDocumentData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'id', header: 'ID' },
          { key: 'libelle', header: 'Libellé' },
        ];
        this.typeDocumentData = this.typeDocumentData.map((item: any) => ({
          ...item,
        }));

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


}
