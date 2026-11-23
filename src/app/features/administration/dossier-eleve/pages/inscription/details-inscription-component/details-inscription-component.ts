import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { DetailsInscription } from '../../../../../../core/models/dossiereleve/details-inscription';
import { InscrireEleveServiceRequest, ServiceEleveResponse } from '../../../../../../core/models/dossiereleve/service-eleve-response';
import { OrganizationMiniResponse } from '../../../../../../core/models/onboarding/organization/organization-mini-response';
import { Eleve } from '../../../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ConfigOrganizationService } from '../../../../configorganization/services/configorganization.service';
import { DossierEleveService } from '../../../service/dossier-eleve.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';
declare const pdfMake: any;

interface ServiceRemise {
  id: number;
  code: string;
  libelle: string;
  obligatoire: boolean;
  souscrit: boolean;
  tarif: number;
  beneficiaireRemise: boolean;
  remise: number;
  montantRemise: number;
  montantFinal: number;
  inscriptionServiceId: number | null;
  actif: boolean;
}


@Component({
  selector: 'app-details-inscription-component',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
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

  loadingServices = signal(false);
  savingServices = signal(false);


  services: ServiceRemise[] = [];

  modalServicesVisible = false;

  serviceSelectionne: ServiceRemise | null = null;

  formulaireRemise = { beneficiaireRemise: false, remise: 0 };

  modalWorkflowVisible = false;

  workflowAction: 'CONFIRMER' | 'REJETER' | null = null;

  motifRejet = '';

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

          this.chargerServicesEleve();
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
    if (sexe === 'Feminin' || sexe === 'Femme' || sexe === 'f') {
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
              motifAnnulation: this.isMotifRequired ? this.actionForm.value.motifAnnulation || null : null
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
            confirmer: 'L’inscription a été confirmée avec succès.',
            rejeter: 'L’inscription a été rejetée avec succès.'
          };

          this.toastService.success(successMessages[action], 'Succès');

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
    return Math.min(100, (this.montantRecu / this.montantInscription) * 100);
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
    return this.normalizeEtat(this.detailsInscription?.etat) === this.normalizeEtat(this.libelleEtat.LIBELLE_ETAT_A_CONFIRMEE);
  }

  get isValidee(): boolean {
    return this.normalizeEtat(this.detailsInscription?.etat) === this.normalizeEtat(this.libelleEtat.LIBELLE_ETAT_VALIDEE);
  }

  get paymentMethod(): string {
    return (this.detailsInscription?.moyenPaiement || '-');
  }

  get dateInscription() {
    return (this.detailsInscription?.dateInscription);
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
    return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  private chargerServicesEleve(codeServiceASelectionner: string = 'MENSUALITE'): void {

    if (!this.inscriptionId) {
      return;
    }

    this.loadingServices.set(true);

    this.dossierResource
      .getServicesEleve(this.inscriptionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (response: ServiceEleveResponse[]) => {

          this.services = (response || []).map(service => this.mapServiceResponse(service));

          this.loadingServices.set(false);


          const serviceASelectionner = this.services.find(
            service => service.code === codeServiceASelectionner
          ) ??
            this.services[0] ??
            null;

          if (this.modalServicesVisible && serviceASelectionner) {
            this.selectionnerService(serviceASelectionner);
          }
        },

        error: (error: any) => {

          console.error('Erreur chargement services élève :', error);

          this.services = [];
          this.serviceSelectionne = null;

          this.loadingServices.set(false);

          this.toastService.error(
            error?.error?.message || 'Impossible de charger les services de l’élève.',
            'Erreur'
          );
        }
      });
  }

  private mapServiceResponse(service: ServiceEleveResponse): ServiceRemise {
    return {
      id: service.typeServiceOffertId,
      code: service.code,
      libelle: service.libelle,
      obligatoire: service.obligatoire,
      souscrit: service.souscrit,
      tarif: Number(service.tarif || 0),
      beneficiaireRemise: service.beneficieRemise,
      remise: Number(service.remise || 0),
      montantRemise: Number(service.montantRemise || 0),
      montantFinal: Number(service.montantFinal || 0),
      inscriptionServiceId: service.inscriptionServiceId ?? null,
      actif: true
    };
  }

  get servicesAffiches(): ServiceRemise[] {
    return this.services.filter(service =>
      service.actif &&
      (service.obligatoire || service.souscrit)
    );
  }

  get montantTotalRemises(): number {
    return this.servicesAffiches.reduce(
      (total, service) =>
        total + this.calculerMontantRemise(service),
      0
    );
  }

  get montantTotalServices(): number {
    return this.servicesAffiches.reduce(
      (total, service) =>
        total + this.calculerMontantFinal(service),
      0
    );
  }

  ouvrirGestionServices(): void {
    if (this.loadingServices() || this.savingServices()) {
      return;
    }
    this.modalServicesVisible = true;

    this.serviceSelectionne = null;

    this.formulaireRemise = {
      beneficiaireRemise: false,
      remise: 0
    };

    this.chargerServicesEleve('MENSUALITE');
  }

  fermerGestionServices(): void {
    if (this.savingServices()) {
      return;
    }
    this.modalServicesVisible = false;
    this.serviceSelectionne = null;

    this.formulaireRemise = {
      beneficiaireRemise: false,
      remise: 0
    };
  }

  selectionnerService(service: ServiceRemise): void {

    this.serviceSelectionne = service;

    this.formulaireRemise = {
      beneficiaireRemise: service.beneficiaireRemise,
      remise: service.remise
    };
  }

  toggleSouscription(service: ServiceRemise): void {

    if (service.obligatoire) {
      return;
    }

    service.souscrit = !service.souscrit;

    if (!service.souscrit) {

      service.beneficiaireRemise = false;
      service.remise = 0;
      service.montantRemise = 0;
      service.montantFinal = service.tarif;

      this.formulaireRemise = {
        beneficiaireRemise: false,
        remise: 0
      };

      return;
    }

    this.formulaireRemise = {
      beneficiaireRemise: service.beneficiaireRemise,
      remise: service.remise
    };
  }

  enregistrerServices(): void {
    if (!this.eleve?.id) {

      this.toastService.error(
        'Élève introuvable.',
        'Erreur'
      );

      return;
    }

    if (!this.serviceSelectionne) {

      this.toastService.warning(
        'Sélectionnez un service.',
        'Attention'
      );

      return;
    }

    const service = this.serviceSelectionne;

    let remise = Number(this.formulaireRemise.remise || 0);
    remise = Math.max(0, Math.min(100, remise));
    const beneficieRemise = this.formulaireRemise.beneficiaireRemise;
    service.beneficiaireRemise = beneficieRemise;

    service.remise = beneficieRemise ? remise : 0;

    this.recalculerService(service);

    const request: InscrireEleveServiceRequest = {
      eleveId: this.eleve.id,
      anneeScolaireId: this.anneeScolaire?.id!,
      typeServiceOffertId: service.id,
      souscrit: service.obligatoire ? true : service.souscrit,
      beneficieRemise: beneficieRemise ? 1 : 0,
      remise: beneficieRemise ? remise : 0
    };

    this.savingServices.set(true);

    this.dossierResource
      .inscrireEleveService(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          this.savingServices.set(false);

          this.toastService.success(
            service.code === 'MENSUALITE'
              ? 'La remise sur la mensualité a été enregistrée avec succès.'
              : service.souscrit
                ? `${service.libelle} a été souscrit avec succès.`
                : `${service.libelle} a été désinscrit avec succès.`,
            'Succès'
          );

          this.modalServicesVisible = false;
          this.serviceSelectionne = null;

          this.formulaireRemise = {
            beneficiaireRemise: false,
            remise: 0
          };

          this.chargerServicesEleve();
        },

        error: (error: any) => {

          this.savingServices.set(false);

          console.error(
            'Erreur enregistrement service élève :',
            error
          );

          this.toastService.error(
            error?.error?.message ??
            error?.message ??
            'Impossible d’enregistrer le service.',
            'Erreur'
          );
        }
      });
  }

  supprimerRemise(): void {

    if (!this.serviceSelectionne) {
      return;
    }

    this.serviceSelectionne.beneficiaireRemise = false;
    this.serviceSelectionne.remise = 0;

    this.formulaireRemise = {
      beneficiaireRemise: false,
      remise: 0
    };

    this.recalculerService(
      this.serviceSelectionne
    );
  }

  private recalculerService(service: ServiceRemise): void {
    service.montantRemise = this.calculerMontantRemise(service);
    service.montantFinal = this.calculerMontantFinal(service);
  }

  enregistrerRemise(): void {
    if (!this.serviceSelectionne) {
      return;
    }

    let remise = Number(this.formulaireRemise.remise || 0);

    remise = Math.max(0, Math.min(100, remise));
    this.serviceSelectionne.beneficiaireRemise = this.formulaireRemise.beneficiaireRemise;
    this.serviceSelectionne.remise = this.formulaireRemise.beneficiaireRemise ? remise : 0;

    this.recalculerService(this.serviceSelectionne);
  }

  get montantFinalModal(): number {
    if (!this.serviceSelectionne) {
      return 0;
    }

    if (!this.formulaireRemise.beneficiaireRemise) {
      return this.serviceSelectionne.tarif;
    }

    return this.calculerMontantAvecRemise(
      this.serviceSelectionne.tarif,
      this.formulaireRemise.remise
    );
  }

  get montantRemiseModal(): number {
    if (!this.serviceSelectionne) {
      return 0;
    }

    return Math.max(0, this.serviceSelectionne.tarif - this.montantFinalModal);
  }

  calculerMontantAvecRemise(montant: number, remise: number): number {
    if (montant <= 0) {
      return 0;
    }

    if (remise <= 0) {
      return montant;
    }

    if (remise >= 100) {
      return 0;
    }

    return Math.round(montant * (1 - remise / 100));
  }

  calculerMontantFinal(service: ServiceRemise): number {
    if (!service.beneficiaireRemise) {
      return service.tarif;
    }

    return this.calculerMontantAvecRemise(service.tarif, service.remise);
  }

  calculerMontantRemise(service: ServiceRemise): number {
    if (!service.beneficiaireRemise) {
      return 0;
    }

    return Math.max(0, service.tarif - this.calculerMontantFinal(service));
  }

  get tauxPaiement(): number {
    if (!this.detailsInscription) {
      return 0;
    }
    if (Number(this.detailsInscription.montantInscription) <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((Number(this.detailsInscription.montantRecu) / Number(this.detailsInscription.montantInscription)) * 100));
  }


  fermerWorkflow() {

  }

  confirmerWorkflow() { }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' F CFA';
  }

  async imprimer(): Promise<void> {
    const document = await this.getDocumentRecuInscription();
    pdfMake.createPdf(document).print();
  }

  async telecharger() {
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
    const nomOrganisation = organization.libelle?.trim() || 'ÉCOLE SCOOLLI';
    const adresseOrganisation = organization.adresse?.trim() || 'Wokite Sénégal, Dakar';
    const telephoneOrganisation = organization.telephone?.trim() || '33 820 10 92 - BP 6268 Dakar étoile';
    const emailOrganisation = organization.email?.trim() || '';
    const sloganOrganisation = organization.slogan?.trim() || 'L’école pour connaissance';

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

            vLineColor: () => '#E5E7E9',

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

      footer: (currentPage: number, pageCount: number) => {

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

                  text: `Page ${currentPage} / ${pageCount}`,

                  fontSize: 7,

                  color: '#98A2B3',

                  alignment: 'right'

                }

              ]

            },

            {

              text: 'Une solution Wokite Technologies & Innovation',

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

  private async getAssetBase64(assetPath: string): Promise<string | null> {
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

  private async convertBlobToPngBase64(blob: Blob): Promise<string | null> {
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

        if (canvas.width <= 0 || canvas.height <= 0) {
          throw new Error(
            'Dimensions de l’image invalides'
          );
        }
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error(
            'Impossible de créer le contexte Canvas'
          );
        }
        context.drawImage(image, 0, 0);
        return canvas.toDataURL('image/png');

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
    const classe = (this.classLabel || eleve.classe?.libelle || '-').toString().trim();
    const sexe = (eleve.sexe || '-').toString().trim();
    const dateNaissance = eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '-';
    const lieuNaissance = (eleve.lieuNaissance || '-').toString().trim();
    const anneeScolaire = (this.anneeScolaireLabel || '-').toString().trim();
    const nomEcole = (organization.libelle || 'Établissement scolaire').toString().trim();

    let logoBase64: string | null = await this.getOrganizationLogoBase64();

    if (!logoBase64) {
      logoBase64 = await this.getScoolliLogoBase64();
    }

    const drapeauSenegal = await this.getAssetBase64('assets/img/Senegal.png');
    let photoBase64: string | null = null;
    const photo = eleve.photo;
    const photoUuid = photo?.photoUuid;

    if (photo?.available && photoUuid) {

      try {

        const blob = await firstValueFrom(this.dossierEleveService.getPhotoContent(photoUuid));

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


    if (!photoBase64) {

      const sexeNormalise = this.normalizeText(sexe);

      const fallbackPhoto =
        (
          sexeNormalise === 'FEMININ' ||
          sexeNormalise === 'femme' ||
          sexeNormalise === 'f'
        )
          ? 'assets/img/femme.png'
          : 'assets/img/homme.png';

      photoBase64 = await this.getAssetBase64(fallbackPhoto);
    }

    return {

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

      background: () => ({
        canvas: [
          {
            type: 'rect',
            x: 3,
            y: 3,
            w: 236.65,
            h: 147.07,
            color: '#FFFFFF'
          },
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

      content: [

        {
          columns: [

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
                  text: 'INSPECTION D’ACADÉMIE DE DAKAR – I.E.F. DE DAKAR',

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

        {
          columns: [

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

            {
              width: '*',

              stack: [

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

        {
          text: 'Cette carte est strictement personnelle et reste la propriété de l’établissement.',

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

        {
          text: 'Le Responsable de l’établissement',

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
              text: 'Document généré avec Scoolli · scoolli.com',

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

      styles: {

        defaultStyle: {
          font: 'Roboto',
          color: '#2C3E50'
        }
      }
    };
  }

  retourInscriptions(): void {
    this.goBack();
  }

  goBack(): void {
    window.history.back();
  }
}