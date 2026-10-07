import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { EtatLibelle } from '../../../../../core/constants/etat-libelle';
import { DetailsFacture } from '../../../../../core/models/comptabilite/details-facture';
import { DetailsLigneFacture } from '../../../../../core/models/comptabilite/details-ligne-facture';
import { OrganizationMiniResponse } from '../../../../../core/models/onboarding/organization/organization-mini-response';
import { MoyenPaiement } from '../../../../../core/models/referentiels/moyen-paiement';
import { ParametresEtablissement } from '../../../../../core/models/referentiels/parametre-etablissement';
import { DateformatService } from '../../../../../core/services/date-format.service';
import { ConfigOrganizationService } from '../../../../administration/configorganization/services/configorganization.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

declare const pdfMake: any;

@Component({
  selector: 'app-details-facture',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, DecimalPipe, DatePipe, TitleCasePipe],
  templateUrl: './details-facture.component.html',
  styleUrls: ['./details-facture.component.css']
})
export class DetailsFactureComponent implements OnInit {

  factureId!: number;

  detailsFacture?: DetailsFacture = {};

  title = 'Détails facture';

  detailEleve?: any;

  remisePourcent?: number;
  montantRemise: any;
  montantInitial: any;

  parametresEtablissement: ParametresEtablissement = {};

  libelleEtat = EtatLibelle;

  logoUrl = '';

  showPaiementModal = false;

  paiementForm!: FormGroup;

  moyenPayementList: MoyenPaiement[] = [];

  paiementActionLoading: number | null = null;
  paiementAction: 'confirm' | 'reject' | null = null;

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  isMotifRequired: boolean = false;

  logoPreview: string | null = null;

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  private readonly pdfColors = {
    navy: '#12386B',
    blue: '#2F6FB5',
    text: '#1F2A44',
    muted: '#6B7A90',
    softBg: '#EAF2FB',
    border: '#D6E4F2',
    waveLight: '#DCEBFA',
    white: '#FFFFFF',
    danger: '#B42318',
    success: '#027A48'
  };


  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dateFormat = inject(DateformatService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly modalService = inject(NgbModal);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);


  constructor() {
    this.factureId = Number(this.activeRoute.snapshot.params['id']);
    this.initPaiementForm();
  }

  ngOnInit(): void {
    this.getParametresEtablissement();
    this.loadOrganizationInfos();
    this.getMoyenPaiementList();

    if (this.factureId > 0) {
      this.getDetailsFacture(this.factureId);
      this.title = 'Détails d\'une facture';
    }
  }

  initActionForm(): void {
    this.actionForm = this.formBuilder.group({
      motif: ['']
    });
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

  getMoyenPaiementList(): void {
    this.referentielResource.getResourceList('moyenpaiement')
      ?.subscribe({
        next: (data: any) => {
          this.moyenPayementList = data ?? [];
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement des moyens de paiement :',
            error
          );
        }
      });
  }

  getParametresEtablissement(): void {
    this.referentielService.getParametresEtablissement()
      .subscribe({
        next: (config: ParametresEtablissement) => {
          this.parametresEtablissement = config;
        },
        error: (error) => {
          console.error(
            'Erreur chargement configuration établissement',
            error
          );
        }
      });
  }

