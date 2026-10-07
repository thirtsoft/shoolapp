import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { RhResourceService } from '../../../services/rh-resource-service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { OrganizationMiniResponse } from '../../../../../core/models/onboarding/organization/organization-mini-response';
import { DetailsPaieResponse } from '../../../../../core/models/rh/details-paie-response.model';
import { ConfigOrganizationService } from '../../../../administration/configorganization/services/configorganization.service';
import { ComptabiliteResourceService } from '../../../../comptabilite/services/comptabilite-resource.service';

declare const pdfMake: any;

@Component({
  selector: 'app-details-paie-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './details-paie-component.html',
  styleUrl: './details-paie-component.css',
})
export class DetailsPaieComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rhResourceService = inject(RhResourceService);
  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);

  title = 'Détails de la paie';

  paie: DetailsPaieResponse | null = null;

  paieUuid: string | null = null;

  isLoading = false;

  paiementForm!: FormGroup;

  moyenPayementList: any[] = [];

  showPaiementModal = false;

  isSavingPaiement = false;

  logoUrl = '';


  logoPreview: string | null = null;

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  ngOnInit(): void {
    this.initPaiementForm();
    this.getMoyenPaiementList();
    this.loadOrganizationInfos();
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (!uuid) {
      this.toastService.error(
        'Paie introuvable',
        'Aucun identifiant de paie n’a été fourni.'
      );
      this.goBack();
      return;
    }
    this.paieUuid = uuid;
    this.chargerDetailsPaie(uuid);
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

  private chargerDetailsPaie(uuid: string): void {
    this.isLoading = true;
    this.rhResourceService.getDetailsPaie(uuid)
      .subscribe({
        next: (response: any) => {
          this.paie = response;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors du chargement des détails de la paie :', error);

          this.toastService.error(
            'Erreur',
            'Impossible de charger les détails de la paie.'
          );

          this.goBack();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/rh/paies']);
  }

  getNumeroPaie(): string {
    if (!this.paie) {
      return 'Non renseigné';
    }
    return this.paie.numeroPaie || 'Non renseigné';
  }

  getPeriodePaie(): string {
    if (!this.paie) {
      return 'Non renseignée';
    }
    const mois = this.paie.mois || '';
    const annee = this.paie.annee || '';
    if (!mois && !annee) {
      return 'Non renseignée';
    }
    if (!mois) {
      return String(annee);
    }
    if (!annee) {
      return String(mois);
    }
    return `${mois} / ${annee}`;
  }

  getTypeRemuneration(): string {
    if (!this.paie) {
      return 'Non renseigné';
    }

    const modeRemuneration = this.paie.contratPaieResponse?.modeRemuneration;

    if (modeRemuneration === 'HORAIRE') {
      return 'Rémunération horaire';
    }

    if (modeRemuneration === 'MENSUEL') {
      return 'Rémunération mensuelle';
    }

    return this.paie.type || 'Non renseigné';
  }

  isPaiePayee(): boolean {
    return this.normaliserEtat(this.paie?.etatLibelle) === 'PAYEE';
  }

  isPaiePartiellementPayee(): boolean {
    return this.normaliserEtat(this.paie?.etatLibelle) === 'PAYEE_PARTIELLE';
  }

  isPaieEnCours(): boolean {
    return this.normaliserEtat(this.paie?.etatLibelle) === 'EN_COURS';
  }

  normaliserEtat(value: string | null | undefined): string {
    return (value || '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  }

  getPersonnelFullName(): string {
    const personnel = this.paie?.personnelResponse;
    if (!personnel) {
      return 'Non renseigné';
    }

    const firstName = personnel.firstName?.trim() || '';
    const lastName = personnel.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Non renseigné';
  }

  formatMontant(value: number | null | undefined): string {
    return `${value?.toString()} FCFA`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return 'Non renseignée';
    }
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);

      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Non renseignée';
    }

    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getMoyenPaiementList(): void {
    this.referentielResource.getResourceList('moyenpaiement')
      ?.subscribe({
        next: (data: any) => {
          this.moyenPayementList = data ?? [];
        },
        error: (error) => {
          console.error('Erreur lors du chargement des moyens de paiement :', error);
          this.toastService.error(
            'Erreur',
            'Impossible de charger les moyens de paiement.'
          );
        }
      });
  }

  private initPaiementForm(): void {
    this.paiementForm = this.formBuilder.group({
      moyenPaiement: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      reference: ['']
    });
  }

  getMontantNetPaie(): number {
    return Number(this.paie?.netAPayer || 0);
  }

  getMontantDejaPaye(): number {
    return Number(this.paie?.montantDejaPaye || 0);
  }

  getMontantRestantPaie(): number {
    return Number(this.paie?.montantRestantAPayer || 0);
  }

  peutEnregistrerPaiement(): boolean {
    const etat = this.normaliserEtat(this.paie?.etatLibelle);
    return !!this.paie &&
      (etat === 'EN_COURS' || etat === 'PAYEE_PARTIELLE') &&
      this.getMontantRestantPaie() > 0;
  }


  /*   isMontantValide(): boolean {
      const montant = Number(this.paiementForm?.get('montant')?.value || 0);
      const restant = this.getMontantRestantPaie();
      return (montant > 0 && montant <= restant);
    } */

  isMontantValide(): boolean {
    const montant = Number(
      this.paiementForm?.get('montant')?.value || 0
    );

    const restant = this.getMontantRestantPaie();

    return montant > 0 && restant > 0 && montant <= restant;
  }

  openPaiementModal(): void {
    if (!this.paieUuid) {
      this.toastService.error('Erreur', 'Identifiant de paie introuvable.');
      return;
    }

    if (!this.peutEnregistrerPaiement()) {
      this.toastService.warning('Paiement impossible', 'Cette paie ne peut plus recevoir de paiement.');

      return;
    }

    this.paiementForm.reset({
      moyenPaiement: '',
      montant: '',
      reference: ''
    });

    this.showPaiementModal = true;
  }

  closePaiementModal(): void {

    if (this.isSavingPaiement) {
      return;
    }

    this.showPaiementModal = false;

    this.paiementForm.reset({
      moyenPaiement: '',
      montant: '',
      reference: ''
    });
  }

  enregistrerUnPaiement(): void {

    if (!this.paieUuid) {

      this.toastService.error(
        'Erreur',
        'Identifiant de paie introuvable.'
      );

      return;
    }

    if (this.paiementForm.invalid) {

      this.paiementForm.markAllAsTouched();

      this.toastService.warning(
        'Attention',
        'Veuillez renseigner les informations obligatoires.'
      );

      return;
    }

    const montant = Number(this.paiementForm.get('montant')?.value || 0);

    const montantRestant = this.getMontantRestantPaie();

    if (montant <= 0) {
      this.toastService.warning(
        'Attention',
        'Veuillez saisir un montant valide.'
      );
      return;
    }

    if (montant > montantRestant) {

      this.toastService.warning(
        'Attention',
        `Le montant ne peut pas dépasser le reste à payer de ${this.formatMontant(montantRestant)
        } FCFA.`
      );
      return;
    }

    const moyenPaiement = this.paiementForm.get('moyenPaiement')?.value;
    if (!moyenPaiement) {
      this.toastService.warning(
        'Attention',
        'Veuillez sélectionner un moyen de paiement.'
      );
      return;
    }

    const reference = this.paiementForm.get('reference')?.value?.trim() || null;

    const payload = {

      typePaiement: 'SALAIRE',

      paie: this.paieUuid,

      montant: montant,

      moyenPaiement: moyenPaiement,

      reference: reference
    };

    this.isSavingPaiement = true;

    this.comptabiliteResource
      .creerUneRessource(
        'payement',
        payload
      )
      .subscribe({

        next: (data: any) => {

          this.isSavingPaiement = false;

          if (data?.statut === 'OK') {

            this.toastService.success(
              'Succès',
              'Le paiement du salaire a été enregistré avec succès.'
            );

            this.closePaiementModal();

            this.chargerDetailsPaie(
              this.paieUuid!
            );

          } else {

            this.toastService.error(
              'Erreur',
              data?.message ||
              'Erreur lors de l’enregistrement du paiement.'
            );
          }
        },

        error: (error) => {

          this.isSavingPaiement = false;

          console.error(
            'Erreur paiement salaire :',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ||
            'Erreur lors de l’enregistrement du paiement.'
          );
        }
      });
  }

  /* =========================================================
   * UTILITAIRE MOYEN DE PAIEMENT
   * ========================================================= */

  getMoyenPaiementLabel(
    moyenPaiement: any
  ): string {

    if (!moyenPaiement) {
      return 'Moyen de paiement';
    }

    return (
      moyenPaiement.libelle ||
      moyenPaiement.label ||
      moyenPaiement.nom ||
      moyenPaiement.code ||
      'Moyen de paiement'
    );
  }

  async imprimerPaie(): Promise<void> {
    if (!this.paie) {
      this.toastService.warning(
        'Attention',
        'Les informations de la paie ne sont pas disponibles.'
      );
      return;
    }

    try {
      const document = await this.getDocumentFichePaie();
      pdfMake.createPdf(document).print();
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin de paie :', error);

      this.toastService.error(
        'Erreur',
        'Impossible de générer le bulletin de paie.'
      );
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.paie) {
      this.toastService.warning(
        'Attention',
        'Les informations de la paie ne sont pas disponibles.'
      );
      return;
    }

    try {
      const document = await this.getDocumentFichePaie();

      const numeroPaie =
        this.paie.numeroPaie?.trim() || 'bulletin-paie';

      pdfMake
        .createPdf(document)
        .download(`${numeroPaie}.pdf`);

    } catch (error) {
      console.error('Erreur lors du téléchargement du bulletin de paie :', error);

      this.toastService.error(
        'Erreur',
        'Impossible de générer le bulletin de paie.'
      );
    }
  }

  async getDocumentFichePaie(): Promise<any> {
    if (!this.paie) {
      throw new Error('Les informations de la paie sont indisponibles.');
    }

    const p = this.paie;

    const organisationLogo = await this.getOrganizationLogoBase64();
    const scoolliLogo = organisationLogo
      ? null
      : await this.getScoolliLogoBase64();

    const personnel = p.personnelResponse;
    const contrat = p.contratPaieResponse;
    const demandeAvance = p.demandeAvanceSalairePaieResponse;

    const paiements = Array.isArray(p.paiementsPaieResponses)
      ? p.paiementsPaieResponses
      : [];

    /*
     * ================================================================
     * COULEURS - CHARTE SCOOLLI
     * ================================================================
     */
    const pdfColors = {
      primary: '#2c5282',
      primaryDark: '#1e3a5f',
      primaryLight: '#ebf4ff',
      blueSoft: '#f4f8fc',
      text: '#1f2937',
      textLight: '#64748b',
      border: '#d8e1eb',
      white: '#ffffff',
      success: '#166534',
      successLight: '#ecfdf5',
      warning: '#92400e',
      warningLight: '#fffbeb'
    };

    /*
     * ================================================================
     * HELPERS
     * ================================================================
     */

    const normaliserEtatPdf = (
      value: string | null | undefined
    ): string => {
      return (value || '')
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
    };

    const montant = (value: number | null | undefined): string => {
      return `${this.formatMontant(value)} FCFA`;
    };

    /*
     * ================================================================
     * DONNEES GENERALES
     * ================================================================
     */

    const etatPaie = normaliserEtatPdf(p.etatLibelle);

    /*
     * On utilise l'état technique plutôt que le libellé
     * "Payée", "Payée partielle", etc.
     */
    const etatPaieAffichage =
      etatPaie || 'NON_RENSEIGNE';

    const personnelNom = [
      personnel?.firstName,
      personnel?.lastName
    ]
      .filter(value => !!value?.trim())
      .join(' ')
      .trim() || 'Non renseigne';

    const numeroPaie =
      p.numeroPaie?.trim() || 'Non renseigne';

    const periode =
      this.getPeriodePaie();

    const montantBrut =
      Number(p.montantBrut || 0);

    const retenues =
      Number(p.retenues || 0);

    const netAPayer =
      Number(p.netAPayer || 0);

    const montantDejaPaye =
      Number(p.montantDejaPaye || 0);

    const montantRestant =
      Number(p.montantRestantAPayer || 0);

    const organisationNom =
      (this.organizationData as any)?.name ||
      (this.organizationData as any)?.nom ||
      (this.organizationData as any)?.raisonSociale ||
      'Etablissement scolaire';

    const organisationAdresse =
      (this.organizationData as any)?.address ||
      (this.organizationData as any)?.adresse ||
      '';

    const organisationTelephone =
      (this.organizationData as any)?.mobile ||
      (this.organizationData as any)?.telephone ||
      (this.organizationData as any)?.phone ||
      '';

    const organisationEmail =
      (this.organizationData as any)?.email ||
      '';

    const organisationNinea =
      (this.organizationData as any)?.ninea ||
      (this.organizationData as any)?.NINEA ||
      '';

    const organisationRccm =
      (this.organizationData as any)?.rccm ||
      (this.organizationData as any)?.RCCM ||
      '';

    const modeRemuneration =
      contrat?.modeRemuneration === 'HORAIRE'
        ? 'HORAIRE'
        : contrat?.modeRemuneration === 'MENSUEL'
          ? 'MENSUEL'
          : contrat?.modeRemuneration || 'NON_RENSEIGNE';

    /*
     * ================================================================
     * COULEUR ETAT
     * ================================================================
     */

    let etatColor = pdfColors.primary;
    let etatBackground = pdfColors.primaryLight;

    if (etatPaie === 'PAYEE') {
      etatColor = pdfColors.success;
      etatBackground = pdfColors.successLight;
    } else if (etatPaie === 'PAYEE_PARTIELLE') {
      etatColor = pdfColors.warning;
      etatBackground = pdfColors.warningLight;
    }

    /*
     * ================================================================
     * LOGO
     * ================================================================
     */

    const logoBlock = organisationLogo
      ? {
        image: organisationLogo,
        width: 58,
        height: 58,
        fit: [58, 58]
      }
      : scoolliLogo
        ? {
          image: scoolliLogo,
          width: 58,
          height: 58,
          fit: [58, 58]
        }
        : {
          text: 'SCOOLLI',
          fontSize: 15,
          bold: true,
          color: pdfColors.primary
        };

    /*
     * ================================================================
     * INFORMATIONS ETABLISSEMENT
     * ================================================================
     */

    const organisationInformations: any[] = [
      {
        text: organisationNom,
        style: 'organisationName'
      }
    ];

    if (organisationAdresse) {
      organisationInformations.push({
        text: organisationAdresse,
        style: 'organisationInfo'
      });
    }

    const contactLine = [
      organisationTelephone
        ? `Tel. : ${organisationTelephone}`
        : '',
      organisationEmail
        ? `Email : ${organisationEmail}`
        : ''
    ]
      .filter(Boolean)
      .join('   |   ');

    if (contactLine) {
      organisationInformations.push({
        text: contactLine,
        style: 'organisationInfo'
      });
    }

    const legalLine = [
      organisationNinea
        ? `NINEA : ${organisationNinea}`
        : '',
      organisationRccm
        ? `RCCM : ${organisationRccm}`
        : ''
    ]
      .filter(Boolean)
      .join('   |   ');

    if (legalLine) {
      organisationInformations.push({
        text: legalLine,
        style: 'organisationInfo'
      });
    }

    /*
     * ================================================================
     * PERSONNEL
     * ================================================================
     */

    const personnelTable = {
      table: {
        widths: ['18%', '32%', '18%', '32%'],
        body: [
          [
            {
              text: 'Nom et prenom',
              style: 'labelCell'
            },
            {
              text: personnelNom,
              style: 'valueCell'
            },
            {
              text: 'Matricule',
              style: 'labelCell'
            },
            {
              text: personnel?.matricule || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'N° CNI',
              style: 'labelCell'
            },
            {
              text: personnel?.cni || 'Non renseigne',
              style: 'valueCell'
            },
            {
              text: 'Statut',
              style: 'labelCell'
            },
            {
              text: personnel?.statut || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'Telephone',
              style: 'labelCell'
            },
            {
              text: personnel?.mobile || 'Non renseigne',
              style: 'valueCell'
            },
            {
              text: 'Email',
              style: 'labelCell'
            },
            {
              text: personnel?.email || 'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'Adresse',
              style: 'labelCell'
            },
            {
              text: personnel?.address || 'Non renseignee',
              style: 'valueCell',
              colSpan: 3
            },
            {},
            {}
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
      }
    };

    /*
     * ================================================================
     * CONTRAT
     * ================================================================
     */

    const contratTable = {
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            {
              text: 'Reference',
              style: 'labelCell'
            },
            {
              text: contrat?.reference || 'Non renseignee',
              style: 'valueCell'
            },
            {
              text: 'Type',
              style: 'labelCell'
            },
            {
              text:
                contrat?.typeContratLibelle ||
                contrat?.typeContratCode ||
                'Non renseigne',
              style: 'valueCell'
            }
          ],
          [
            {
              text: 'Remuneration',
              style: 'labelCell'
            },
            {
              text: modeRemuneration,
              style: 'valueCell'
            },
            {
              text: 'Montant reference',
              style: 'labelCell'
            },
            {
              text: montant(
                contrat?.montantReference
              ),
              style: 'valueCellRight'
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
      }
    };

    /*
     * ================================================================
     * CALCUL DE LA PAIE
     * ================================================================
     */

    const calculRows: any[] = [
      [
        {
          text: 'Element',
          style: 'tableHeader'
        },
        {
          text: 'Montant',
          style: 'tableHeader',
          alignment: 'right'
        }
      ]
    ];

    if (
      contrat?.modeRemuneration === 'HORAIRE' &&
      p.nombreHeures !== null &&
      p.nombreHeures !== undefined
    ) {
      calculRows.push([
        {
          text: 'Nombre d\'heures',
          style: 'tableCell'
        },
        {
          text: String(p.nombreHeures),
          style: 'tableCellRight'
        }
      ]);

      calculRows.push([
        {
          text: 'Tarif horaire',
          style: 'tableCell'
        },
        {
          text: montant(p.tarifHoraire),
          style: 'tableCellRight'
        }
      ]);
    }

    calculRows.push([
      {
        text: 'Montant brut',
        style: 'tableCell'
      },
      {
        text: montant(montantBrut),
        style: 'tableCellRight'
      }
    ]);

    calculRows.push([
      {
        text: 'Retenues',
        style: 'tableCell'
      },
      {
        text: montant(retenues),
        style: 'tableCellRight'
      }
    ]);

    /*
     * NET A PAYER - LIGNE MISE EN AVANT
     */
    calculRows.push([
      {
        text: 'NET A PAYER',
        style: 'netAPayerLabel'
      },
      {
        text: montant(netAPayer),
        style: 'netAPayerValue'
      }
    ]);

    const calculPaieTable = {
      table: {
        widths: ['62%', '38%'],
        body: calculRows
      },
      layout: {
        hLineWidth: (i: number) =>
          i === calculRows.length - 1 ? 1 : 0.5,

        vLineWidth: () => 0.5,

        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,

        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) {
            return pdfColors.primary;
          }

          if (rowIndex === calculRows.length - 1) {
            return pdfColors.primaryLight;
          }

          return pdfColors.white;
        },

        paddingLeft: () => 7,
        paddingRight: () => 7,
        paddingTop: (rowIndex: number) =>
          rowIndex === calculRows.length - 1 ? 8 : 4,

        paddingBottom: (rowIndex: number) =>
          rowIndex === calculRows.length - 1 ? 8 : 4
      }
    };

    /*
     * ================================================================
     * SITUATION DU PAIEMENT
     * ================================================================
     */

    const situationPaiementTable = {
      table: {
        widths: ['33.33%', '33.33%', '33.34%'],
        body: [
          [
            {
              text: 'NET A PAYER',
              style: 'financialHeader'
            },
            {
              text: 'DEJA PAYE',
              style: 'financialHeader'
            },
            {
              text: 'RESTE A PAYER',
              style: 'financialHeader'
            }
          ],
          [
            {
              text: montant(netAPayer),
              style: 'financialMainValue'
            },
            {
              text: montant(montantDejaPaye),
              style: 'financialValue'
            },
            {
              text: montant(montantRestant),
              style: 'financialRemainingValue'
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,
        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) {
            return pdfColors.primary;
          }

          return pdfColors.white;
        },
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 6,
        paddingBottom: () => 6
      }
    };

    /*
     * ================================================================
     * HISTORIQUE DES PAIEMENTS
     * ================================================================
     */

    const paiementRows: any[] = [
      [
        {
          text: 'Date',
          style: 'tableHeaderSmall'
        },
        {
          text: 'Moyen',
          style: 'tableHeaderSmall'
        },
        {
          text: 'N° reçu',
          style: 'tableHeaderSmall'
        },
        {
          text: 'Reference',
          style: 'tableHeaderSmall'
        },
        {
          text: 'Montant',
          style: 'tableHeaderSmall',
          alignment: 'right'
        },
        {
          text: 'Etat',
          style: 'tableHeaderSmall'
        }
      ]
    ];

    if (paiements.length > 0) {
      paiements.forEach((paiement) => {
        paiementRows.push([
          {
            text: this.formatDate(
              paiement.datePaiement
            ),
            style: 'tableCellSmall'
          },
          {
            text:
              paiement.moyenPaiement ||
              'Non renseigne',
            style: 'tableCellSmall'
          },
          {
            text:
              paiement.numeroRecu ||
              'Non renseigne',
            style: 'tableCellSmall'
          },
          {
            text:
              paiement.reference ||
              '-',
            style: 'tableCellSmall'
          },
          {
            text: montant(paiement.montant),
            style: 'tableCellSmallRight'
          },
          {
            text:
              normaliserEtatPdf(
                paiement.etatLibelle
              ) || 'NON_RENSEIGNE',
            style: 'tableCellSmall'
          }
        ]);
      });
    } else {
      paiementRows.push([
        {
          text: 'Aucun paiement enregistre pour cette paie.',
          colSpan: 6,
          style: 'emptyCell',
          alignment: 'center'
        },
        {},
        {},
        {},
        {},
        {}
      ]);
    }

    const historiquePaiementsTable = {
      table: {
        widths: [
          '13%',
          '17%',
          '19%',
          '17%',
          '19%',
          '15%'
        ],
        body: paiementRows
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => pdfColors.border,
        vLineColor: () => pdfColors.border,

        fillColor: (rowIndex: number) =>
          rowIndex === 0
            ? pdfColors.primary
            : pdfColors.white,

        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4
      }
    };

    /*
     * ================================================================
     * AVANCE SUR SALAIRE
     * ================================================================
     */

    const avanceSection: any[] = [];

    if (demandeAvance) {
      avanceSection.push(
        {
          text: 'AVANCE SUR SALAIRE',
          style: 'sectionTitleCompact'
        },
        {
          table: {
            widths: ['20%', '30%', '20%', '30%'],
            body: [
              [
                {
                  text: 'N° demande',
                  style: 'labelCell'
                },
                {
                  text:
                    demandeAvance.numeroDemande ||
                    'Non renseigne',
                  style: 'valueCell'
                },
                {
                  text: 'Montant',
                  style: 'labelCell'
                },
                {
                  text:
                    montant(
                      demandeAvance.montant
                    ),
                  style: 'valueCellRight'
                }
              ],
              [
                {
                  text: 'Date',
                  style: 'labelCell'
                },
                {
                  text:
                    this.formatDate(
                      demandeAvance.dateDemande as any
                    ),
                  style: 'valueCell'
                },
                {
                  text: 'Etat',
                  style: 'labelCell'
                },
                {
                  text:
                    normaliserEtatPdf(
                      demandeAvance.etatLibelle
                    ) || 'NON_RENSEIGNE',
                  style: 'valueCell'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => pdfColors.border,
            vLineColor: () => pdfColors.border,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4
          }
        }
      );
    }

    /*
     * ================================================================
     * DOCUMENT
     * ================================================================
     */

    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',

      /*
       * Marges volontairement réduites pour garantir une page.
       */
      pageMargins: [30, 28, 30, 48],

      defaultStyle: {
        font: 'Roboto',
        fontSize: 8,
        color: pdfColors.text
      },

      styles: {
        organisationName: {
          fontSize: 11,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 0, 0, 2]
        },

        organisationInfo: {
          fontSize: 7,
          color: pdfColors.textLight,
          margin: [0, 0.5, 0, 0]
        },

        documentTitle: {
          fontSize: 16,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'center'
        },

        documentSubtitle: {
          fontSize: 8,
          color: pdfColors.textLight,
          alignment: 'center',
          margin: [0, 2, 0, 0]
        },

        sectionTitle: {
          fontSize: 8.5,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 11, 0, 5]
        },

        sectionTitleCompact: {
          fontSize: 8.5,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 10, 0, 5]
        },
        labelCell: {
          fontSize: 7,
          bold: true,
          color: pdfColors.textLight,
          fillColor: pdfColors.blueSoft,
          margin: [0, 1, 0, 1]
        },

        valueCell: {
          fontSize: 7.5,
          color: pdfColors.text,
          margin: [0, 1, 0, 1]
        },

        valueCellRight: {
          fontSize: 7.5,
          color: pdfColors.text,
          alignment: 'right',
          margin: [0, 1, 0, 1]
        },

        tableHeader: {
          fontSize: 7.5,
          bold: true,
          color: pdfColors.white,
          margin: [0, 1, 0, 1]
        },

        tableCell: {
          fontSize: 7.5,
          color: pdfColors.text,
          margin: [0, 1, 0, 1]
        },

        tableCellRight: {
          fontSize: 7.5,
          color: pdfColors.text,
          alignment: 'right',
          margin: [0, 1, 0, 1]
        },

        netAPayerLabel: {
          fontSize: 10,
          bold: true,
          color: pdfColors.primaryDark,
          margin: [0, 2, 0, 2]
        },

        netAPayerValue: {
          fontSize: 11,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'right',
          margin: [0, 2, 0, 2]
        },

        financialHeader: {
          fontSize: 7,
          bold: true,
          color: pdfColors.white,
          alignment: 'center'
        },

        financialMainValue: {
          fontSize: 11,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'center'
        },

        financialValue: {
          fontSize: 9.5,
          bold: true,
          color: pdfColors.text,
          alignment: 'center'
        },

        financialRemainingValue: {
          fontSize: 10.5,
          bold: true,
          color: pdfColors.primaryDark,
          alignment: 'center'
        },

        tableHeaderSmall: {
          fontSize: 6.5,
          bold: true,
          color: pdfColors.white,
          margin: [0, 1, 0, 1]
        },

        tableCellSmall: {
          fontSize: 6.5,
          color: pdfColors.text,
          margin: [0, 1, 0, 1]
        },

        tableCellSmallRight: {
          fontSize: 6.5,
          color: pdfColors.text,
          alignment: 'right',
          margin: [0, 1, 0, 1]
        },

        emptyCell: {
          fontSize: 7,
          color: pdfColors.textLight,
          italics: true,
          margin: [0, 3, 0, 3]
        }
      },

      content: [
        /*
         * ============================================================
         * EN-TETE
         * ============================================================
         */
        {
          table: {
            widths: ['15%', '55%', '30%'],
            body: [
              [
                {
                  stack: [logoBlock],
                  alignment: 'left',
                  margin: [0, 0, 0, 0]
                },
                {
                  stack: organisationInformations,
                  alignment: 'left'
                },
                {
                  stack: [
                    {
                      text: 'BULLETIN DE PAIE',
                      fontSize: 10,
                      bold: true,
                      color: pdfColors.primaryDark,
                      alignment: 'right'
                    },
                    {
                      text: periode,
                      fontSize: 8,
                      color: pdfColors.textLight,
                      alignment: 'right',
                      margin: [0, 2, 0, 0]
                    },
                    {
                      text: numeroPaie,
                      fontSize: 7,
                      color: pdfColors.textLight,
                      alignment: 'right',
                      margin: [0, 2, 0, 0]
                    }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        /*
         * Ligne bleue
         */
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 535,
              y2: 0,
              lineWidth: 1.2,
              lineColor: pdfColors.primary
            }
          ],
          margin: [0, 5, 0, 6]
        },

        /*
         * Etat
         */
        {
          columns: [
            {
              text: `Periode : ${periode}`,
              fontSize: 7.5,
              color: pdfColors.textLight,
              alignment: 'left'
            },
            {
              text: etatPaieAffichage,
              fontSize: 7.5,
              bold: true,
              color: etatColor,
              fillColor: etatBackground,
              alignment: 'center',
              margin: [5, 2, 5, 2]
            }
          ],
          columnGap: 10
        },

        /*
         * ============================================================
         * 1. PERSONNEL
         * ============================================================
         */
        {
          text: '1. INFORMATIONS DU PERSONNEL',
          style: 'sectionTitle'
        },

        personnelTable,

        /*
         * ============================================================
         * 2. CONTRAT
         * ============================================================
         */
        {
          text: '2. INFORMATIONS CONTRACTUELLES',
          style: 'sectionTitle'
        },

        contratTable,

        /*
         * ============================================================
         * 3. CALCUL DE LA PAIE
         * ============================================================
         */
        {
          text: '3. CALCUL DE LA PAIE',
          style: 'sectionTitle'
        },

        calculPaieTable,

        /*
         * ============================================================
         * OBSERVATION
         * ============================================================
         */
        ...(p.observation
          ? [
            {
              text: p.observation,
              fontSize: 6.8,
              color: pdfColors.textLight,
              italics: true,
              margin: [0, 4, 0, 0]
            }
          ]
          : []),

        /*
         * ============================================================
         * 4. SITUATION DU REGLEMENT
         * ============================================================
         */
        {
          text: '4. SITUATION DU REGLEMENT',
          style: 'sectionTitle'
        },

        situationPaiementTable,

        /*
         * ============================================================
         * 5. HISTORIQUE
         * ============================================================
         */
        {
          text: '5. HISTORIQUE DES PAIEMENTS',
          style: 'sectionTitle'
        },

        historiquePaiementsTable,

        /*
         * ============================================================
         * AVANCE
         * ============================================================
         */
        ...avanceSection,
        {
          text: 'SIGNATURES',
          style: 'sectionTitleCompact',
          margin: [0, 16, 0, 7]
        },

        {
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'Le Responsable / Comptable',
                  bold: true,
                  fontSize: 7.5,
                  color: pdfColors.text,
                  alignment: 'center'
                },
                {
                  text: '\n\n\n____________________________',
                  fontSize: 7,
                  alignment: 'center'
                },
                {
                  text: 'Cachet de l\'etablissement',
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'center',
                  margin: [0, 3, 0, 0]
                }
              ]
            },
            {
              width: '50%',
              stack: [
                {
                  text: 'Le Salarie',
                  bold: true,
                  fontSize: 7.5,
                  color: pdfColors.text,
                  alignment: 'center'
                },
                {
                  text: '\n\n\n____________________________',
                  fontSize: 7,
                  alignment: 'center'
                },
                {
                  text: personnelNom,
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'center',
                  margin: [0, 3, 0, 0]
                }
              ]
            }
          ],
          margin: [0, 3, 0, 0]
        }
      ],


      footer: (
        currentPage: number,
        pageCount: number
      ) => {
        return {
          margin: [30, 8, 30, 0],

          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 535,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: pdfColors.border
                }
              ]
            },

            {
              columns: [
                {
                  width: '40%',
                  text: 'Document genere avec Scoolli · scoolli.com',
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'left',
                  margin: [0, 4, 0, 0]
                },
                {
                  width: '20%',
                  text: `Page ${currentPage} / ${pageCount}`,
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'center',
                  margin: [0, 4, 0, 0]
                },
                {
                  width: '40%',
                  text: 'Une solution Wokite Technologies & Innovation',
                  fontSize: 6.5,
                  color: pdfColors.textLight,
                  alignment: 'right',
                  margin: [0, 4, 0, 0]
                }
              ]
            }
          ]
        };
      }
    };

    return documentDefinition;
  }

}