import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CoursEnseigne,
  DerniereNoteDTO,
  DernierePresenceDTO,
  DernierPaiementDTO,
  DetailsEleveResponse,
  FactureEleve,
  InscriptionEleve,
  ListeResultatEleve,
  MatiereEnseignee,
  ParcoursScolaireEleve,
  ParentEleveDTO,
  PresenceEleve,
  RechercheFactureEleve,
  RecherchePresenceEleve,
  RechercheResultatEleve
} from '../../../../../../core/models/dossiereleve/dossier-eleve';

import { AnneeScolaireEncoursResponse } from '../../../../../../core/models/referentiels/annee-scolaire-encours-response';

import { ListEtatResponse } from '../../../../../../core/models/base/list-etat-response';
import { EleveData } from '../../../../../../core/models/dossiereleve/details-dossier-eleve';
import { CommonService } from '../../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

declare const pdfMake: any;

type DossierTab = | 'overview' | 'parcours' | 'resultats' | 'presence' | 'paiements' | 'documents' | 'plus';

@Component({
  selector: 'app-details-eleve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details-eleve.component.html',
  styleUrls: ['./details-eleve.component.css']
})
export class DetailsEleveComponent implements OnInit {

  eleve: DetailsEleveResponse | null = null;

  eleveDetails: DetailsEleveResponse | undefined;

  eleveUuid?: string;

  tuteurs: ParentEleveDTO[] = [];

  notes: DerniereNoteDTO[] = [];

  derniereNote?: DerniereNoteDTO | null;
  dernierPaiement?: DernierPaiementDTO | null;
  dernierePresence?: DernierePresenceDTO | null;

  bulletins: any[] = [];

  absencesEtRetards: any[] = [];

  inscriptions: any[] = [];

  services: any[] = [];

  totalAbsences = 0;
  totalRetards = 0;
  totalJustified = 0;

  anneesScolaires: AnneeScolaireEncoursResponse[] = [];

  anneeScolaireSelectionnee?: AnneeScolaireEncoursResponse;

  activeTab: DossierTab = 'overview';

  actionsMenuOuvert = false;

  errorMessage?: string;

  private avatarHommeBase64 = '';
  private avatarFemmeBase64 = '';

  photoPreview = '';

  parcoursScolaire: ParcoursScolaireEleve[] = [];

  loadingParcoursScolaire = false;

  resultats: ListeResultatEleve[] = [];

  resultatsTotalElements = 0;

  resultatsTotalPages = 0;

  resultatsPage = 0;

  resultatsPageSize = 5;

  loadingResultats = false;

  filtreResultats: RechercheResultatEleve = {
    eleveUuid: '',
    anneeScolaireUuid: null,
    matiereUuid: null,
    type: null,
    mois: null
  };

  presences: PresenceEleve[] = [];

  presencesTotalElements = 0;

  presencesTotalPages = 0;

  presencesPage = 0;

  presencesPageSize = 10;

  loadingPresences = false;

  filtrePresences: RecherchePresenceEleve = {
    eleveUuid: '',
    anneeScolaireUuid: null,
    coursUuid: null,
    mois: null,
    type: null
  };

  inscriptionEleve: InscriptionEleve | null = null;

  factures: FactureEleve[] = [];

  facturesTotalElements = 0;

  facturesTotalPages = 0;

  facturesPage = 0;

  facturesPageSize = 10;

  loadingPaiements = false;

  filtrePaiements: RechercheFactureEleve = {
    eleveUuid: '',
    anneeScolaireUuid: null,
    mois: null,
    etatUuid: null
  };

  moisList: any[] = [];
  etatFactureList: ListEtatResponse[] = [];
  matieresEnseignees: MatiereEnseignee[] = [];
  coursEnseignes: CoursEnseigne[] = [];


  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly planificationService = inject(PlanificationResourceService)

  ngOnInit(): void {
    this.eleveUuid = this.activatedRouter.snapshot.params['uuid'];
    this.loadDefaultAvatars();
    this.getAnneeScolaires();
    this.getMoisList();
  }

  getMoisList(): void {
    this.errorMessage = undefined;
    this.commonService
      .getAllMois()
      .subscribe({
        next: (res: any[]) => {
          this.moisList = res ?? [];
        },

        error: (err) => {
          this.moisList = [];
          this.errorMessage = 'Impossible de charger les mois.';
          console.error('Erreur de chargement des mois :', err);
        }
      });
  }