  getDetailsFacture(factureId: number): void {
    this.comptabiliteResource.afficherDetailsResource('facture', factureId)
      .subscribe({
        next: (data: any) => {
          this.detailsFacture = data;
          this.detailEleve = this.detailsFacture?.eleve;
          this.remisePourcent = this.detailsFacture?.remise;
          const lignes = this.detailsFacture?.detailsLigneFactureDTOS ?? [];

          for (const ligne of lignes) {
            this.montantRemise = ligne.montantRemise;
            this.montantInitial = ligne.montantInitial;
          }
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement du détail de la facture :',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message || 'Impossible de charger les détails de la facture.'
          );
        }
      });
  }

  getAllTarifs(): any[] {
    let tarifs: any[] = [];
    const lignes = this.detailsFacture?.detailsLigneFactureDTOS ?? [];
    lignes.forEach((detail: DetailsLigneFacture) => {
      if (
        detail?.typeServiceOffertDTO &&
        detail.typeServiceOffertDTO.listTarifDTOList
      ) {
        tarifs = tarifs.concat(
          detail.typeServiceOffertDTO.listTarifDTOList
        );
      }
    });

    return tarifs;
  }

  getTotalTarifsDisponibles(): number {
    let total = 0;
    const lignes = this.detailsFacture?.detailsLigneFactureDTOS ?? [];
    lignes.forEach((detail) => {
      if (detail.typeServiceOffertDTO?.listTarifDTOList) {
        detail.typeServiceOffertDTO.listTarifDTOList.forEach(
          (tarif) => {
            total += Number(tarif.montant || 0);
          }
        );
      }
    });

    return total;
  }

  formatMontant(value: number | null | undefined): string {
    return `${value?.toString()} FCFA`;
  }

  getMontantDejaPaye(): number {
    return Number(this.detailsFacture?.montantPayement || 0);
  }

  getMontantRestantFacture(): number {
    const montantFacture = Number(this.detailsFacture?.montant || 0);
    const montantPaye = this.getMontantDejaPaye();
    return Math.max(0, montantFacture - montantPaye);
  }

  peutEnregistrerPaiement(): boolean {
    return (this.getMontantRestantFacture() > 0 &&
      (
        this.detailsFacture?.etat ===
        this.libelleEtat.LIBELLE_ETAT_ENCOURS ||
        this.detailsFacture?.etat ===
        this.libelleEtat.LIBELLE_ETAT_PAYEE_PARTIELLE
      )
    );
  }

  initPaiementForm(): void {
    this.paiementForm = this.formBuilder.group({
      facture: [null, Validators.required],
      moyenPaiement: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      reference: ['']
    });
  }

  isMontantValide(): boolean {
    const montant = Number(this.paiementForm.get('montant')?.value || 0);
    const reste = this.getMontantRestantFacture();
    return (
      montant > 0 &&
      montant <= reste
    );
  }

  getMontantRestantLabel(): string {
    const reste = this.getMontantRestantFacture();
    if (reste === 0) {
      return 'Facture entièrement payée';
    }
    return `${reste.toLocaleString('fr-FR')} FCFA`;
  }

  openPaiementModal(): void {
    if (!this.peutEnregistrerPaiement()) {
      return;
    }

    this.getMoyenPaiementList();

    this.showPaiementModal = true;

    this.paiementForm.reset();

    this.paiementForm.patchValue({
      facture: this.detailsFacture?.id,
      moyenPaiement: '',
      montant: this.getMontantRestantFacture(),
      reference: ''
    });
  }

  closePaiementModal(): void {
    this.showPaiementModal = false;
  }

  enregistrerUnPaiement(): void {
    if (this.paiementForm.invalid) {
      this.paiementForm.markAllAsTouched();
      this.toastService.warning(
        'Attention',
        'Veuillez renseigner les informations obligatoires.'
      );

      return;
    }

    const montantRecu = Number(this.paiementForm.get('montant')?.value || 0);
    const montantRestant = this.getMontantRestantFacture();

    if (montantRecu <= 0) {
      this.toastService.warning('Attention', 'Veuillez saisir un montant valide.');
      return;
    }

    if (montantRecu > montantRestant) {
      this.toastService.warning(
        'Attention',
        `Le montant ne peut pas dépasser le reste à payer de ${montantRestant.toLocaleString('fr-FR')} FCFA.`
      );
      return;
    }

    const payload = {
       typePaiement: 'FACTURE',
      facture: this.detailsFacture?.id,
      montant: montantRecu,
      moyenPaiement: this.paiementForm.get('moyenPaiement')?.value,
      reference: this.paiementForm.get('reference')?.value?.trim() || null
    };

    this.comptabiliteResource.creerUneRessource('payement', payload)
      .subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success(
              'Succès',
              'Le paiement a été enregistré avec succès.'
            );

            this.closePaiementModal();
            this.getDetailsFacture(this.factureId);
          } else {
            this.toastService.error(
              'Erreur',
              data.message || 'Erreur lors de l\'enregistrement du paiement.'
            );
          }
        },

        error: (error) => {
          console.error('Erreur paiement :', error);

          this.toastService.error(
            'Erreur',
            error?.error?.message || 'Erreur lors de l\'enregistrement du paiement.'
          );
        }
      });
  }

  getTotalMontantFacture(): string {
    const total =
      (
        this.detailsFacture
          ?.detailsLigneFactureDTOS ?? []
      ).reduce(
        (sum, ligne) =>
          sum +
          Number(
            ligne.montantRemise ??
            ligne.montantInitial ??
            0
          ),
        0
      );

    return `${total.toLocaleString('fr-FR')} FCFA`;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PAYÉ':
      case 'PAYE':
        return 'status-paid';

      case 'EN_ATTENTE':
      case 'ATTENTE':
        return 'status-pending';

      case 'IMPAYÉ':
      case 'IMPAYE':
        return 'status-overdue';

      case 'PAYÉE PARTIELLE':
      case 'PAYEE_PARTIELLE':
        return 'status-partial';

      default:
        return 'status-pending';
    }
  }

  private normalizePaiementStatus(status: string | undefined): string {
    if (!status) {
      return '';
    }

    return status
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  isPaiementEnAttente(status: string | undefined): boolean {
    return [
      'A CONFIRMEE',
      'A CONFIRMER',
      'A_CONFIRMEE',
      'A_CONFIRMER'
    ].includes(this.normalizePaiementStatus(status));
  }

  getPaiementStatusClass(status: string | undefined): string {
    const normalizedStatus = this.normalizePaiementStatus(status);

    switch (normalizedStatus) {
      case 'VALIDEE':
      case 'VALIDÉE':
        return 'status-success';

      case 'A CONFIRMEE':
      case 'A CONFIRMER':
      case 'A_CONFIRMEE':
      case 'A_CONFIRMER':
        return 'status-warning';

      case 'REJETEE':
      case 'REJETÉE':
        return 'status-danger';

      case 'ANNULEE':
      case 'ANNULLÉE':
        return 'status-secondary';

      default:
        return 'status-default';
    }
  }

  getMoisName(mois: number): string {
    const moisNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre'
    ];

    return moisNames[mois - 1] || '';
  }

  getTotalFinal(): number {
    let total = this.detailsFacture?.montant || 0;

    if (
      this.remisePourcent &&
      this.remisePourcent > 0
    ) {
      total = total * (1 - this.remisePourcent / 100);
    }

    return total;
  }

  openPaiementActionModal(content: any, paiement: any, action: 'confirmer' | 'rejeter'): void {
    this.modalActionLabel = action;
    this.isMotifRequired = action === 'rejeter';

    if (!this.actionForm) {
      this.initActionForm();
    }

    const motifControl = this.actionForm.get('motif');

    this.actionForm.reset();

    if (this.isMotifRequired) {
      motifControl?.setValidators([Validators.required, Validators.maxLength(95)]);
    } else {
      motifControl?.clearValidators();
    }

    motifControl?.updateValueAndValidity();
    this.actionForm.reset();

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    }).result.then(
      (result) => {

        if (result !== 'confirm') {
          return;
        }

        if (action === 'confirmer') {
          this.confirmerPaiement(paiement);
          return;
        }
        const motif = this.actionForm.get('motif')?.value?.trim();
        this.rejeterPaiement(paiement, motif);
      },
      () => { }
    );
  }

  confirmerPaiement(paiement: any): void {
    this.comptabiliteResource.confirmerPaiement(paiement.id).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Le paiement a été confirmé avec succès.');

        this.getDetailsFacture(this.factureId);
      },
      error: (error: any) => {
        this.toastService.error(
          'Erreur',
          error.error?.message || 'Impossible de confirmer le paiement.'
        );
      }
    });
  }

  rejeterPaiement(paiement: any, motif: string): void {
    this.comptabiliteResource.rejeterPaiement(paiement.id, motif)
      .subscribe({
        next: () => {
          this.toastService.success('Succès', 'Le paiement a été rejeté avec succès.');
          this.getDetailsFacture(this.factureId);
        },
        error: (error: any) => {
          this.toastService.error(
            'Erreur',
            error.error?.message || 'Impossible de rejeter le paiement.'
          );
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

  async imprimerFacture(): Promise<void> {
    const document = await this.getDocumentFicheFacture();
    pdfMake.createPdf(document).print();
  }

  async DownloadPdf(): Promise<void> {
    const document = await this.getDocumentFicheFacture();
    pdfMake.createPdf(document).download(`${this.detailsFacture?.numeroFacture || 'facture'}.pdf`);
  }

  private formatDatePdf(date: string | null | undefined): string {
    if (!date) {
      return '—';
    }

    return this.dateFormat.formatDate(date);
  }

  private getPaiementsValides(): any[] {
    return (this.detailsFacture?.paiements ?? []).filter(
      (paiement: any) => {
        const etat = String(paiement?.etat || '')
          .trim()
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return etat === 'VALIDEE' || etat === 'VALIDÉE';
      }
    );
  }

  private buildWave(pageWidth: number, pageHeight: number): any[] {
    const c = this.pdfColors;
    const makeWave = (amp: number, base: number, phase: number, color: string) => {
      const pts: { x: number; y: number }[] = [{ x: 0, y: pageHeight }];
      for (let x = 0; x <= pageWidth; x += 8) {
        pts.push({
          x,
          y: pageHeight - base - amp * Math.sin((x / pageWidth) * Math.PI * 1.2 + phase)
        });
      }
      pts.push({ x: pageWidth, y: pageHeight });
      return { type: 'polyline', closePath: true, color, points: pts };
    };

    return [
      makeWave(9, 24, 0.4, c.waveLight),
      makeWave(7, 10, 0.2, c.blue)
    ];
  }

  async getDocumentFicheFacture(): Promise<any> {
    const c = this.pdfColors;

    const facture = this.detailsFacture;
    const lignes = facture?.detailsLigneFactureDTOS ?? [];
    const paiements = facture?.paiements ?? [];
    const etablissement = this.organizationData;
    const eleve = facture?.eleve;

    const organizationLogoBase64 = await this.getOrganizationLogoBase64();
    const logo = organizationLogoBase64 ?? await this.getScoolliLogoBase64();

    const montantTotal = Number(facture?.montant || 0);
    const montantPaye = this.getMontantDejaPaye();
    const montantRestant = this.getMontantRestantFacture();
    const remise = Number(facture?.remise || 0);

    const nomEleve = `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim();
    const periode = [facture?.mois, facture?.annee].filter(Boolean).join(' ');
    const dateEmission = facture?.dateFacture ? facture.dateFacture : '—';

    const sousTotal = lignes.reduce(
      (sum: number, l: DetailsLigneFacture) => sum + Number(l.montantInitial ?? l.montantRemise ?? 0),
      0
    );
    const montantRemiseTotal = Math.max(sousTotal - montantTotal, 0);

    const headerLeft: any[] = [];
    if (logo) {
      headerLeft.push({ image: logo, width: 95, margin: [0, 0, 0, 4] });
    }
    if (!organizationLogoBase64 || !logo) {
      headerLeft.push({
        text: etablissement?.libelle || 'ÉTABLISSEMENT SCOLAIRE',
        fontSize: 16, bold: true, color: c.navy
      });
    }

    const headerRight: any[] = [
      {
        text: etablissement?.libelle || 'Établissement Scolaire',
        fontSize: 10.5, bold: true, color: c.navy, margin: [0, 0, 0, 4]
      }
    ];
    if (etablissement?.adresse) {
      headerRight.push({ text: etablissement.adresse, fontSize: 8.5, color: c.text, margin: [0, 0, 0, 2] });
    }
    if (etablissement?.telephone) {
      headerRight.push({ text: `Tél. : ${etablissement.telephone}`, fontSize: 8.5, color: c.text, margin: [0, 0, 0, 2] });
    }
    if (etablissement?.email) {
      headerRight.push({ text: `Email : ${etablissement.email}`, fontSize: 8.5, color: c.text, margin: [0, 0, 0, 2] });
    }

    const infoLine = (label: string, value: string) => ({
      columns: [
        { text: label, width: 82, fontSize: 9, bold: true, color: c.navy },
        { text: ':', width: 10, fontSize: 9, color: c.navy },
        { text: value, width: '*', fontSize: 9, color: c.text }
      ],
      margin: [0, 0, 0, 6]
    });

    const clientStack: any[] = [
      { text: 'Élève', fontSize: 11, bold: true, color: c.navy, margin: [0, 0, 0, 8] },
      { text: nomEleve || '—', fontSize: 9.5, bold: true, color: c.navy, margin: [0, 0, 0, 4] }
    ];
    if (eleve?.matricule) {
      clientStack.push({ text: `Matricule : ${eleve.matricule}`, fontSize: 8.5, color: c.text, margin: [0, 0, 0, 2] });
    }
    if (eleve?.dateNaissance) {
      clientStack.push({
        text: `Né(e) le : ${this.dateFormat.formatDate(eleve.dateNaissance)}`,
        fontSize: 8.5, color: c.text, margin: [0, 0, 0, 2]
      });
    }
    if (periode) {
      clientStack.push({ text: `Période : ${periode}`, fontSize: 8.5, color: c.text });
    }

    // ---- TABLEAU DES LIGNES ------------------------------------------------
    const th = (text: string, alignment: string, extra: any = {}) => ({
      text, alignment, fontSize: 8.5, bold: true, color: c.white,
      fillColor: c.navy, margin: [8, 7, 8, 7], ...extra
    });

    const invoiceRows = lignes.map((ligne: DetailsLigneFacture) => {
      const initial = Number(ligne.montantInitial ?? ligne.montantRemise ?? 0);
      const net = Number(ligne.montantRemise ?? ligne.montantInitial ?? 0);

      return [
        {
          stack: [
            { text: ligne.typeServiceOffertDTO?.libelle || 'Service scolaire', fontSize: 8.5, bold: true, color: c.navy },
            ...(periode ? [{ text: `(${periode})`, fontSize: 8, color: c.muted, margin: [0, 2, 0, 0] }] : [])
          ],
          margin: [8, 8, 8, 8]
        },
        { text: '1', alignment: 'center', fontSize: 9, color: c.text, margin: [0, 8, 0, 8] },
        { text: this.formatMontant(initial), alignment: 'right', fontSize: 9, color: c.text, margin: [8, 8, 8, 8] },
        { text: this.formatMontant(net), alignment: 'right', fontSize: 9, color: c.text, margin: [8, 8, 8, 8] }
      ];
    });

    // ---- TOTAUX ------------------------------------------------------------
    const totalsBody: any[] = [
      [
        { text: 'Sous-total', fontSize: 9, bold: true, color: c.navy, fillColor: c.softBg, margin: [10, 7, 0, 7] },
        { text: this.formatMontant(sousTotal), fontSize: 9, alignment: 'right', color: c.text, fillColor: c.softBg, margin: [0, 7, 10, 7] }
      ]
    ];
    if (remise > 0) {
      totalsBody.push([
        { text: `Remise (${remise}%)`, fontSize: 9, bold: true, color: c.navy, fillColor: c.softBg, margin: [10, 7, 0, 7] },
        { text: `- ${this.formatMontant(montantRemiseTotal)}`, fontSize: 9, alignment: 'right', color: c.text, fillColor: c.softBg, margin: [0, 7, 10, 7] }
      ]);
    }
    totalsBody.push([
      { text: 'Total à payer', fontSize: 11, bold: true, color: c.white, fillColor: c.navy, margin: [10, 9, 0, 9] },
      { text: this.formatMontant(montantTotal), fontSize: 11, bold: true, alignment: 'right', color: c.white, fillColor: c.navy, margin: [0, 9, 10, 9] }
    ]);
    totalsBody.push([
      { text: 'Déjà payé', fontSize: 9, bold: true, color: c.navy, fillColor: c.softBg, margin: [10, 7, 0, 7] },
      { text: this.formatMontant(montantPaye), fontSize: 9, alignment: 'right', color: c.text, fillColor: c.softBg, margin: [0, 7, 10, 7] }
    ]);
    totalsBody.push([
      { text: 'Reste à payer', fontSize: 9.5, bold: true, color: montantRestant > 0 ? c.danger : c.success, fillColor: c.softBg, margin: [10, 7, 0, 7] },
      { text: this.formatMontant(montantRestant), fontSize: 9.5, bold: true, alignment: 'right', color: montantRestant > 0 ? c.danger : c.success, fillColor: c.softBg, margin: [0, 7, 10, 7] }
    ]);

    // ---- HISTORIQUE DES PAIEMENTS -----------------------------------------
    const pth = (text: string, alignment = 'left') => ({
      text, alignment, fontSize: 7.5, bold: true, color: c.navy, margin: [0, 0, 0, 4]
    });

    const paymentBlock: any[] = [
      { text: 'Historique des paiements', fontSize: 10.5, bold: true, color: c.navy, margin: [0, 0, 0, 8] }
    ];

    if (paiements.length > 0) {
      paymentBlock.push({
        table: {
          widths: [55, 55, '*', 62],
          headerRows: 1,
          body: [
            [pth('N° REÇU'), pth('DATE'), pth('MOYEN'), pth('MONTANT', 'right')],
            ...paiements.map((p: any) => [
              { text: p.numeroRecu || '—', fontSize: 8, color: c.text, margin: [0, 4, 0, 4] },
              { text: p.datePaiement ? this.dateFormat.formatDate(p.datePaiement) : '—', fontSize: 8, color: c.muted, margin: [0, 4, 0, 4] },
              { text: p.moyenPaiement || '—', fontSize: 8, color: c.text, margin: [0, 4, 0, 4] },
              { text: this.formatMontant(p.montant), fontSize: 8, bold: true, alignment: 'right', color: c.navy, margin: [0, 4, 0, 4] }
            ])
          ]
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => c.border,
          paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
        }
      });
    } else {
      paymentBlock.push({ text: 'Aucun paiement enregistré pour le moment.', fontSize: 8.5, color: c.muted });
    }

    const infoBox = {
      table: {
        widths: ['*'],
        body: [[
          {
            fillColor: c.softBg,
            margin: [12, 10, 12, 10],
            stack: [
              { text: 'Informations complémentaires', fontSize: 9.5, bold: true, color: c.blue, margin: [0, 0, 0, 6] },
              {
                text: `Statut de la facture : ${facture?.etat || '—'}.\n` +
                  'Cette facture est émise conformément aux conditions générales de l\'établissement. ' +
                  'En cas de question, n\'hésitez pas à nous contacter' +
                  (etablissement?.telephone ? ` au ${etablissement.telephone}.` : '.'),
                fontSize: 8.5, color: c.text, lineHeight: 1.3
              }
            ]
          }
        ]]
      },
      layout: 'noBorders'
    };

    // ---- DOCUMENT ----------------------------------------------------------
    return {
      pageSize: 'A4',
      pageMargins: [40, 36, 40, 75],

      background: (_currentPage: number, pageSize: any) => ({
        canvas: this.buildWave(pageSize.width, pageSize.height)
      }),

      content: [
        // En-tête
        {
          columns: [
            { width: '*', stack: headerLeft },
            { width: 190, stack: headerRight }
          ],
          columnGap: 20,
          margin: [0, 0, 0, 14]
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: c.blue }],
          margin: [0, 0, 0, 26]
        },

        // Titre + client
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'FACTURE', fontSize: 30, bold: true, color: c.navy, margin: [0, 0, 0, 6] },
                {
                  text: facture?.numeroFacture ? `N° ${facture.numeroFacture}` : '',
                  fontSize: 13, bold: true, color: c.muted, margin: [0, 0, 0, 14]
                },
                infoLine('Date d\'émission', dateEmission.toString()),
                infoLine('Statut', facture?.etat || '—')
              ]
            },
            {
              width: 235,
              table: {
                widths: ['*'],
                body: [[{ fillColor: c.softBg, margin: [14, 12, 14, 12], stack: clientStack }]]
              },
              layout: 'noBorders'
            }
          ],
          columnGap: 20,
          margin: [0, 0, 0, 26]
        },

        // Tableau des lignes
        {
          table: {
            widths: ['*', 55, 85, 90],
            headerRows: 1,
            body: [
              [th('Description', 'left'), th('Quantité', 'center'), th('Prix unitaire', 'right'), th('Montant', 'right')],
              ...invoiceRows
            ]
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 ? 0 : 0.6),
            vLineWidth: () => 0,
            hLineColor: () => c.border,
            paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
          },
          margin: [0, 0, 0, 14]
        },

        // Totaux
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 235,
              table: { widths: ['*', 'auto'], body: totalsBody },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 0, 26]
        },

        // Paiements + infos complémentaires
        {
          columns: [
            { width: 255, stack: paymentBlock },
            { width: '*', stack: [infoBox] }
          ],
          columnGap: 25,
          margin: [0, 0, 0, 24],
          unbreakable: true
        },

        // Remerciement + signature
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'Merci pour votre confiance !', fontSize: 10.5, bold: true, color: c.navy, margin: [0, 0, 0, 3] },
                { text: `L'équipe ${etablissement?.libelle || ''}`.trim(), fontSize: 8.5, italics: true, color: c.navy }
              ]
            },
            {
              width: 170,
              stack: [
                { text: 'Signature / Cachet', fontSize: 8, color: c.muted, alignment: 'center', margin: [0, 0, 0, 34] },
                { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 150, y2: 0, lineWidth: 0.6, lineColor: c.muted }] }
              ]
            }
          ],
          unbreakable: true
        }
      ],

      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 0, 40, 0],
        stack: [
          {
            columns: [
              { text: 'Document généré avec Scoolli · scoolli.com', fontSize: 7, color: c.navy, alignment: 'left' },
              { text: `Page ${currentPage} / ${pageCount}`, fontSize: 7, color: c.navy, alignment: 'right' }
            ],
            margin: [0, 0, 0, 2]
          },
          {
            text: 'Une solution Wokite Technologies & Innovation',
            fontSize: 6.5, color: c.navy, alignment: 'center'
          }
        ]
      })
    };
  }



  async getDocumentFicheFactureV2(): Promise<any> {

    const facture = this.detailsFacture;

    const lignes = facture?.detailsLigneFactureDTOS ?? [];

    const paiements = facture?.paiements ?? [];

    const etablissement = this.organizationData;

    const eleve = facture?.eleve;

    const organizationLogoBase64 = await this.getOrganizationLogoBase64();
    const logo = organizationLogoBase64 ?? await this.getScoolliLogoBase64();
    const hasOrganizationLogo = !!organizationLogoBase64;
    const montantTotal = Number(facture?.montant || 0);
    const montantPaye = this.getMontantDejaPaye();
    const montantRestant = this.getMontantRestantFacture();
    const remise = Number(facture?.remise || 0);
    const nomEleve = `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim();


    const periode =
      [
        facture?.mois,
        facture?.annee
      ]
        .filter(Boolean)
        .join(' ');

    const formatFcfa = (
      value: number | null | undefined
    ): string => {

      return `${Number(value || 0)
        .toLocaleString('fr-FR')
        .replace(/\u00A0/g, ' ')} FCFA`;
    };


    // ============================================================
    // LOGO / HEADER ÉCOLE
    // ============================================================

    const headerSchool: any[] = [];

    if (logo) {

      headerSchool.push({
        image: logo,
        width: hasOrganizationLogo ? 78 : 90,
        height: hasOrganizationLogo ? undefined : undefined,
        margin: [0, 0, 0, 7]
      });

    }


    headerSchool.push({

      text:
        etablissement?.libelle ||
        'ÉTABLISSEMENT SCOLAIRE',

      fontSize: 12,
      bold: true,
      color: '#173F67',

      margin: [
        0,
        0,
        0,
        3
      ]
    });


    if (etablissement?.adresse) {

      headerSchool.push({

        text: etablissement.adresse,

        fontSize: 7.5,

        color: '#4B6380',

        margin: [
          0,
          0,
          0,
          2
        ]
      });

    }


    if (etablissement?.telephone) {

      headerSchool.push({

        text:
          `Tél. : ${etablissement.telephone}`,

        fontSize: 7.5,

        color: '#4B6380',

        margin: [
          0,
          0,
          0,
          2
        ]
      });

    }


    if (etablissement?.email) {

      headerSchool.push({

        text:
          `Email : ${etablissement.email}`,

        fontSize: 7.5,

        color: '#4B6380',

        margin: [
          0,
          0,
          0,
          2
        ]
      });

    }


    // ============================================================
    // INFORMATIONS FACTURE
    // ============================================================

    const invoiceInfo: any[] = [

      {
        text: 'FACTURE',

        fontSize: 23,

        bold: true,

        color: '#173F67',

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
            width: 95,

            text: 'N° facture',

            fontSize: 8.5,

            bold: true,

            color: '#4B6380'
          },

          {
            width: '*',

            text:
              facture?.numeroFacture || '—',

            fontSize: 8.5,

            color: '#173F67'
          }

        ],

        margin: [
          0,
          0,
          0,
          5
        ]
      },

      {
        columns: [

          {
            width: 95,

            text: "Date d'émission",

            fontSize: 8.5,

            bold: true,

            color: '#4B6380'
          },

          {
            width: '*',

            text: facture?.dateFacture,

            fontSize: 8.5,

            color: '#173F67'
          }

        ],

        margin: [
          0,
          0,
          0,
          5
        ]
      },

      {
        columns: [

          {
            width: 95,

            text: 'Échéance',

            fontSize: 8.5,

            bold: true,

            color: '#4B6380'
          },

          {
            width: '*',

            text: facture?.echeanceDate,

            fontSize: 8.5,

            color: '#173F67',

            bold: true
          }

        ],

        margin: [
          0,
          0,
          0,
          5
        ]
      },

      {
        columns: [

          {
            width: 95,

            text: 'Année scolaire',

            fontSize: 8.5,

            bold: true,

            color: '#4B6380'
          },

          {
            width: '*',

            text:
              facture?.anneeScolaire || '—',

            fontSize: 8.5,

            color: '#173F67',

            bold: true
          }

        ],

        margin: [
          0,
          0,
          0,
          5
        ]
      },

      {
        columns: [

          {
            width: 95,

            text: 'Statut',

            fontSize: 8.5,

            bold: true,

            color: '#4B6380'
          },

          {
            width: '*',

            text:
              facture?.etat || '—',

            fontSize: 8.5,

            color:
              montantRestant > 0
                ? '#B42318'
                : '#027A48',

            bold: true
          }

        ]
      }

    ];


    // ============================================================
    // LIGNES FACTURE
    // ============================================================

    const invoiceRows =
      lignes.map(
        (ligne: DetailsLigneFacture) => {

          const montantInitial =
            Number(
              ligne?.montantInitial || 0
            );

          const montantFinal =
            Number(
              ligne?.montantRemise ??
              ligne?.montantInitial ??
              0
            );

          return [

            {
              text:
                ligne?.typeServiceOffertDTO?.libelle ||
                'Service scolaire',

              fontSize: 8.5,

              color: '#173F67',

              bold: true,

              margin: [
                7,
                8,
                7,
                8
              ]
            },

            {
              text: '1',

              fontSize: 8.5,

              color: '#334E68',

              alignment: 'center',

              margin: [
                7,
                8,
                7,
                8
              ]
            },

            {
              text:
                formatFcfa(montantInitial),

              fontSize: 8.5,

              color: '#334E68',

              alignment: 'right',

              margin: [
                7,
                8,
                7,
                8
              ]
            },

            {
              text:
                formatFcfa(montantFinal),

              fontSize: 8.5,

              color: '#173F67',

              bold: true,

              alignment: 'right',

              margin: [
                7,
                8,
                7,
                8
              ]
            }

          ];

        }
      );


    // ============================================================
    // HISTORIQUE PAIEMENTS
    // ============================================================

    const paymentRows =
      paiements.map(
        (paiement: any) => {

          return [

            {
              text:
                paiement?.numeroRecu || '—',

              fontSize: 7.5,

              color: '#173F67',

              margin: [
                6,
                6,
                6,
                6
              ]
            },

            {
              text:
                paiement?.datePaiement
                  ? this.dateFormat.formatDate(
                    paiement.datePaiement
                  )
                  : '—',

              fontSize: 7.5,

              color: '#4B6380',

              margin: [
                6,
                6,
                6,
                6
              ]
            },

            {
              text:
                paiement?.moyenPaiement || '—',

              fontSize: 7.5,

              color: '#4B6380',

              margin: [
                6,
                6,
                6,
                6
              ]
            },

            {
              text:
                paiement?.numeroRecu || '—',

              fontSize: 7.5,

              color: '#4B6380',

              margin: [
                6,
                6,
                6,
                6
              ]
            },

            {
              text:
                formatFcfa(
                  paiement?.montant
                ),

              fontSize: 7.5,

              bold: true,

              color: '#173F67',

              alignment: 'right',

              margin: [
                6,
                6,
                6,
                6
              ]
            }

          ];

        }
      );


    // ============================================================
    // DOCUMENT
    // ============================================================

    return {

      pageSize: 'A4',

      pageMargins: [
        38,
        34,
        38,
        68
      ],


      content: [

        // ========================================================
        // HEADER
        // ========================================================

        {
          columns: [

            {
              width: '*',

              stack: headerSchool
            },

            {
              width: 210,

              stack: [
                {
                  text:
                    etablissement?.libelle ||
                    'Établissement Scolaire',

                  fontSize: 9,

                  bold: true,

                  color: '#173F67',

                  alignment: 'right',

                  margin: [
                    0,
                    0,
                    0,
                    3
                  ]
                },

                ...(etablissement?.adresse
                  ? [
                    {
                      text:
                        etablissement.adresse,

                      fontSize: 7.5,

                      color: '#4B6380',

                      alignment: 'right',

                      margin: [
                        0,
                        0,
                        0,
                        2
                      ]
                    }
                  ]
                  : []),

                ...(etablissement?.telephone
                  ? [
                    {
                      text:
                        `Tél. : ${etablissement.telephone}`,

                      fontSize: 7.5,

                      color: '#4B6380',

                      alignment: 'right',

                      margin: [
                        0,
                        0,
                        0,
                        2
                      ]
                    }
                  ]
                  : []),

                ...(etablissement?.email
                  ? [
                    {
                      text:
                        `Email : ${etablissement.email}`,

                      fontSize: 7.5,

                      color: '#4B6380',

                      alignment: 'right',

                      margin: [
                        0,
                        0,
                        0,
                        2
                      ]
                    }
                  ]
                  : [])
              ]
            }

          ],

          columnGap: 20,

          margin: [
            0,
            0,
            0,
            15
          ]
        },


        // ========================================================
        // LIGNE BLEUE
        // ========================================================

        {
          canvas: [

            {
              type: 'line',

              x1: 0,

              y1: 0,

              x2: 519,

              y2: 0,

              lineWidth: 1.1,

              lineColor: '#2585C5'
            }

          ],

          margin: [
            0,
            0,
            0,
            22
          ]
        },


        // ========================================================
        // FACTURE + CLIENT
        // ========================================================

        {
          columns: [

            {
              width: '*',

              stack: [

                invoiceInfo

              ]
            },


            {
              width: 205,

              margin: [
                0,
                0,
                0,
                0
              ],

              table: {

                widths: [
                  '*'
                ],

                body: [

                  [

                    {
                      stack: [

                        {
                          text: 'CLIENT',

                          fontSize: 8,

                          bold: true,

                          color: '#173F67',

                          margin: [
                            0,
                            0,
                            0,
                            7
                          ]
                        },

                        {
                          text:
                            nomEleve || '—',

                          fontSize: 10,

                          bold: true,

                          color: '#173F67',

                          margin: [
                            0,
                            0,
                            0,
                            5
                          ]
                        },

                        ...(eleve?.matricule
                          ? [
                            {
                              text:
                                `Matricule : ${eleve.matricule}`,

                              fontSize: 7.5,

                              color: '#4B6380',

                              margin: [
                                0,
                                0,
                                0,
                                3
                              ]
                            }
                          ]
                          : []),

                        ...(eleve?.address
                          ? [
                            {
                              text:
                                eleve.address,

                              fontSize: 7.5,

                              color: '#4B6380',

                              margin: [
                                0,
                                0,
                                0,
                                3
                              ]
                            }
                          ]
                          : []),

                        ...(eleve?.lieuNaissance
                          ? [
                            {
                              text:
                                `${eleve.lieuNaissance}${eleve?.nationalite
                                  ? ` · ${eleve.nationalite}`
                                  : ''
                                }`,

                              fontSize: 7.5,

                              color: '#4B6380'
                            }
                          ]
                          : [])

                      ],

                      fillColor: '#EEF6FC',

                      margin: [
                        12,
                        12,
                        12,
                        12
                      ],

                      border: [
                        false,
                        false,
                        false,
                        false
                      ]
                    }

                  ]

                ]

              },

              layout: {

                hLineWidth: () => 0,

                vLineWidth: () => 0,

                paddingLeft: () => 0,

                paddingRight: () => 0,

                paddingTop: () => 0,

                paddingBottom: () => 0
              }

            }

          ],

          columnGap: 25,

          margin: [
            0,
            0,
            0,
            22
          ]
        },


        // ========================================================
        // PÉRIODE
        // ========================================================

        {
          columns: [

            {
              width: '*',

              stack: [

                {
                  text:
                    'PÉRIODE DE FACTURATION',

                  fontSize: 7.5,

                  bold: true,

                  color: '#4B6380',

                  characterSpacing: 0.4,

                  margin: [
                    0,
                    0,
                    0,
                    5
                  ]
                },

                {
                  text:
                    periode || '—',

                  fontSize: 10,

                  bold: true,

                  color: '#173F67'
                }

              ]
            },

            {
              width: 205,

              stack: [

                {
                  text:
                    'ANNÉE SCOLAIRE',

                  fontSize: 7.5,

                  bold: true,

                  color: '#4B6380',

                  alignment: 'right',

                  margin: [
                    0,
                    0,
                    0,
                    5
                  ]
                },

                {
                  text:
                    facture?.anneeScolaire || '—',

                  fontSize: 10,

                  bold: true,

                  color: '#173F67',

                  alignment: 'right'
                }

              ]
            }

          ],

          margin: [
            0,
            0,
            0,
            18
          ]
        },


        // ========================================================
        // DÉTAIL
        // ========================================================

        {
          text:
            'DÉTAIL DE LA FACTURATION',

          fontSize: 8,

          bold: true,

          color: '#173F67',

          characterSpacing: 0.5,

          margin: [
            0,
            0,
            0,
            7
          ]
        },


        {
          table: {

            headerRows: 1,

            widths: [
              '*',
              60,
              85,
              90
            ],

            body: [

              [

                {
                  text: 'Description',

                  fontSize: 8,

                  bold: true,

                  color: '#FFFFFF',

                  fillColor: '#173F67',

                  margin: [
                    8,
                    7,
                    8,
                    7
                  ]
                },

                {
                  text: 'Qté',

                  fontSize: 8,

                  bold: true,

                  color: '#FFFFFF',

                  fillColor: '#173F67',

                  alignment: 'center',

                  margin: [
                    8,
                    7,
                    8,
                    7
                  ]
                },

                {
                  text: 'Prix unitaire',

                  fontSize: 8,

                  bold: true,

                  color: '#FFFFFF',

                  fillColor: '#173F67',

                  alignment: 'right',

                  margin: [
                    8,
                    7,
                    8,
                    7
                  ]
                },

                {
                  text: 'Montant',

                  fontSize: 8,

                  bold: true,

                  color: '#FFFFFF',

                  fillColor: '#173F67',

                  alignment: 'right',

                  margin: [
                    8,
                    7,
                    8,
                    7
                  ]
                }

              ],

              ...invoiceRows

            ]

          },

          layout: {

            hLineWidth: () => 0.5,

            vLineWidth: () => 0.5,

            hLineColor: () => '#C9D9E8',

            vLineColor: () => '#C9D9E8',

            paddingLeft: () => 0,

            paddingRight: () => 0,

            paddingTop: () => 0,

            paddingBottom: () => 0
          },

          margin: [
            0,
            0,
            0,
            18
          ]
        },


        // ========================================================
        // TOTAUX
        // ========================================================

        {
          columns: [

            {
              width: '*',

              stack: [

                {
                  text:
                    'INFORMATIONS DE FACTURATION',

                  fontSize: 7.5,

                  bold: true,

                  color: '#173F67',

                  margin: [
                    0,
                    0,
                    0,
                    7
                  ]
                },

                {
                  text:
                    facture?.echeanceDate
                      ? `Date d'échéance : ${facture.echeanceDate}`
                      : 'Date d’échéance non renseignée',

                  fontSize: 8,

                  color: '#4B6380',

                  margin: [
                    0,
                    0,
                    0,
                    4
                  ]
                },

                {
                  text:
                    `Année scolaire : ${facture?.anneeScolaire || '—'
                    }`,

                  fontSize: 8,

                  color: '#4B6380',

                  margin: [
                    0,
                    0,
                    0,
                    4
                  ]
                },

                {
                  text:
                    `Période : ${periode || '—'}`,

                  fontSize: 8,

                  color: '#4B6380'
                }

              ],

              margin: [
                0,
                4,
                20,
                0
              ]
            },


            {
              width: 225,

              stack: [

                {
                  columns: [

                    {
                      text: 'Sous-total',

                      fontSize: 8.5,

                      color: '#173F67'
                    },

                    {
                      text:
                        formatFcfa(
                          montantTotal
                        ),

                      fontSize: 8.5,

                      color: '#173F67',

                      alignment: 'right'
                    }

                  ],

                  margin: [
                    10,
                    8,
                    10,
                    6
                  ]
                },


                ...(remise > 0
                  ? [
                    {
                      columns: [

                        {
                          text:
                            `Remise (${remise}%)`,

                          fontSize: 8.5,

                          color: '#4B6380'
                        },

                        {
                          text:
                            `- ${formatFcfa(
                              Number(
                                facture?.remise || 0
                              )
                            )}`,

                          fontSize: 8.5,

                          color: '#4B6380',

                          alignment: 'right'
                        }

                      ],

                      margin: [
                        10,
                        0,
                        10,
                        6
                      ]
                    }
                  ]
                  : []),


                {
                  columns: [

                    {
                      text:
                        'TOTAL À PAYER',

                      fontSize: 9,

                      bold: true,

                      color: '#FFFFFF'
                    },

                    {
                      text:
                        formatFcfa(
                          montantTotal
                        ),

                      fontSize: 11,

                      bold: true,

                      color: '#FFFFFF',

                      alignment: 'right'
                    }

                  ],

                  fillColor: '#173F67',

                  margin: [
                    10,
                    8,
                    10,
                    8
                  ]
                },


                {
                  columns: [

                    {
                      text:
                        'Déjà payé',

                      fontSize: 8,

                      color: '#4B6380'
                    },

                    {
                      text:
                        formatFcfa(
                          montantPaye
                        ),

                      fontSize: 8,

                      color: '#173F67',

                      alignment: 'right'
                    }

                  ],

                  margin: [
                    10,
                    7,
                    10,
                    5
                  ]
                },


                {
                  columns: [

                    {
                      text:
                        'RESTE À PAYER',

                      fontSize: 8.5,

                      bold: true,

                      color:
                        montantRestant > 0
                          ? '#B42318'
                          : '#027A48'
                    },

                    {
                      text:
                        formatFcfa(
                          montantRestant
                        ),

                      fontSize: 9,

                      bold: true,

                      color:
                        montantRestant > 0
                          ? '#B42318'
                          : '#027A48',

                      alignment: 'right'
                    }

                  ],

                  margin: [
                    10,
                    0,
                    10,
                    8
                  ]
                }

              ],

              fillColor: '#EEF6FC'
            }

          ],

          columnGap: 20,

          margin: [
            0,
            0,
            0,
            18
          ]
        },


        // ========================================================
        // PAIEMENTS
        // ========================================================

        ...(paiements.length > 0
          ? [

            {
              columns: [

                {

                  width: '*',

                  stack: [

                    {
                      text:
                        'HISTORIQUE DES PAIEMENTS',

                      fontSize: 7.5,

                      bold: true,

                      color: '#173F67',

                      characterSpacing: 0.4,

                      margin: [
                        0,
                        0,
                        0,
                        7
                      ]
                    },

                    {
                      table: {

                        headerRows: 1,

                        widths: [
                          70,
                          65,
                          '*',
                          85
                        ],

                        body: [

                          [

                            {
                              text: 'N° REÇU',

                              fontSize: 7,

                              bold: true,

                              color: '#FFFFFF',

                              fillColor: '#173F67',

                              margin: [
                                6,
                                5,
                                6,
                                5
                              ]
                            },

                            {
                              text: 'DATE',

                              fontSize: 7,

                              bold: true,

                              color: '#FFFFFF',

                              fillColor: '#173F67',

                              margin: [
                                6,
                                5,
                                6,
                                5
                              ]
                            },

                            {
                              text: 'MOYEN',

                              fontSize: 7,

                              bold: true,

                              color: '#FFFFFF',

                              fillColor: '#173F67',

                              margin: [
                                6,
                                5,
                                6,
                                5
                              ]
                            },

                            {
                              text: 'MONTANT',

                              fontSize: 7,

                              bold: true,

                              color: '#FFFFFF',

                              fillColor: '#173F67',

                              alignment: 'right',

                              margin: [
                                6,
                                5,
                                6,
                                5
                              ]
                            }

                          ],

                          ...paymentRows.map(
                            (row: any[]) => [

                              row[0],
                              row[1],
                              row[2],
                              row[4]

                            ]
                          )

                        ]

                      },

                      layout: {

                        hLineWidth: () => 0.4,

                        vLineWidth: () => 0.4,

                        hLineColor: () => '#C9D9E8',

                        vLineColor: () => '#C9D9E8',

                        paddingLeft: () => 0,

                        paddingRight: () => 0,

                        paddingTop: () => 0,

                        paddingBottom: () => 0
                      }

                    }

                  ]

                }

              ],

              margin: [
                0,
                0,
                0,
                20
              ]
            }

          ]

          : []),


        // ========================================================
        // MESSAGE
        // ========================================================

        {
          columns: [

            {
              width: '*',

              stack: [

                {
                  text:
                    'Merci pour votre confiance !',

                  fontSize: 9,

                  bold: true,

                  color: '#173F67',

                  margin: [
                    0,
                    0,
                    0,
                    4
                  ]
                },

                {
                  text:
                    etablissement?.libelle
                      ? `L’équipe ${etablissement.libelle}`
                      : 'L’équipe de l’établissement',

                  fontSize: 8,

                  italics: true,

                  color: '#4B6380'
                }

              ]
            },


            {
              width: 210,

              table: {

                widths: [
                  '*'
                ],

                body: [

                  [

                    {
                      stack: [

                        {
                          text:
                            'Informations complémentaires',

                          fontSize: 8,

                          bold: true,

                          color: '#173F67',

                          margin: [
                            0,
                            0,
                            0,
                            5
                          ]
                        },

                        {
                          text:
                            `Cette facture concerne la période ${periode || 'scolaire'
                            } et l’année scolaire ${facture?.anneeScolaire || '—'
                            }.`,

                          fontSize: 7.5,

                          color: '#4B6380',

                          lineHeight: 1.25
                        }

                      ],

                      fillColor: '#EEF6FC',

                      margin: [
                        10,
                        9,
                        10,
                        9
                      ]
                    }

                  ]

                ]

              },

              layout: {

                hLineWidth: () => 0,

                vLineWidth: () => 0,

                paddingLeft: () => 0,

                paddingRight: () => 0,

                paddingTop: () => 0,

                paddingBottom: () => 0
              }

            }

          ],

          columnGap: 25,

          margin: [
            0,
            0,
            0,
            18
          ]
        }

      ],


      // ============================================================
      // FOOTER
      // ============================================================

      footer: (
        currentPage: number,
        pageCount: number
      ) => {

        return {

          margin: [
            38,
            0,
            38,
            0
          ],

          stack: [

            {
              svg: `
              <svg width="519" height="55" viewBox="0 0 519 55"
                   xmlns="http://www.w3.org/2000/svg">

                <path
                  d="M0 16
                     C110 48 205 48 300 30
                     C390 13 455 10 519 0
                     L519 55
                     L0 55 Z"
                  fill="#2585C5"/>

                <path
                  d="M0 28
                     C105 55 215 55 310 38
                     C405 21 465 17 519 8
                     L519 55
                     L0 55 Z"
                  fill="#173F67"/>

              </svg>
            `,

              width: 519,

              height: 55,

              margin: [
                0,
                0,
                0,
                -1
              ]
            },


            {
              columns: [

                {
                  text:
                    'Document généré avec Scoolli · scoolli.com',

                  fontSize: 6.5,

                  color: '#98A2B3',

                  alignment: 'left'
                },

                {
                  text:
                    `Page ${currentPage} / ${pageCount}`,

                  fontSize: 6.5,

                  color: '#98A2B3',

                  alignment: 'right'
                }

              ],

              margin: [
                0,
                5,
                0,
                0
              ]
            },


            {
              text:
                'Une solution Wokite Technologies & Innovation',

              fontSize: 6,

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

  async getDocumentFicheFactureV11(): Promise<any> {

    const facture = this.detailsFacture;

    const lignes = facture?.detailsLigneFactureDTOS ?? [];

    const paiements = facture?.paiements ?? [];

    const etablissement = this.organizationData;

    const eleve = facture?.eleve;

    const organizationLogoBase64 = await this.getOrganizationLogoBase64();

    const logo = organizationLogoBase64 ?? await this.getScoolliLogoBase64();

    const hasOrganizationLogo = !!organizationLogoBase64;

    const montantTotal = Number(facture?.montant || 0);
    const montantPaye = this.getMontantDejaPaye();
    const montantRestant = this.getMontantRestantFacture();

    const remise = Number(facture?.remise || 0);

    const headerLeft: any[] = [];

    if (logo) {
      headerLeft.push({
        image: logo,
        width: hasOrganizationLogo ? 72 : 88,
        margin: [0, 0, 0, 8]
      });
    }
    headerLeft.push({
      text: etablissement?.libelle || 'ÉTABLISSEMENT SCOLAIRE',
      fontSize: 14,
      bold: true,
      color: '#172033',
      margin: [0, 0, 0, 4]
    });
    if (etablissement?.adresse) {
      headerLeft.push({
        text: etablissement.adresse,
        fontSize: 8.5,
        color: '#667085',
        margin: [0, 0, 0, 2]
      });
    }
    if (etablissement?.telephone) {
      headerLeft.push({
        text: `Tél. : ${etablissement.telephone}`,
        fontSize: 8.5,
        color: '#667085',
        margin: [0, 0, 0, 2]
      });
    }
    if (etablissement?.email) {
      headerLeft.push({
        text: etablissement.email,
        fontSize: 8.5,
        color: '#667085',
        margin: [0, 0, 0, 2]
      });
    }

    const headerRight: any[] = [
      {
        text: 'FACTURE',
        fontSize: 22,
        bold: true,
        color: '#172033',
        alignment: 'right',
        margin: [0, 0, 0, 8]
      },
      {
        text: facture?.numeroFacture ? `N° ${facture.numeroFacture}` : '',
        fontSize: 9,
        color: '#667085',
        alignment: 'right',
        margin: [0, 0, 0, 4]
      },

      {
        text: facture?.dateFacture ? `Émise le ${facture.dateFacture}` : '',
        fontSize: 9,
        color: '#667085',
        alignment: 'right',
        margin: [0, 0, 0, 8]
      },

      {
        text: facture?.etat || '',
        fontSize: 8,
        bold: true,
        color: '#344054',
        alignment: 'right'
      }
    ];

    const nomEleve = `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim();

    const periode = [facture?.mois, facture?.annee].filter(Boolean).join(' ');

    const invoiceRows = lignes.map(
      (ligne: DetailsLigneFacture) => {

        const montant = Number(ligne.montantRemise ?? ligne.montantInitial ?? 0);

        return [
          {
            text: ligne.typeServiceOffertDTO?.libelle || 'Service scolaire',
            fontSize: 9,
            color: '#344054',
            margin: [0, 8, 0, 8]
          },
          {
            text: ligne.typeServiceOffertDTO?.libelle || '—',
            fontSize: 8,
            color: '#667085',
            alignment: 'center',
            margin: [0, 8, 0, 8]
          },
          {
            text: this.formatMontant(montant),
            fontSize: 9,
            color: '#172033',
            alignment: 'right',
            margin: [0, 8, 0, 8]
          }
        ];
      }
    );

    const paymentRows = paiements.map(
      (paiement: any) => [
        {
          text: paiement.numeroRecu || '—',
          fontSize: 8,
          color: '#344054',
          margin: [0, 6, 0, 6]
        },
        {
          text: paiement.datePaiement ? this.dateFormat.formatDate(paiement.datePaiement) : '—',
          fontSize: 8,
          color: '#667085',
          margin: [0, 6, 0, 6]
        },
        {
          text: paiement.moyenPaiement || '—',
          fontSize: 8,
          color: '#344054',
          margin: [0, 6, 0, 6]
        },
        {
          text: paiement.reference || '—',
          fontSize: 8,
          color: '#667085',
          margin: [0, 6, 0, 6]
        },
        {
          text: this.formatMontant(paiement.montant),
          fontSize: 8,
          color: '#172033',
          bold: true,
          alignment: 'right',
          margin: [0, 6, 0, 6]
        }
      ]
    );
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
          margin: [0, 0, 0, 20]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 510,
              y2: 0,
              lineWidth: 0.6,
              lineColor: '#E4E7EC'
            }
          ],
          margin: [0, 0, 0, 18]
        },

        {
          columns: [
            {
              width: '*',

              stack: [
                {
                  text: 'FACTURÉ À',
                  fontSize: 8,
                  bold: true,
                  color: '#98A2B3',
                  characterSpacing: 0.5,
                  margin: [0, 0, 0, 6]
                },

                {
                  text: nomEleve || '—',
                  fontSize: 12,
                  bold: true,
                  color: '#172033',
                  margin: [0, 0, 0, 5]
                },

                ...(eleve?.matricule
                  ? [
                    {
                      text: `Matricule : ${eleve.matricule}`,
                      fontSize: 8.5,
                      color: '#667085',
                      margin: [0, 0, 0, 3]
                    }
                  ]
                  : []),

                ...(eleve?.dateNaissance
                  ? [
                    {
                      text: `Né(e) le : ${this.dateFormat.formatDate(eleve.dateNaissance)}`,

                      fontSize: 8.5,
                      color: '#667085',
                      margin: [0, 0, 0, 3]
                    }
                  ]
                  : [])
              ]
            },

            {
              width: 190,

              stack: [

                {
                  text: 'PÉRIODE DE FACTURATION',
                  fontSize: 8,
                  bold: true,
                  color: '#98A2B3',
                  characterSpacing: 0.5,
                  alignment: 'right',
                  margin: [0, 0, 0, 6]
                },

                {
                  text: periode || '—',
                  fontSize: 11,
                  bold: true,
                  color: '#172033',
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },

                {
                  text: facture?.numeroFacture || '',
                  fontSize: 8.5,
                  color: '#667085',
                  alignment: 'right'
                }
              ]
            }
          ],

          margin: [0, 0, 0, 22]
        },

        {
          text: 'DÉTAIL DE LA FACTURATION',
          fontSize: 8,
          bold: true,
          color: '#98A2B3',
          characterSpacing: 0.5,
          margin: [0, 0, 0, 8]
        },

        {
          table: {
            widths: ['*', 100, 105],
            headerRows: 1,

            body: [
              [

                {
                  text: 'SERVICE',
                  fontSize: 8,
                  bold: true,
                  color: '#667085',
                  fillColor: '#F8F9FB',
                  margin: [0, 7, 0, 7]
                },

                {
                  text: 'LIBELLE',
                  fontSize: 8,
                  bold: true,
                  color: '#667085',
                  fillColor: '#F8F9FB',
                  alignment: 'center',
                  margin: [0, 7, 0, 7]
                },

                {
                  text: 'MONTANT',
                  fontSize: 8,
                  bold: true,
                  color: '#667085',
                  fillColor: '#F8F9FB',
                  alignment: 'right',
                  margin: [0, 7, 0, 7]
                }
              ],

              ...invoiceRows
            ]
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
                return 0.6;
              }

              return 0.4;
            },

            vLineWidth: () => 0,

            hLineColor: () => '#EAECF0',

            paddingLeft: () => 0,

            paddingRight: () => 0,

            paddingTop: () => 0,

            paddingBottom: () => 0
          },

          margin: [
            0,
            0,
            0,
            18
          ]
        },

        {
          columns: [

            {
              width: '*',
              text: ''
            },

            {
              width: 230,

              stack: [

                {
                  columns: [

                    {
                      text: 'Sous-total',
                      fontSize: 8.5,
                      color: '#667085'
                    },

                    {
                      text:
                        this.formatMontant(
                          this.getTotalMontantFacture()
                            ? Number(
                              String(
                                this.getTotalMontantFacture()
                              ).replace(
                                /[^0-9.-]/g,
                                ''
                              )
                            )
                            : 0
                        ),

                      fontSize: 8.5,
                      color: '#344054',
                      alignment: 'right'
                    }
                  ],

                  margin: [0, 0, 0, 7]
                },

                ...(remise > 0
                  ? [
                    {
                      columns: [

                        {
                          text: `Remise (${remise}%)`,

                          fontSize: 8.5,
                          color: '#667085'
                        },

                        {
                          text: `- ${this.formatMontant(
                            Number(
                              facture?.remise ||
                              0
                            )
                          )}`,

                          fontSize: 8.5,
                          color: '#667085',
                          alignment: 'right'
                        }
                      ],

                      margin: [0, 0, 0, 7]
                    }
                  ]
                  : []),

                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: 230,
                      y2: 0,
                      lineWidth: 0.6,
                      lineColor: '#D0D5DD'
                    }
                  ],

                  margin: [
                    0,
                    2,
                    0,
                    8
                  ]
                },

                {
                  columns: [

                    {
                      text: 'TOTAL À PAYER',
                      fontSize: 9,
                      bold: true,
                      color: '#172033'
                    },

                    {
                      text: this.formatMontant(montantTotal),
                      fontSize: 12,
                      bold: true,
                      color: '#172033',
                      alignment: 'right'
                    }
                  ],
                  margin: [0, 0, 0, 8]
                },

                {
                  columns: [
                    {
                      text: 'Déjà payé',
                      fontSize: 8.5,
                      color: '#667085'
                    },

                    {
                      text: this.formatMontant(montantPaye),
                      fontSize: 8.5,
                      color: '#344054',
                      alignment: 'right'
                    }
                  ],

                  margin: [
                    0,
                    0,
                    0,
                    6
                  ]
                },

                {
                  columns: [

                    {
                      text: 'RESTE À PAYER',
                      fontSize: 9,
                      bold: true,
                      color: montantRestant > 0
                        ? '#B42318'
                        : '#027A48'
                    },

                    {
                      text: this.formatMontant(montantRestant),
                      fontSize: 10,
                      bold: true,
                      color: montantRestant > 0
                        ? '#B42318'
                        : '#027A48',

                      alignment: 'right'
                    }
                  ]
                }
              ]
            }
          ],

          margin: [
            0,
            0,
            0,
            24
          ]
        },

        ...(paiements.length > 0
          ? [

            {
              text: 'HISTORIQUE DES PAIEMENTS',
              fontSize: 8,
              bold: true,
              color: '#98A2B3',
              characterSpacing: 0.5,
              margin: [0, 0, 0, 8]
            },

            {
              table: {

                widths: [
                  70,
                  75,
                  '*',
                  '*',
                  90
                ],

                headerRows: 1,

                body: [

                  [

                    {
                      text: 'N° REÇU',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'DATE',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'MOYEN',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'RÉFÉRENCE',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'MONTANT',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB',
                      alignment: 'right'
                    }
                  ],

                  ...paymentRows
                ]
              },

              layout: {

                hLineWidth: () => 0.4,

                vLineWidth: () => 0,

                hLineColor: () =>
                  '#EAECF0',

                paddingLeft: () => 0,

                paddingRight: () => 0,

                paddingTop: () => 6,

                paddingBottom: () => 6
              },

              margin: [
                0,
                0,
                0,
                30
              ]
            }
          ]
          : []),

        {
          columns: [

            {
              width: '*',
              text: ''
            },

            {
              width: 170,

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
                      x2: 150,
                      y2: 0,
                      lineWidth: 0.6,
                      lineColor: '#98A2B3'
                    }
                  ]
                }
              ]
            }
          ],

          margin: [
            0,
            0,
            0,
            10
          ]
        }
      ],

      footer: (
        currentPage: number,
        pageCount: number
      ) => {

        return {

          margin: [
            42,
            10,
            42,
            0
          ],

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


  goBack(): void {
    this.router.navigate(['admin/comptabilite/facture']);
  }
}