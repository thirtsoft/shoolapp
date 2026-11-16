import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CoursEnseigne,
  DerniereNoteDTO,
  DernierePresenceDTO,
  DernierPaiementDTO,
  DetailsEleveResponse,
  DossierDocumentsEleveResponse,
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

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ListEtatResponse } from '../../../../../../core/models/base/list-etat-response';
import { DetailsInscription } from '../../../../../../core/models/dossiereleve/details-inscription';
import { OrganizationMiniResponse } from '../../../../../../core/models/onboarding/organization/organization-mini-response';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { DocumentResponse } from '../../../../../../core/piecejointe/document-response.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { ConfigOrganizationService } from '../../../../configorganization/services/configorganization.service';
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
export class DetailsEleveComponent implements OnInit, OnDestroy {

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

  documentsEleve: DossierDocumentsEleveResponse | null = null;

  loadingDocuments = false;

  uploadingDocument = false;

  documentEnCoursUuid: string | null = null;

  documentTypeEnCours: string | null = null;

  showPopupAjoutDocument = false;
  showPopupRemplacementDocument = false;

  typeDocumentAjout = '';

  fichierDocumentAjout: File | null = null;

  documentEnCoursRemplacement: DocumentResponse | null = null;

  fichierDocumentRemplacement: File | null = null;

  Math: any;
  loading = signal(false);
  error = signal('');

  logoPreview: string | null = null;
  organizationData: OrganizationMiniResponse = {};
  detailsInscription: DetailsInscription = {};
  eleveData?: any;
  anneeScolaire?: AnneeScolaire;
  classe?: string;

  detailsBulletinEleve?: any;
  matieres?: any;
  totalCoef?: any;
  moyenneGeneraleEleve?: any;


  showPreviewModal = false;
  isDocumentLoading = false;
  documentPreviewUrl: SafeResourceUrl | null = null;

