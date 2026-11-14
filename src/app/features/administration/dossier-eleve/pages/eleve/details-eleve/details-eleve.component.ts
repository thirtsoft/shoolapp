import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  DerniereNoteDTO,
  DernierePresenceDTO,
  DernierPaiementDTO,
  DetailsEleveResponse,
  ParentEleveDTO
} from '../../../../../../core/models/dossiereleve/dossier-eleve';

import { AnneeScolaireEncoursResponse } from '../../../../../../core/models/referentiels/annee-scolaire-encours-response';

import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';
import { EleveData } from '../../../../../../core/models/dossiereleve/details-dossier-eleve';

declare const pdfMake: any;

type DossierTab =
  | 'overview'
  | 'parcours'
  | 'resultats'
  | 'presence'
  | 'paiements'
  | 'documents'
  | 'plus';

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

  factures: any[] = [];

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


  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly referentielService = inject(ReferentielResourceService);


  ngOnInit(): void {

    this.eleveUuid = this.activatedRouter.snapshot.params['uuid'];

    this.loadDefaultAvatars();

    this.getAnneeScolaires();
  }

  onAnneeScolaireChange(annee: AnneeScolaireEncoursResponse): void {

    if (!annee) {
      return;
    }

    this.anneeScolaireSelectionnee = annee;

    if (this.eleveUuid) {
      this.getDetailsDossiersEleve(this.eleveUuid, annee.anneeScolaireUuid!);
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
  }


  retour(): void {
    window.history.back();
  }


  goBack(): void {
    window.history.back();
  }

  getAnneeScolaires(): void {

    this.errorMessage = undefined;

    this.referentielService
      .getResourceList('anneescolaire/response')
      .subscribe({

        next: (res: any[]) => {

          this.anneesScolaires = res ?? [];

          if (this.anneesScolaires.length === 0) {

            this.errorMessage =
              'Aucune année scolaire disponible.';

            return;
          }

          const anneeEnCours = this.anneesScolaires.find(annee => annee.etat?.toLowerCase() === 'en cours');


          this.anneeScolaireSelectionnee = anneeEnCours ?? this.anneesScolaires[0];

          if (this.eleveUuid && this.anneeScolaireSelectionnee?.anneeScolaireUuid) {
            this.getDetailsDossiersEleve(this.eleveUuid, this.anneeScolaireSelectionnee.anneeScolaireUuid);
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

    this.dossierEleveService
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


          console.log(
            'Dossier élève chargé :',
            res
          );

          console.log(
            'Année scolaire :',
            res.anneeScolaireLibelle
          );

          console.log(
            'Dernière note :',
            this.derniereNote
          );

          console.log(
            'Dernier paiement :',
            this.dernierPaiement
          );

          console.log(
            'Dernière présence :',
            this.dernierePresence
          );

          console.log(
            'Photo :',
            res.photo
          );
        },

        error: (err) => {

          this.eleve = null;

          this.eleveDetails = undefined;
          this.tuteurs = [];
          this.notes = [];
          this.derniereNote = undefined;
          this.dernierPaiement = undefined;
          this.dernierePresence = undefined;

          this.errorMessage =
            'Impossible de charger le dossier de l’élève.';

          console.error(
            'Erreur de chargement du dossier élève :',
            err
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
    this.dossierEleveService
      .getPhotoContent(photo.photoUuid)
      .subscribe({
        next: (blob: Blob) => {

          if (this.photoPreview) {
            URL.revokeObjectURL(this.photoPreview);
          }

          this.photoPreview =
            URL.createObjectURL(blob);
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
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
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

        console.log(
          '✅ Avatar homme chargé'
        );
      })
      .catch(err =>
        console.error(
          '❌ Erreur chargement avatar homme:',
          err
        )
      );

    this.convertImageToBase64('assets/img/femme.png')
      .then(base64 => {
        this.avatarFemmeBase64 = base64;

        console.log(
          '✅ Avatar femme chargé'
        );
      })
      .catch(err =>
        console.error(
          '❌ Erreur chargement avatar femme:',
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

            reject(new Error('Impossible de créer le contexte canvas'));
          }
        };

        img.onerror = () =>
          reject(new Error(`Impossible de charger l'image : ${imagePath}`));

        img.src = imagePath;
      }
    );
  }


  private getDefaultAvatar(sexe: string): string {
    const sexeLower = sexe?.toLowerCase() || '';
    if (
      sexeLower === 'féminin' ||
      sexeLower === 'feminin' ||
      sexeLower === 'f' ||
      sexeLower === 'fille'
    ) {

      return this.avatarFemmeBase64 || '';
    }

    return this.avatarHommeBase64 || '';
  }

  getDerniereNoteEleve(): number | null {
    return this.derniereNote?.note ?? null;
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
    linkElement.setAttribute('download', `dossier_eleve_${this.eleveDetails.matricule || 'inconnu'}.json`);
    linkElement.click();
  }


  telechargerDossier(): void {
    if (!this.eleveDetails) {

      console.warn(
        'Aucune donnée élève disponible'
      );

      return;
    }
  }

  imprimerDossierV1(data: EleveData): void {
    this.genererDossierEleveEnPDF(data);
  }

  genererDossierEleveEnPDF(data: EleveData, download: boolean = false): void {

    console.warn(
      'La génération PDF utilise encore l’ancien modèle EleveData.'
    );
  }

  getMeilleureNote(notes: any[]): number | null {
    if (!notes || notes.length === 0) {
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
}