  getEtatsFactureList(): void {
    this.errorMessage = undefined;
    this.commonService
      .getEtatsFactures()
      .subscribe({
        next: (res: any[]) => {
          this.etatFactureList = res ?? [];
        },

        error: (err) => {
          this.etatFactureList = [];
          this.errorMessage = 'Impossible de charger les etats.';
          console.error('Erreur de chargement des etats :', err);
        }
      });
  }

  getAnneeScolaires(): void {
    this.errorMessage = undefined;
    this.referentielService
      .getResourceList('anneescolaire/response')
      .subscribe({
        next: (res: any[]) => {
          this.anneesScolaires = res ?? [];
          if (this.anneesScolaires.length === 0) {
            this.errorMessage = 'Aucune année scolaire disponible.';
            return;
          }

          const anneeEnCours = this.anneesScolaires.find(
            annee => annee.etat?.toLowerCase() === 'en cours'
          );

          this.anneeScolaireSelectionnee = anneeEnCours ?? this.anneesScolaires[0];
          const anneeUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;

          if (this.eleveUuid && anneeUuid) {
            this.getDetailsDossiersEleve(this.eleveUuid, anneeUuid);
          }
        },

        error: (err) => {

          this.anneesScolaires = [];

          this.anneeScolaireSelectionnee = undefined;
          this.errorMessage = 'Impossible de charger les années scolaires.';

          console.error('Erreur de chargement des années scolaires :', err);
        }
      });
  }

