import { Component, inject, OnInit } from '@angular/core';
import { GenericTableReferentielComponent } from '../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { DetailsEnseignantUtilisateur } from '../../../../core/models/enseignant/details-enseignant-utilisateur';
import { DossierResourceService } from '../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { ReferentielService } from '../../../administration/referentiel/service/referentiel.service';
import { EnseignantService } from '../../service/enseignant.service';
import { Matiere } from '../../../../core/models/referentiels/matiere';
import { ListeClasse } from '../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../core/models/referentiels/semestre';
import { GenericTableDossierComponent } from '../../../../core/generic/generic-table-dossier/generic-table-dossier.component';


@Component({
  selector: 'app-list-note-classe',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-note-classe.component.html',
  styleUrls: ['./list-note-classe.component.css']
})
export class ListNoteClasseComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  noteId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataNote: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "note";
  columns: any = [];
  noteData: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  matieresList: any[] = [];
  classesList: any[] = [];
  semestreList: any[] = [];
  typesNoteOptions: string[] = ['DEVOIR', 'COMPOSITION'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;
  detailsEnseignant: DetailsEnseignantUtilisateur = {};
  userId: number;
  enseignantId?: number;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService)
  private readonly enseignantSerivce = inject(EnseignantService);

  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getEnseignementByUtilisateur(this.userId);
  }

  getEnseignementByUtilisateur(userId: number) {
    this.enseignantSerivce.getDetailsEnseignantUtilisateur(userId).subscribe({
      next: (data) => {
        this.detailsEnseignant = data;
        this.enseignantId = this.detailsEnseignant?.id;
        this.chargerLesNotes();
      },
      error: (err) => (err)
    });
  }

  async chargerLesNotes() {
    try {
      const [classe, matiere, semestre] = await Promise.all([
        this.getClassList(),
        this.getMatiereList(),
        this.getSemestreList()
      ]);

      this.initialisationDesFiltres(classe, matiere, semestre);
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMatiereList(): Promise<Matiere[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllMatieres().subscribe({
        next: (data) => {
          this.matieresList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data) => {
          this.classesList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getSemestreList(): Promise<Semestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllSemestres().subscribe({
        next: (data) => {
          this.semestreList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres(classe: any[], matieres: any[], semestre: any[]) {
    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: classe.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },
      {
        key: 'matiere',
        label: 'Matière',
        type: 'select',
        options: matieres.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },
      {
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: semestre.map(a => ({
          value: a.id,
          label: `${a.libelle}`
        }))
      },
      {
        key: 'type',
        label: 'Type de note',
        type: 'select',
        options: this.typesNoteOptions.map(n => ({
          value: n,
          label: n
        }))
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

      apiCall = this.dossierResource.fetchFilterByElementDataTable(
        'note/enseignant',
        this.enseignantId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourceByIdPaged('note/enseignant', this.enseignantId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.noteData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'eleve', header: 'Eleve' },
          { key: 'classe', header: 'Classe' },
          { key: 'matiere', header: 'Matière' },
          { key: 'semestre', header: 'Semestre' },
          { key: 'note', header: 'Note' },
          { key: 'type', header: 'Type de note' },

        ];
        this.noteData = this.noteData?.map((item: any) => ({
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

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }
    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }
    if (this.activeFilters.matiere) {
      filtreObj.matiere = this.activeFilters.matiere;
    }
    if (this.activeFilters?.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
    }
    if (this.activeFilters.type) {
      filtreObj.type = this.activeFilters.type;
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
    this.initialisationDesFiltres(this.matieresList, this.classesList, this.semestreList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

}