  private documentObjectUrl: string | null = null;


  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly planificationService = inject(PlanificationResourceService);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly toastService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);


  ngOnInit(): void {
    this.eleveUuid = this.activatedRouter.snapshot.params['uuid'];
    this.loadDefaultAvatars();
    this.getAnneeScolaires();
    this.getMoisList();
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

    this.revokeDocumentUrl();
    document.body.style.overflow = '';
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

      case 'documents':
        this.loadDocumentsEleve();
        break;

      default:
        break;
    }
  }


  getDerniereNoteEleve(): number | null {
    return this.derniereNote?.note ?? null;
  }

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

  loadDocumentsEleve(): void {
    if (!this.eleveUuid) {
      return;
    }
    const anneeScolaireUuid = this.anneeScolaireSelectionnee?.anneeScolaireUuid;
    if (!anneeScolaireUuid) {
      console.warn('Aucune année scolaire sélectionnée pour les documents.');
      return;
    }
    this.loadingDocuments = true;
    this.dossierResource
      .getDocumentsEleve(this.eleveUuid, anneeScolaireUuid)
      .subscribe({
        next: response => {
          console.log(
            'Documents du dossier élève :',
            response
          );

          this.documentsEleve = response;
          this.loadingDocuments = false;
        },

        error: error => {
          console.error('Erreur chargement documents élève :', error);
          this.documentsEleve = null;
          this.loadingDocuments = false;
        }
      });
  }

  getTypeDocumentLibelle(typeDocument: string): string {
    const libelles: Record<string, string> = {
      PHOTO: 'Photo',
      PHOTOS_IDENTITE: 'Photos d’identité',
      EXTRAIT_NAISSANCE: 'Extrait de naissance',
      PIECE_IDENTITE_PARENT: 'Pièce d’identité parent',
      CARNET_VACCINATION: 'Carnet de vaccination',
      CERTIFICAT_MEDICAL: 'Certificat médical',
      FICHE_RENSEIGNEMENTS: 'Fiche de renseignements'
    };

    return libelles[typeDocument] ?? typeDocument;
  }

  ouvrirPopupAjoutDocument(): void {
    this.typeDocumentAjout = '';
    this.fichierDocumentAjout = null;
    this.showPopupAjoutDocument = true;
  }

  fermerPopupAjoutDocument(): void {
    this.showPopupAjoutDocument = false;
    this.typeDocumentAjout = '';
    this.fichierDocumentAjout = null;
  }

  ouvrirPopupRemplacementDocument(document: DocumentResponse): void {
    this.documentEnCoursRemplacement = document;
    this.fichierDocumentRemplacement = null;
    this.showPopupRemplacementDocument = true;
  }

  fermerPopupRemplacementDocument(): void {
    this.showPopupRemplacementDocument = false;

    this.documentEnCoursRemplacement = null;
    this.fichierDocumentRemplacement = null;
  }

  ajouterDocument(): void {

    if (!this.eleveUuid) {
      return;
    }

    if (!this.typeDocumentAjout) {
      console.warn('Le type de document est obligatoire.');
      return;
    }

    if (!this.fichierDocumentAjout) {
      console.warn('Le fichier est obligatoire.');
      return;
    }

    this.uploadingDocument = true;

    this.dossierResource
      .ajouterDocumentEleve(
        this.eleveUuid,
        this.typeDocumentAjout,
        this.fichierDocumentAjout
      )
      .subscribe({

        next: response => {

          this.uploadingDocument = false;

          if (!response.success) {
            console.error(
              'Erreur ajout document :',
              response.message
            );
            return;
          }

          console.log(
            'Document ajouté avec succès :',
            response.data
          );

          this.fermerPopupAjoutDocument();

          // Recharge la liste
          this.loadDocumentsEleve();
        },

        error: error => {

          this.uploadingDocument = false;

          console.error(
            'Erreur ajout document :',
            error
          );
        }
      });
  }

  remplacerDocument(): void {

    if (!this.eleveUuid) {
      return;
    }

    if (!this.documentEnCoursRemplacement?.documentUuid) {
      console.warn('Aucun document sélectionné pour le remplacement.');
      return;
    }

    if (!this.fichierDocumentRemplacement) {
      console.warn('Aucun nouveau fichier sélectionné.');
      return;
    }

    this.uploadingDocument = true;

    const documentUuid = this.documentEnCoursRemplacement.documentUuid;

    this.dossierResource
      .remplacerDocumentEleve(
        this.eleveUuid,
        documentUuid,
        this.fichierDocumentRemplacement
      )
      .subscribe({

        next: response => {

          this.uploadingDocument = false;

          if (!response.success) {
            console.error(
              'Erreur remplacement document :',
              response.message
            );
            return;
          }

          console.log(
            'Document remplacé avec succès :',
            response.data
          );

          this.fermerPopupRemplacementDocument();

          this.loadDocumentsEleve();
        },

        error: error => {

          this.uploadingDocument = false;

          console.error(
            'Erreur remplacement document :',
            error
          );
        }
      });
  }

  supprimerFichierAjout(): void {
    this.fichierDocumentAjout = null;
  }

  supprimerFichierRemplacement(): void {
    this.fichierDocumentRemplacement = null;
  }

  formatFileSize(size: number): string {
    if (!size) {
      return '0 octet';
    }

    const units = ['octets', 'Ko', 'Mo', 'Go'];
    const index = Math.floor(Math.log(size) / Math.log(1024));

    const value = size / Math.pow(1024, index);

    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }

  selectionnerFichierRemplacement(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const fichiersAutorises = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (!fichiersAutorises.includes(file.type)) {
      console.warn('Format de fichier non autorisé.');

      input.value = '';

      return;
    }

    const tailleMax = 5 * 1024 * 1024;

    if (file.size > tailleMax) {
      console.warn('Le fichier dépasse la taille maximale de 5 MB.');

      input.value = '';

      return;
    }

    this.fichierDocumentRemplacement = file;
  }

  selectionnerFichierAjout(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const fichiersAutorises = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (!fichiersAutorises.includes(file.type)) {
      console.warn('Format de fichier non autorisé.');

      input.value = '';

      return;
    }

    const tailleMax = 5 * 1024 * 1024;

    if (file.size > tailleMax) {
      console.warn('Le fichier dépasse la taille maximale de 5 MB.');

      input.value = '';

      return;
    }

    this.fichierDocumentAjout = file;
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

  async telechargerInscription(inscriptionId: number): Promise<void> {

    if (!inscriptionId) {
      return;
    }
    try {
      const data = await firstValueFrom(this.dossierResource.afficherDetailsResource('inscription', inscriptionId));

      this.detailsInscription = data || {};
      this.eleveData = this.detailsInscription?.getEleveResponse;
      this.anneeScolaire = this.detailsInscription?.anneeScolaireDTO;
      this.classe = this.detailsInscription?.classe;

      const document = await this.getDocumentRecuInscription();
      const code = this.detailsInscription?.code || `inscription_${inscriptionId}`;
      pdfMake.createPdf(document).download(`Recu_${code}.pdf`);

    } catch (error: any) {
      console.error('Erreur récupération inscription :', error);
      this.toastService.error(
        error?.error?.message ||
        'Erreur lors de la récupération des informations de l’inscription.',
        'Erreur'
      );
    }
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

  async telechargerBulletin(bulletinId: number): Promise<void> {

    if (!bulletinId) {
      return;
    }
    try {
      const data = await firstValueFrom(this.dossierResource.afficherDetailsResource('bulletin', bulletinId));

      this.detailsBulletinEleve = data || {};

      const document = await this.getDocumentFicheBulletin();
      const classe = this.detailsBulletinEleve?.classe || 'BULLETIN';

      pdfMake.createPdf(document).download(`BULLETIN_${classe}.pdf`);

    } catch (error: any) {
      console.error('Erreur récupération inscription :', error);
      this.toastService.error(
        error?.error?.message ||
        'Erreur lors de la récupération des informations de l’inscription.',
        'Erreur'
      );
    }
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


  telechargerDocumentStocke(documentStocke: DocumentResponse): void {
    const documentUuid = documentStocke?.documentUuid;
    if (!documentUuid) {
      this.toastService.warning('Aucun fichier à télécharger');
      return;
    }

    this.isDocumentLoading = true;

    this.dossierEleveService
      .getPhotoContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.isDocumentLoading = false;

          try {
            const url = window.URL.createObjectURL(blob);

            const link = window.document.createElement('a');
            link.href = url;
            link.download = documentStocke.nomFichier || 'document';
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.toastService.success('Téléchargement démarré');

          } catch (error) {

            console.error('Erreur lors du téléchargement :', error);

            this.toastService.error(
              'Erreur lors du téléchargement du fichier'
            );
          }
        },

        error: (error) => {

          console.error(
            'Erreur lors du téléchargement du document :',
            error
          );

          this.isDocumentLoading = false;

          this.toastService.error(
            'Impossible de télécharger le document'
          );
        }
      });
  }

  private revokeDocumentUrl(): void {
    if (this.documentObjectUrl) {
      window.URL.revokeObjectURL(this.documentObjectUrl);
      this.documentObjectUrl = null;
    }
  }


  retour(): void {
    window.history.back();
  }

  goBack(): void {
    window.history.back();
  }
}