  getDetailsDossiersEleve(eleveUuid: string, anneeScolaireUuid: string): void {

    if (!eleveUuid) {
      this.errorMessage = 'Identifiant de l’élève manquant.';
      return;
    }

    if (!anneeScolaireUuid) {
      this.errorMessage = 'Aucune année scolaire sélectionnée.';
      return;
    }

    this.errorMessage = undefined;
    this.dossierResource
      .getDetailsDossierEleve(eleveUuid, anneeScolaireUuid)
      .subscribe({
        next: (res: DetailsEleveResponse) => {
          this.eleveDetails = res;
          this.eleve = res;
          this.loadPhotoEleve();

          this.tuteurs = res.parents ?? [];
          this.derniereNote = res.dernieresInformations?.derniereNote;
          this.dernierPaiement = res.dernieresInformations?.dernierPaiement;
          this.dernierePresence = res.dernieresInformations?.dernierePresence;
          this.notes = this.derniereNote ? [this.derniereNote] : [];
          this.totalAbsences = res.nombreAbsences ?? 0;
          this.totalRetards = res.nombreRetards ?? 0;
          this.totalJustified = 0;

          this.loadMatieresEnseignees();
          this.loadCoursEnseignes();
        },

        error: (err) => {
          this.eleve = null;
          this.eleveDetails = undefined;
          this.tuteurs = [];
          this.notes = [];
          this.derniereNote = undefined;
          this.dernierPaiement = undefined;
          this.dernierePresence = undefined;

          this.errorMessage = 'Impossible de charger le dossier de l’élève.';
          console.error('Erreur de chargement du dossier élève :', err);
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

    this.dossierEleveService
      .getPhotoContent(photo.photoUuid)
      .subscribe({
        next: (blob: Blob) => {
          if (this.photoPreview) {
            URL.revokeObjectURL(this.photoPreview);
          }

          this.photoPreview = URL.createObjectURL(blob);
        },

        error: (error) => {

          console.error(
            'Erreur lors du chargement de la photo de l’élève :',
            error
          );

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

  private normalizeText(value?: string | null): string {
    return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
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

  private loadDefaultAvatars(): void {
    this.convertImageToBase64('assets/img/homme.png')
      .then(base64 => {
        this.avatarHommeBase64 = base64;
      })
      .catch(err =>
        console.error(
          'Erreur chargement avatar homme:',
          err
        )
      );

    this.convertImageToBase64('assets/img/femme.png')
      .then(base64 => {
        this.avatarFemmeBase64 = base64;
      })
      .catch(err =>
        console.error(
          'Erreur chargement avatar femme:',
          err
        )
      );
  }

  private convertImageToBase64(imagePath: string): Promise<string> {

    return new Promise(
      (resolve, reject) => {

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

            reject(
              new Error(
                'Impossible de créer le contexte canvas'
              )
            );
          }
        };

        img.onerror = () =>
          reject(
            new Error(
              `Impossible de charger l'image : ${imagePath}`
            )
          );

        img.src = imagePath;
      }
    );
  }

  loadMatieresEnseignees(): void {
    const classeUuid = this.eleveDetails?.classeUuid;
    const anneeScolaireUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;

    if (!classeUuid || !anneeScolaireUuid) {
      this.matieresEnseignees = [];
      return;
    }

    this.planificationService
      .getMatieresEnseignees(classeUuid, anneeScolaireUuid)
      .subscribe({
        next: (response) => {
          this.matieresEnseignees = response ?? [];
        },

        error: (error) => {
          console.error(
            'Erreur chargement des matières enseignées :',
            error
          );

          this.matieresEnseignees = [];
        }
      });
  }

  loadCoursEnseignes(): void {
    const classeUuid = this.eleveDetails?.classeUuid;
    const anneeScolaireUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;

    if (!classeUuid || !anneeScolaireUuid) {
      this.coursEnseignes = [];
      return;
    }

    this.planificationService
      .getCoursEnseignes(classeUuid, anneeScolaireUuid)
      .subscribe({
        next: (response) => {
          this.coursEnseignes = response ?? [];
        },

        error: (error) => {
          console.error(
            'Erreur chargement des cours enseignés :',
            error
          );

          this.coursEnseignes = [];
        }
      });
  }

  onAnneeScolaireChange(annee: AnneeScolaireEncoursResponse): void {
    if (!annee?.anneeScolaireUuid) {
      return;
    }
    this.anneeScolaireSelectionnee = annee;

    if (!this.eleveUuid) {
      return;
    }
    this.getDetailsDossiersEleve(this.eleveUuid, annee.anneeScolaireUuid);

    switch (this.activeTab) {

      case 'resultats':
        this.loadResultats(0);
        break;

      case 'presence':
        this.loadPresences(0);
        break;

      case 'paiements':
        this.loadPaiements(0);
        break;

      case 'parcours':
        break;

      default:
        break;
    }
  }

  toggleActionsMenu(): void {
    this.actionsMenuOuvert = !this.actionsMenuOuvert;
  }

  exporterDossierPdf(): void {
    this.actionsMenuOuvert = false;
  }

  imprimerDossier(): void {
    this.actionsMenuOuvert = false;
  }

  setActiveTab(tab: DossierTab): void {
    this.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (tab) {

      case 'parcours':
        this.loadParcoursScolaire();
        break;

      case 'resultats':
        this.loadResultats(0);
        break;

      case 'presence':
        this.loadPresences(0);
        break;

      case 'paiements':
        this.loadPaiements(0);
        break;

      default:
        break;
    }
  }


  getDerniereNoteEleve(): number | null {
    return this.derniereNote?.note ?? null;
  }

  /* 
    getMeilleureNote(
      notes: any[]
    ): number | null {
  
      if (
        !notes ||
        notes.length === 0
      ) {
        return null;
      }
  
      const notesValides =
        notes.filter(
          n =>
            n.note !== null &&
            n.note !== undefined
        );
  
      if (
        notesValides.length === 0
      ) {
        return null;
      }
  
      return Math.max(
        ...notesValides.map(
          n => n.note
        )
      );
    }
   */

  loadParcoursScolaire(): void {
    if (!this.eleveUuid) {
      return;
    }
    this.loadingParcoursScolaire = true;
    this.dossierResource
      .getParcoursScolaireEleve(this.eleveUuid)
      .subscribe({
        next: response => {
          this.parcoursScolaire = response ?? [];
          this.loadingParcoursScolaire = false;
        },

        error: error => {
          console.error('Erreur chargement parcours scolaire', error);

          this.parcoursScolaire = [];

          this.loadingParcoursScolaire = false;
        }
      });
  }

  loadResultats(page: number = this.resultatsPage): void {
    if (!this.eleveUuid) {
      return;
    }

    const anneeScolaireUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;

    if (!anneeScolaireUuid) {
      console.warn('Aucune année scolaire sélectionnée pour les résultats.');
      return;
    }

    this.resultatsPage = page;
    this.filtreResultats.eleveUuid = this.eleveUuid;
    this.filtreResultats.anneeScolaireUuid = anneeScolaireUuid;
    this.loadingResultats = true;

    this.dossierResource
      .getResultatsElevePaged(this.resultatsPage, this.resultatsPageSize, this.filtreResultats)
      .subscribe({

        next: response => {
          this.resultats = response?.data?.content ?? [];
          this.resultatsTotalElements = response?.data?.totalElements ?? 0;
          this.resultatsTotalPages = response?.data?.totalPages ?? 0;
          this.loadingResultats = false;
        },

        error: error => {
          console.error('Erreur chargement résultats', error);

          this.resultats = [];

          this.resultatsTotalElements = 0;

          this.resultatsTotalPages = 0;

          this.loadingResultats = false;
        }
      });
  }

  loadPresences(page: number = this.presencesPage): void {
    if (!this.eleveUuid) {
      return;
    }

    const anneeScolaireUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;

    if (!anneeScolaireUuid) {
      console.warn('Aucune année scolaire sélectionnée pour les présences.');
      return;
    }

    this.presencesPage = page;
    this.filtrePresences.eleveUuid = this.eleveUuid;
    this.filtrePresences.anneeScolaireUuid = anneeScolaireUuid;
    this.loadingPresences = true;
    this.dossierResource
      .getPresencesElevePaged(this.presencesPage, this.presencesPageSize, this.filtrePresences)
      .subscribe({

        next: response => {
          this.presences = response?.data?.content ?? [];
          this.presencesTotalElements = response?.data?.totalElements ?? 0;
          this.presencesTotalPages = response?.data?.totalPages ?? 0;
          this.loadingPresences = false;
        },

        error: error => {
          console.error('Erreur chargement présences', error);

          this.presences = [];

          this.presencesTotalElements = 0;

          this.presencesTotalPages = 0;

          this.loadingPresences = false;
        }
      });
  }

  loadPaiements(page: number = this.facturesPage): void {
    if (!this.eleveUuid) {
      return;
    }

    const anneeScolaireUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;

    if (!anneeScolaireUuid) {
      console.warn('Aucune année scolaire sélectionnée pour les paiements.');
      return;
    }

    this.facturesPage = page;
    this.filtrePaiements.eleveUuid = this.eleveUuid;
    this.filtrePaiements.anneeScolaireUuid = anneeScolaireUuid;
    this.loadingPaiements = true;

    this.dossierResource
      .getPaiementEleve(this.facturesPage, this.facturesPageSize, this.filtrePaiements)
      .subscribe({

        next: response => {

          this.inscriptionEleve = response?.inscription ?? null;
          this.factures = response?.factures?.content ?? [];
          this.facturesTotalElements = response?.factures?.totalElements ?? 0;
          this.facturesTotalPages = response?.factures?.totalPages ?? 0;
          this.loadingPaiements = false;
          this.getEtatsFactureList();
        },

        error: error => {
          console.error('Erreur chargement paiements', error);
          this.inscriptionEleve = null;

          this.factures = [];

          this.facturesTotalElements = 0;

          this.facturesTotalPages = 0;

          this.loadingPaiements = false;
        }
      });
  }


  telechargerBulletin(bulletinId: number): void {

    console.log(
      'Téléchargement du bulletin ID :',
      bulletinId
    );
  }


  telechargerDossierJSON(): void {
    if (!this.eleveDetails) {
      return;
    }

    const dataStr = JSON.stringify(this.eleveDetails, null, 2);

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');

    linkElement.setAttribute('href', dataUri);

    linkElement.setAttribute(
      'download',
      `dossier_eleve_${this.eleveDetails.matricule || 'inconnu'}.json`
    );

    linkElement.click();
  }


  telechargerDossier(): void {
    if (!this.eleveDetails) {
      console.warn('Aucune donnée élève disponible');
      return;
    }
  }


  imprimerDossierV1(data: EleveData): void {
    this.genererDossierEleveEnPDF(data);
  }


  genererDossierEleveEnPDF(data: EleveData, download: boolean = false): void {
    console.warn('La génération PDF utilise encore l’ancien modèle EleveData.');
  }

  retour(): void {
    window.history.back();
  }

  goBack(): void {
    window.history.back();
  }
}
